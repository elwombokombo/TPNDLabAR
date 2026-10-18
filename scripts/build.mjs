import { cp, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const destination = path.join(root, 'dist');
await mkdir(destination, { recursive: true });
for (const file of ['index.html', 'styles.css', 'print.css', 'marcadores.html', '.nojekyll', 'src', 'assets']) {
  await cp(path.join(root, file), path.join(destination, file), { recursive: true });
}
for (const file of ['assets/vendor/aframe-1.8.0.min.js', 'assets/vendor/ar-3.4.8.js', 'assets/ar/camera_para.dat', ...['hiro', 'kanji', 'letterA'].flatMap(name => ['assets/markers/' + name + '.png', 'assets/markers/' + name + '.patt'])]) {
  if (!(await readFile(path.join(destination, file))).length) throw new Error('Recurso vacío: ' + file);
}
console.log('Sitio estático preparado en dist/');
