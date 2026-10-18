// Lugares y pistas editables por el equipo.
export const GAME = {
  title: 'El secreto de Sacré Coeur',
  storageKey: 'sacre-coeur:expedicion:v1',
  holdMs: 900,
  treasure: 'El verdadero tesoro es lo que descubrimos juntos.',
  ending: 'La llave despertó la memoria, la brújula te trajo hasta aquí y el encuentro abrió el cofre. Ahora sos parte del secreto de Sacré Coeur.',
};
export const STATIONS = [
  {
    id: 'entrada', number: '01', name: 'La llave', place: 'Entrada',
    artifact: 'Llave de la memoria', pattern: 'hiro', object: 'key',
    hint: 'Tu expedición empieza en la entrada del edificio. Buscá el cartel con el primer marcador.',
    clue: 'La llave ya es tuya. Ahora buscá el lugar donde las historias esperan en silencio: la biblioteca.',
  },
  {
    id: 'biblioteca', number: '02', name: 'La brújula', place: 'Biblioteca',
    artifact: 'Brújula de las historias', pattern: 'kanji', object: 'compass',
    hint: 'Entre páginas e historias se esconde el segundo sello. Buscá el marcador de la biblioteca.',
    clue: 'La brújula apunta al cielo abierto. Seguí hacia el patio: allí te espera el último sello.',
  },
  {
    id: 'patio', number: '03', name: 'El encuentro', place: 'Patio',
    artifact: 'Cofre del encuentro', pattern: 'letterA', object: 'chest',
    hint: 'La última parada está bajo el cielo abierto. Encontrá el marcador en el patio.',
    clue: 'Los tres sellos están reunidos. El cofre de Sacré Coeur se abre para vos.',
  },
];
