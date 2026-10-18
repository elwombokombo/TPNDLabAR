import { STATIONS } from './config.js';
export function newGame() {
  return { version: 1, found: [], startedAt: null, completedAt: null };
}
export function restoreGame(raw, now = Date.now()) {
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Array.isArray(value.found)) return newGame();
    if (value.found.length > STATIONS.length || !value.found.every((id, i) => id === STATIONS[i].id)) return newGame();
    const validTime = t => Number.isFinite(t) && t > 0 && t <= now;
    if (!validTime(value.startedAt)) return newGame();
    const complete = value.found.length === STATIONS.length;
    if (complete && (!validTime(value.completedAt) || value.completedAt < value.startedAt)) return newGame();
    return { version: 1, found: [...value.found], startedAt: value.startedAt, completedAt: complete ? value.completedAt : null };
  } catch { return newGame(); }
}
export function startGame(state, now = Date.now()) {
  return state.startedAt ? state : { ...state, startedAt: now };
}
export function collectMarker(state, id, now = Date.now()) {
  const index = STATIONS.findIndex(station => station.id === id);
  if (index < 0) return { state, outcome: 'unknown' };
  if (state.found.includes(id)) return { state, outcome: 'duplicate' };
  if (index !== state.found.length) return { state, outcome: 'out-of-order' };
  const found = [...state.found, id];
  const next = { ...startGame(state, now), found, completedAt: found.length === STATIONS.length ? now : null };
  return { state: next, outcome: next.completedAt ? 'complete' : 'collected' };
}
export function elapsedSeconds(state, now = Date.now()) {
  return state.startedAt ? Math.max(0, Math.floor(((state.completedAt ?? now) - state.startedAt) / 1000)) : 0;
}
export function formatTime(seconds) {
  return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
}
