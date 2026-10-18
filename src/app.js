import { GAME, STATIONS } from './config.js';
import { newGame, restoreGame, startGame, collectMarker, elapsedSeconds, formatTime } from './game.js';
import { loadAR, createScene } from './ar.js';
const $ = id => document.getElementById(id);
const demo = new URLSearchParams(location.search).get('demo') === '1';
const storageKey = GAME.storageKey + (demo ? ':demo' : '');
let state;
try { state = restoreGame(localStorage.getItem(storageKey)); } catch { state = newGame(); }
let ar, starting = false, active = false, sound = false, audio, cameraTimer;
const pending = new Map();
const visibleMarkers = new Set();
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Se puede jugar sin almacenamiento. */ }
}
function clearPending() {
  for (const timer of pending.values()) clearTimeout(timer);
  pending.clear();
  visibleMarkers.clear();
  $('hold-track').hidden = true;
}
function announce(message) { $('scan-status').textContent = message; }
function updateUI() {
  const count = state.found.length;
  $('progress-label').textContent = count + ' DE 3 SELLOS';
  $('progress-steps').replaceChildren(...STATIONS.map((station, i) => {
    const item = document.createElement('li');
    item.className = i < count ? 'found' : i === count ? 'current' : '';
    if (i === count) item.setAttribute('aria-current', 'step');
    item.textContent = (i < count ? '✓ ' : station.number + ' ') + station.place;
    return item;
  }));
  $('resume-note').hidden = !state.startedAt || count === 3;
  $('start-button').textContent = count === 3 ? 'Volver a ver el tesoro ↗' : state.startedAt ? 'Continuar la expedición ↗' : demo ? 'Comenzar el ensayo ↗' : 'Comenzar la expedición ↗';
  $('clue-number').textContent = String(Math.min(count + 1, 3)).padStart(2, '0') + ' / 03';
  $('clue-kicker').textContent = count === 3 ? 'LOS TRES SELLOS REUNIDOS' : count ? 'TU SIGUIENTE DESTINO' : 'TU PRIMER DESTINO';
  $('clue-title').textContent = count === 3 ? 'El secreto está en tus manos.' : count === 0 ? 'Todo empieza en la entrada.' : 'Seguí hacia ' + (count === 1 ? 'la biblioteca.' : 'el patio.');
  $('clue-text').textContent = count === 0 ? STATIONS[0].hint : STATIONS[count - 1].clue;
  $('treasure-button').hidden = count !== 3;
  tick();
}
function tick() { $('timer').textContent = formatTime(elapsedSeconds(state)); }
setInterval(tick, 1000);
function chime(final = false) {
  if (!sound || !audio) return;
  audio.resume().catch(() => {});
  const notes = final ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25];
  notes.forEach((frequency, i) => {
    const osc = audio.createOscillator(), gain = audio.createGain();
    const start = audio.currentTime + i * .15;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(.1, start + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, start + .45);
    osc.connect(gain).connect(audio.destination);
    osc.start(start); osc.stop(start + .5);
  });
}
function revealTreasure() {
  if (state.found.length !== 3) return;
  $('ending-text').textContent = GAME.ending;
  $('treasure-text').textContent = GAME.treasure;
  $('final-time').textContent = formatTime(elapsedSeconds(state)) + ' DE AVENTURA';
  $('demo-ending').hidden = !demo;
  if (!$('treasure-dialog').open) $('treasure-dialog').showModal();
}
function commitMarker(id) {
  const result = collectMarker(state, id);
  if (result.outcome === 'duplicate' || result.outcome === 'unknown') return;
  if (result.outcome === 'out-of-order') {
    announce('Este sello viene después. Primero buscá: ' + STATIONS[state.found.length].place + '.');
    return;
  }
  state = result.state;
  save(); clearPending(); updateUI();
  const station = STATIONS.find(item => item.id === id);
  announce('Sello recuperado: ' + station.name + '.');
  if (navigator.vibrate) navigator.vibrate(result.outcome === 'complete' ? [90, 60, 150] : 80);
  chime(result.outcome === 'complete');
  if (result.outcome === 'complete') {
    ar?.openTreasure();
    // Deja ver la apertura del cofre antes del mensaje final.
    setTimeout(() => { if (active && state.found.length === 3) revealTreasure(); }, 1600);
  } else {
    $('found-artifact').textContent = station.artifact;
    $('found-symbol').textContent = id === 'entrada' ? '⚿' : '✧';
    $('found-title').textContent = id === 'entrada' ? 'La memoria despierta.' : 'Ya encontraste el rumbo.';
    $('found-clue').textContent = station.clue;
    $('found-dialog').showModal();
  }
}
function markerFound(id) {
  if (!active || document.hidden || $('found-dialog').open || $('treasure-dialog').open || $('reset-dialog').open) return;
  visibleMarkers.add(id);
  if (state.found.includes(id)) {
    announce('Ya recuperaste este sello. ' + (state.found.length === 3 ? '¡Expedición completa!' : 'Seguí hacia: ' + STATIONS[state.found.length].place + '.'));
    if (id === 'patio' && state.completedAt) ar?.openTreasure();
    return;
  }
  const next = STATIONS[state.found.length];
  if (next?.id !== id) {
    announce('Este sello viene después. Primero buscá: ' + next?.place + '.');
    return;
  }
  if (pending.has(id)) return;
  announce('Sello a la vista. Sostené la cámara quieta…');
  $('hold-track').hidden = false;
  pending.set(id, setTimeout(() => {
    pending.delete(id);
    $('hold-track').hidden = true;
    if (visibleMarkers.has(id) && active && !document.hidden) commitMarker(id);
  }, GAME.holdMs));
}
function markerLost(id) {
  visibleMarkers.delete(id);
  if (pending.has(id)) {
    clearTimeout(pending.get(id)); pending.delete(id);
    $('hold-track').hidden = true;
    announce('Volvé a encuadrar el marcador completo.');
  }
}
function cameraError(message) {
  clearTimeout(cameraTimer); clearPending();
  $('camera-help').hidden = false;
  $('camera-error-text').textContent = message || 'Permití el acceso a la cámara en la configuración del navegador. Usá Chrome o Safari y abrí el juego con HTTPS o desde localhost.';
  announce('La cámara necesita tu atención.');
}
window.addEventListener('camera-init', () => { if (!active || document.hidden) ar?.pause(); });
window.addEventListener('camera-error', () => cameraError());
window.addEventListener('arjs-video-loaded', () => {
  clearTimeout(cameraTimer); $('camera-help').hidden = true;
  announce('Buscá el marcador de ' + (STATIONS[state.found.length]?.place ?? 'tu expedición') + '.');
});
async function start() {
  if (starting) return;
  active = true;
  state = startGame(state); save();
  $('landing').hidden = true; $('expedition').hidden = false;
  document.body.classList.add('scanning'); updateUI();
  if (state.found.length === 3) {
    if (demo) document.body.classList.add('demo-mode');
    announce('Los tres sellos est\u00e1n reunidos.'); revealTreasure(); return;
  }
  if (demo) {
    document.body.classList.add('demo-mode');
    $('mode-label').textContent = 'MODO ENSAYO';
    $('demo-banner').hidden = false; $('demo-controls').hidden = false;
    announce('Elegí un marcador para ensayar el recorrido.'); return;
  }
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    cameraError('La cámara necesita una conexión HTTPS. Abrí la dirección publicada del juego; en una computadora también podés usar localhost.'); return;
  }
  if (ar) { ar.resume(); announce('Apuntá al siguiente marcador.'); return; }
  starting = true;
  try {
    announce('Preparando la cámara…');
    await loadAR();
    if (!active) return;
    cameraTimer = setTimeout(() => cameraError('La cámara tarda en responder. Revisá los permisos del navegador y que ninguna otra aplicación la esté usando.'), 30000);
    ar = createScene($('ar-container'), { found: markerFound, lost: markerLost });
  } catch {
    cameraError('No se pudieron cargar los recursos de realidad aumentada. Revisá la conexión y volvé a intentar.');
  } finally { starting = false; }
}
$('start-button').addEventListener('click', start);
$('home-button').addEventListener('click', () => {
  active = false; clearPending(); clearTimeout(cameraTimer); ar?.pause();
  $('expedition').hidden = true; $('landing').hidden = false;
  document.body.classList.remove('scanning', 'demo-mode'); updateUI();
});
$('retry-button').addEventListener('click', () => location.reload());
$('treasure-button').addEventListener('click', revealTreasure);
$('found-dialog').addEventListener('close', () => announce('Seguí la pista hacia: ' + (STATIONS[state.found.length]?.place ?? 'el tesoro') + '.'));
$('reset-button').addEventListener('click', () => { clearPending(); $('reset-dialog').showModal(); });
$('reset-dialog').addEventListener('close', () => {
  if ($('reset-dialog').returnValue !== 'reset') return;
  state = newGame(); save(); clearPending();
  location.reload();
});
$('sound-button').addEventListener('click', () => {
  if (!audio) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) { announce('Este navegador no admite los sonidos del juego.'); return; }
    audio = new Audio();
  }
  sound = !sound;
  $('sound-button').setAttribute('aria-pressed', String(sound));
  $('sound-button').setAttribute('aria-label', sound ? 'Desactivar sonido' : 'Activar sonido');
  chime();
});
document.addEventListener('visibilitychange', () => {
  clearPending();
  if (!ar || !active) return;
  if (document.hidden) ar.pause(); else ar.resume();
});
window.addEventListener('pagehide', () => {
  clearPending();
  document.querySelector('#arjs-video')?.srcObject?.getTracks().forEach(track => track.stop());
});
if (demo) {
  $('demo-link').href = './'; $('demo-link').textContent = 'Ir a la expedición con cámara →';
  STATIONS.forEach(station => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = station.number + ' · ' + station.place;
    button.dataset.station = station.id;
    button.addEventListener('click', () => { clearPending(); markerFound(station.id); });
    $('demo-buttons').appendChild(button);
  });
}
updateUI();
