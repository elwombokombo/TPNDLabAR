import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = process.env.PLAYWRIGHT_MODULE
  ? await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href)
  : await import('playwright-core');
const server = spawn(process.execPath, ['scripts/serve.mjs'], { env: { ...process.env, PORT: '4273' }, stdio: ['ignore', 'pipe', 'inherit'] });
let browser;
try {
  await new Promise((resolve, reject) => {
    server.stdout.on('data', chunk => { if (String(chunk).includes('Local:')) resolve(); });
    server.on('error', reject); server.on('exit', code => reject(new Error('Server exited: ' + code)));
  });
  await mkdir('artifacts', { recursive: true });
  browser = await chromium.launch({ headless: true, args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = 'http://localhost:4273';
  const text = async (id, value) => page.waitForFunction(({id,value}) => document.getElementById(id)?.textContent.includes(value), {id,value});
  await page.goto(base + '/?demo=1');
  await page.screenshot({ path: 'artifacts/portada-mobile.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.click('#start-button');
  await page.screenshot({ path: 'artifacts/ensayo-mobile.png', fullPage: true });
  await page.click('[data-station=patio]');
  await text('scan-status', 'Primero buscá: Entrada');
  await text('progress-label', '0 DE 3');
  await page.click('[data-station=entrada]');
  await page.locator('#found-dialog[open]').waitFor();
  await text('progress-label', '1 DE 3');
  await page.click('#found-continue');
  await page.reload();
  await page.click('#start-button');
  await text('progress-label', '1 DE 3');
  await page.click('[data-station=entrada]');
  await text('scan-status', 'Ya recuperaste');
  await text('progress-label', '1 DE 3');
  await page.click('[data-station=biblioteca]');
  await page.locator('#found-dialog[open]').waitFor();
  await page.click('#found-continue');
  await page.click('[data-station=patio]');
  await page.locator('#treasure-dialog[open]').waitFor();
  await text('progress-label', '3 DE 3');
  await page.screenshot({ path: 'artifacts/tesoro-mobile.png' });
  const final = await page.locator('#timer').textContent();
  await page.waitForTimeout(1100);
  assert.equal(await page.locator('#timer').textContent(), final);
  assert.equal(await page.evaluate(() => localStorage.getItem('sacre-coeur:expedicion:v1')), null);
  await page.click('#treasure-dialog button');
  await page.click('#reset-button');
  await page.click('#reset-dialog button[value=cancel]');
  await text('progress-label', '3 DE 3');
  await page.click('#reset-button');
  await Promise.all([page.waitForURL(base + '/?demo=1'), page.click('#reset-dialog button[value=reset]')]);
  await page.waitForLoadState();
  await page.click('#start-button');
  await text('progress-label', '0 DE 3');
  console.log('OK: ensayo, orden, duplicados, persistencia, aislamiento, final y reinicio.');

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  desktop.on('pageerror', error => errors.push(error.message));
  await desktop.goto(base);
  await desktop.screenshot({ path: 'artifacts/portada-desktop.png', fullPage: true });
  await desktop.goto(base + '/marcadores.html');
  await desktop.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
  assert.equal(await desktop.locator('.marker-sheet').count(), 3);
  const pdf = await desktop.pdf({ path: 'artifacts/marcadores-control.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
  assert.equal((pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length, 3);
  console.log('OK: diseño móvil/escritorio y tres hojas A4.');

  for (const pattern of ['hiro', 'kanji', 'letterA']) {
    await desktop.goto(base + '/tests/ar-fixture.html?pattern=' + pattern);
    await desktop.waitForFunction(() => window.detected === true, null, { timeout: 20000 });
    assert.equal(await desktop.evaluate(() => AFRAME.version), '1.8.0');
    assert.ok(await desktop.evaluate(() => document.querySelector('a-marker').object3D.visible));
    await desktop.waitForTimeout(600);
    await desktop.screenshot({ path: 'artifacts/ar-' + pattern + '.png' });
    console.log('OK: AR.js reconoce el patrón ' + pattern + ' y A-Frame renderiza el modelo.');
  }
  await desktop.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640; canvas.height = 480;
      const ctx = canvas.getContext('2d');
      let img;
      window.__qaMarker = async pattern => {
        if (pattern === 'none') { img = null; return; }
        const next = new Image();
        next.src = '/assets/markers/' + pattern + '.png';
        await next.decode(); img = next;
      };
      await window.__qaMarker('hiro');
      function draw() {
        ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 640, 480);
        if (img) ctx.drawImage(img, 130, 50, 380, 380);
        requestAnimationFrame(draw);
      }
      draw(); return canvas.captureStream(30);
    };
  });
  await desktop.goto(base);
  await desktop.click('#start-button');
  await desktop.waitForFunction(() => document.querySelector('#arjs-video')?.readyState >= 2, null, { timeout: 20000 });
  assert.equal(await desktop.locator('a-marker').count(), 3);
  assert.equal(await desktop.locator('#camera-help').isVisible(), false);
  await desktop.waitForFunction(() => document.querySelector('#marker-entrada')?.object3D.visible);
  await desktop.evaluate(() => window.__qaMarker('none'));
  await desktop.waitForTimeout(1100);
  assert.ok((await desktop.locator('#progress-label').textContent()).includes('0 DE 3'));
  await desktop.evaluate(() => window.__qaMarker('hiro'));
  await desktop.waitForFunction(() => document.querySelector('#marker-entrada')?.object3D.visible);
  await desktop.waitForTimeout(200);
  await desktop.screenshot({ path: 'artifacts/camara-desktop.png' });
  await desktop.locator('#found-dialog[open]').waitFor();
  assert.ok((await desktop.locator('#progress-label').textContent()).includes('1 DE 3'));
  await desktop.click('#found-continue');
  await desktop.evaluate(() => window.__qaMarker('kanji'));
  await desktop.locator('#found-dialog[open]').waitFor();
  assert.ok((await desktop.locator('#progress-label').textContent()).includes('2 DE 3'));
  await desktop.click('#found-continue');
  await desktop.evaluate(() => window.__qaMarker('letterA'));
  await desktop.waitForFunction(() => document.querySelector('#marker-patio')?.object3D.visible);
  await desktop.waitForFunction(() => document.querySelector('[data-treasure-gem]')?.getAttribute('visible') === true);
  await desktop.screenshot({ path: 'artifacts/cofre-abierto.png' });
  await desktop.locator('#treasure-dialog[open]').waitFor();
  assert.ok((await desktop.locator('#progress-label').textContent()).includes('3 DE 3'));
  await desktop.click('#treasure-dialog button');
  await desktop.click('#home-button');
  assert.equal(await desktop.evaluate(() => document.querySelector('#arjs-video').srcObject.getVideoTracks()[0].enabled), false);
  console.log('OK: recorrido con patrones reales, captura cancelada y arranque de cámara con fuente de prueba y pausa al volver.');

  await desktop.reload();
  await desktop.click('#start-button');
  await desktop.locator('#treasure-dialog[open]').waitFor();
  await desktop.click('#treasure-dialog button');
  assert.equal(await desktop.locator('#reset-button').isVisible(), true);
  console.log('OK: una partida completada sigue permitiendo reiniciar despues de recargar.');

  const denied = await browser.newPage();
  denied.on('pageerror', error => errors.push(error.message));
  await denied.addInitScript(() => { navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('Denied', 'NotAllowedError')); });
  await denied.goto(base); await denied.click('#start-button');
  await denied.locator('#camera-help').waitFor();
  console.log('OK: instrucciones cuando se deniega la cámara.');
  assert.deepEqual(errors, []);
  console.log('Verificación de navegador completada sin errores de JavaScript.');
} finally {
  await browser?.close();
  server.kill();
}
