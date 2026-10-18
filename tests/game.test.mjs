import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, startGame, collectMarker, restoreGame, elapsedSeconds, formatTime } from '../src/game.js';
test('recorrido: entrada → biblioteca → patio; sin duplicados y con tiempo final fijo', () => {
  let state = startGame(newGame(), 1000);
  assert.equal(collectMarker(state, 'patio', 2000).outcome, 'out-of-order');
  assert.equal(collectMarker(state, 'inexistente', 2000).outcome, 'unknown');
  state = collectMarker(state, 'entrada', 4000).state;
  const duplicate = collectMarker(state, 'entrada', 5000);
  assert.equal(duplicate.outcome, 'duplicate');
  assert.equal(duplicate.state, state);
  state = collectMarker(state, 'biblioteca', 6000).state;
  const final = collectMarker(state, 'patio', 11000);
  assert.equal(final.outcome, 'complete');
  assert.deepEqual(final.state.found, ['entrada', 'biblioteca', 'patio']);
  assert.equal(elapsedSeconds(final.state, 90000), 10);
  assert.equal(startGame(final.state, 91000).startedAt, 1000);
});
test('restaura progreso válido; los datos corruptos no permiten saltar estaciones', () => {
  const valid = collectMarker(startGame(newGame(), 1000), 'entrada', 2000).state;
  assert.deepEqual(restoreGame(JSON.stringify(valid), 5000), valid);
  for (const invalid of [null, 'invalid', JSON.stringify({ ...valid, found: ['patio'] }), JSON.stringify({ ...valid, startedAt: 9000 }), JSON.stringify({ ...valid, found: ['entrada', 'entrada'] }), JSON.stringify({ ...valid, found: ['entrada', 'biblioteca', 'patio'], completedAt: null })]) {
    assert.deepEqual(restoreGame(invalid, 5000), newGame());
  }
});
test('reloj único y minutos de más de dos dígitos', () => {
  const state = startGame(newGame(), 1000);
  assert.equal(startGame(state, 5000), state);
  assert.equal(formatTime(elapsedSeconds(state, 66000)), '01:05');
  assert.equal(formatTime(6000), '100:00');
  assert.equal(elapsedSeconds(newGame()), 0);
});
