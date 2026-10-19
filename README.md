# El secreto de Sacré Coeur

Juego web de búsqueda del tesoro con **AR.js y A-Frame**, desarrollado para el Edificio Sacré Coeur. El recorrido tiene tres estaciones: **entrada → biblioteca → patio**. Se juega desde el navegador con la cámara, sin instalar una aplicación.

## Enlaces del proyecto

| Enlace | Para qué sirve |
| --- | --- |
| **[Jugar en GitHub Pages](https://elwombokombo.github.io/TPNDLabAR/)** | **URL del juego para entregar y compartir con los testers.** |
| [Ensayo sin cámara](https://elwombokombo.github.io/TPNDLabAR/?demo=1) | Probar las pistas y el progreso mediante botones. |
| [Marcadores para imprimir](https://elwombokombo.github.io/TPNDLabAR/marcadores.html) | Imprimir los tres carteles, uno por hoja A4. |
| [Código en GitHub](https://github.com/elwombokombo/TPNDLabAR) | Consultar y modificar el proyecto. |
| [Estado de las publicaciones](https://github.com/elwombokombo/TPNDLabAR/actions/workflows/pages.yml) | Comprobar que el último cambio se publicó correctamente. |

Para la consigna, se entrega la URL del juego; el enlace al repositorio permite consultar el código.

## Cómo probar el juego

1. Imprimí los marcadores o mostralos en otra pantalla.
2. Abrí el juego desde el celular, tocá **Comenzar la expedición** y permití el acceso a la cámara.
3. Encuadrá el marcador completo, incluido el borde negro, y sostené la cámara quieta aproximadamente un segundo.
4. Escaneá los tres en el orden indicado y seguí las pistas.

| Orden | Ubicación | Marcador | Objeto que aparece |
| --- | --- | --- | --- |
| 1 | Entrada | Hiro | Llave dorada animada. La pista lleva a la biblioteca. |
| 2 | Biblioteca | Kanji | Brújula animada. La pista lleva al patio. |
| 3 | Patio | Letra A | Cofre que se abre, gema y mensaje final. |

Podés probarlos sobre una mesa: el juego identifica imágenes, no usa GPS. Los lugares forman parte del recorrido físico que organiza el equipo. Los dibujos son marcadores AR, no códigos QR: se escanean desde el juego abierto en el navegador.

El **ensayo sin cámara** permite recorrer la historia con botones y guarda su progreso por separado. Para comprobar la realidad aumentada hay que usar la cámara y los marcadores.

## Qué hace el juego

- Confirma una detección cuando el marcador permanece visible durante **900 ms**. Si se pierde antes, cancela esa captura.
- Pide los marcadores en orden; repetir uno no suma y encontrar otro antes de tiempo indica dónde continuar.
- Mantiene la pista en pantalla después de apartar la cámara.
- Guarda el avance en el navegador del dispositivo mediante `localStorage`.
- Muestra un cronómetro desde el inicio, incluidas las pausas, y lo detiene al completar los tres sellos.
- Permite activar sonidos con **♪** y reiniciar la partida con confirmación.
- Revela el tesoro al recuperar los tres sellos.

La historia es ficticia. El mapa de portada es una ilustración conceptual, no un plano real del edificio. Las imágenes de la cámara se procesan en el navegador: este proyecto no las graba ni las sube a un servidor.

## Archivos y carpetas

### Páginas y estilos

| Archivo | Función |
| --- | --- |
| [`index.html`](index.html) | Página principal: portada, explorador de cámara, progreso, pistas y ventanas de descubrimiento, final y reinicio. Carga `src/app.js`. |
| [`styles.css`](styles.css) | Diseño de la portada y del juego, adaptación a celulares, animaciones y estilos de las ventanas. Importa `assets/base.css`. |
| [`marcadores.html`](marcadores.html) | Página para preparar e imprimir los carteles. Carga `src/print.js`. |
| [`print.css`](print.css) | Diseño de los carteles y reglas de impresión: tres páginas A4, una por marcador. |
| [`README.md`](README.md) | Enlaces, explicación del código e instrucciones para desarrollar, probar y publicar. |

### `src/`: funcionamiento del juego

| Archivo | Función |
| --- | --- |
| [`src/config.js`](src/config.js) | Configuración compartida: título, mensaje final, tiempo de confirmación, clave de guardado y datos de cada estación, incluidas sus pistas y su patrón. |
| [`src/app.js`](src/app.js) | Coordina la interfaz con el juego: inicio, cámara, eventos de detección, confirmación de sellos, guardado, reloj, sonidos, modo ensayo y reinicio. |
| [`src/ar.js`](src/ar.js) | Carga las bibliotecas AR al empezar, crea la escena y los tres marcadores, construye los modelos 3D y controla la pausa de la cámara y la apertura del cofre. |
| [`src/game.js`](src/game.js) | Reglas independientes de la cámara: crear y restaurar partidas, validar el orden, evitar duplicados y calcular el tiempo. Estas funciones se prueban sin abrir un navegador. |
| [`src/print.js`](src/print.js) | Genera los tres carteles a partir de `config.js`, agrega la URL desde la que se abrió la página y conecta el botón de impresión. |

Los modelos son combinaciones de primitivas de A-Frame, como cajas, toros, conos y un octaedro. No hay archivos de modelos 3D externos.

### `assets/`: recursos que usa el navegador

| Archivo o grupo | Función |
| --- | --- |
| [`assets/base.css`](assets/base.css) | Estilos base: esquema de color, ancho mínimo de la página y color de selección del texto. |
| [`assets/icon.svg`](assets/icon.svg) | Icono de la pestaña del navegador. |
| [`assets/ar/camera_para.dat`](assets/ar/camera_para.dat) | Parámetros de calibración que utiliza AR.js para estimar la posición del marcador y proyectar el objeto. |
| [`hiro.png`](assets/markers/hiro.png), [`kanji.png`](assets/markers/kanji.png), [`letterA.png`](assets/markers/letterA.png) | Imágenes de los tres marcadores, dentro de `assets/markers/`. Se usan para imprimir y para las pruebas visuales. |
| [`hiro.patt`](assets/markers/hiro.patt), [`kanji.patt`](assets/markers/kanji.patt), [`letterA.patt`](assets/markers/letterA.patt) | Patrones numéricos correspondientes a esas imágenes. AR.js los compara con la cámara para reconocer cada marcador. |
| [`assets/vendor/aframe-1.8.0.min.js`](assets/vendor/aframe-1.8.0.min.js) | Biblioteca A-Frame: crea y representa la escena 3D. Es código de terceros, ya preparado para el navegador. |
| [`assets/vendor/ar-3.4.8.js`](assets/vendor/ar-3.4.8.js) | Biblioteca AR.js: procesa la cámara y detecta los patrones. Es código de terceros. |
| [`LICENSE-AFrame.txt`](assets/vendor/LICENSE-AFrame.txt), [`LICENSE-ARjs.txt`](assets/vendor/LICENSE-ARjs.txt) | Licencias de las bibliotecas distribuidas con el juego. Deben conservarse junto a ellas. |

Las bibliotecas se sirven desde este repositorio para que el juego no dependa de un CDN. Para modificar el juego, trabajá en `src/`; no hace falta editar los archivos de terceros.

### `scripts/`: herramientas de desarrollo

| Archivo | Función |
| --- | --- |
| [`scripts/serve.mjs`](scripts/serve.mjs) | Servidor HTTP local de desarrollo en `http://localhost:4173`. Asigna los tipos de contenido de JavaScript, imágenes, patrones y calibración. |
| [`scripts/build.mjs`](scripts/build.mjs) | Copia únicamente las páginas, estilos, código del navegador y recursos a `dist/`. Comprueba que existan los recursos AR críticos antes de publicar. |
| [`scripts/browser-check.mjs`](scripts/browser-check.mjs) | Pruebas con Playwright: levanta un servidor temporal, comprueba la interfaz y el recorrido, reconoce los patrones con AR.js y verifica el final y los errores de cámara. |

### `tests/`: pruebas del proyecto

| Archivo | Función |
| --- | --- |
| [`tests/game.test.mjs`](tests/game.test.mjs) | Pruebas de las reglas: orden, duplicados, restauración de datos, rechazo de partidas corruptas y tiempo final. |
| [`tests/ar-fixture.html`](tests/ar-fixture.html) | Página auxiliar que usa una imagen como fuente AR para comprobar automáticamente la detección. Se usa solo durante las pruebas locales. |

### Configuración y publicación

| Archivo | Función |
| --- | --- |
| [`.github/workflows/pages.yml`](.github/workflows/pages.yml) | Automatiza las pruebas, la construcción y la publicación en GitHub Pages al subir cambios a `main`. |
| [`package.json`](package.json) | Define los comandos de npm y la dependencia de desarrollo `playwright-core`. El juego no necesita paquetes de npm para ejecutarse en producción. |
| [`package-lock.json`](package-lock.json) | Fija las versiones de las dependencias para que `npm ci` instale el mismo conjunto en otras computadoras. |
| [`.gitignore`](.gitignore) | Evita subir dependencias, resultados generados, capturas y registros de ejecución. |
| [`.gitattributes`](.gitattributes) | Define el tratamiento de archivos de texto y binarios en Git, incluidos sus saltos de línea. |
| [`.nojekyll`](.nojekyll) | Marcador para servir contenido estático sin el generador Jekyll. Se conserva entre los archivos públicos. |

### Carpetas generadas

Estas carpetas pueden aparecer al ejecutar comandos y están ignoradas por Git:

| Carpeta | Cuándo aparece | ¿Se puede borrar? |
| --- | --- | --- |
| `dist/` | Con `npm run build`. Contiene la copia lista para publicar. | Sí; se vuelve a generar. No se edita a mano. |
| `node_modules/` | Con `npm ci` o `npm install`. Contiene las dependencias de desarrollo. | Sí; hay que reinstalarlas para ejecutar las pruebas de navegador. |
| `artifacts/` | Con las pruebas de navegador. Guarda capturas y el PDF de control. | Sí; no contiene el código del juego. |

La carpeta oculta `.git/` contiene el historial y la conexión con el repositorio; pertenece a Git y debe conservarse.

## Cómo se conectan las partes

1. `index.html` carga `app.js`, que recupera el progreso y prepara la interfaz.
2. Al comenzar, `ar.js` carga A-Frame y AR.js y crea los marcadores configurados.
3. AR.js compara la cámara con los archivos `.patt` y emite `markerFound` o `markerLost`.
4. `app.js` confirma que el marcador siga visible y consulta las reglas de `game.js`.
5. Si corresponde avanzar, actualiza el progreso, guarda la partida y muestra la siguiente pista o el tesoro.

`config.js` es compartido por el juego y la página de impresión para mantener los carteles y las pistas coordinados.

## Ejecutar en tu computadora

Usá Node.js 22, la versión utilizada por la publicación, y npm. Desde la carpeta del proyecto:

```powershell
npm start
```

Abrí [http://localhost:4173](http://localhost:4173). También están disponibles [el ensayo local](http://localhost:4173/?demo=1) y [los marcadores locales](http://localhost:4173/marcadores.html).

Para iniciar, ejecutar las pruebas de lógica o construir el sitio no hace falta instalar dependencias. No abras `index.html` con doble clic: los módulos necesitan un servidor. Para probar desde el celular, usá la dirección HTTPS de GitHub Pages; el HTTP de una IP de red local no habilita la cámara.

| Comando | Resultado |
| --- | --- |
| `npm start` o `npm run dev` | Inicia el servidor local. |
| `npm test` | Ejecuta las pruebas de lógica. |
| `npm run build` | Genera el sitio publicable en `dist/`. |

Para las pruebas automáticas de navegador:

```powershell
npm ci
npx playwright-core install chromium
npm run test:browser
```

Estas pruebas usan imágenes y una cámara simulada. La validación final debe hacerse con un celular real y los carteles impresos.

## Qué editar para personalizarlo

| Cambio | Archivo |
| --- | --- |
| Lugares, pistas, título o mensaje final | `src/config.js` |
| Aspecto y animación de los objetos 3D | `src/ar.js` |
| Comportamiento de la interfaz, sonido o cámara | `src/app.js` |
| Reglas de progreso y validación | `src/game.js` y sus pruebas |
| Diseño de la portada y del explorador | `index.html` y `styles.css` |
| Contenido y diseño de los carteles | `src/print.js`, `marcadores.html` y `print.css` |

Si se cambia el orden o la identidad de los marcadores después de probarlos, conviene cambiar `GAME.storageKey` o reiniciar la partida para evitar reutilizar un progreso anterior.

## Publicar cambios

Cada push a `main` activa [el workflow de publicación](.github/workflows/pages.yml), que ejecuta `npm test`, genera `dist/` y la despliega en GitHub Pages. La fuente en **Settings → Pages → Build and deployment** debe ser **GitHub Actions**.

Con los cambios guardados y revisados en `main`:

```powershell
git add .
git commit -m "Describe el cambio realizado"
git push origin main
```

Esperá a que [la publicación](https://github.com/elwombokombo/TPNDLabAR/actions/workflows/pages.yml) termine correctamente y probá la URL pública. También se puede repetir desde **Actions → Publicar juego en GitHub Pages → Run workflow**.

El despliegue contiene solo las páginas, estilos, `src/` y `assets/`; las pruebas, los scripts de desarrollo y este README quedan en el repositorio.

## Preparar la actividad con Bruno, Maxi y Gonzalo

1. Impriman los marcadores desde **la página pública**, para que los carteles incluyan la URL correcta del juego.
2. Usen papel blanco mate, una hoja A4 por cartel, impresión al 100 % y sin recortar el margen blanco ni el borde negro. Eviten pliegues y reflejos.
3. Coloquen 01 en entrada, 02 en biblioteca y 03 en patio, en puntos visibles y accesibles durante la evaluación.
4. Hagan una pasada completa con un celular antes de compartir la URL con los testers.
5. Compartan la URL del juego y el punto de inicio. La página que reúne los tres marcadores sirve para la preparación del equipo.

Lista de control:

- [ ] La portada se lee bien en el celular y permite iniciar.
- [ ] Se solicita permiso de cámara al comenzar.
- [ ] Si se deniega el permiso, aparecen instrucciones.
- [ ] Entrada muestra una llave 3D y guarda 1/3.
- [ ] La pista lleva a biblioteca y permanece al retirar el cartel.
- [ ] Repetir entrada mantiene 1/3.
- [ ] Intentar patio antes de biblioteca no completa el juego.
- [ ] Biblioteca muestra una brújula y guarda 2/3.
- [ ] Recargar permite continuar.
- [ ] Patio abre el cofre 3D y muestra el final con 3/3.
- [ ] Se puede activar y desactivar el sonido.
- [ ] Reiniciar permite repetir.
- [ ] El ensayo sin cámara no modifica la partida real.

Registro opcional del equipo:

| Tester | Dispositivo / navegador | Fecha | ¿Encontró el tesoro? | Dificultades |
| --- | --- | --- | --- | --- |
| Bruno | | | | |
| Maxi | | | | |
| Gonzalo | | | | |

No hay recolección automática de datos personales para este registro.

## Bibliotecas y documentación

Las versiones incluidas en `assets/vendor/` son **A-Frame 1.8.0** y **AR.js 3.4.8**.

- [A-Frame: documentación](https://aframe.io/docs/1.8.0/introduction/)
- [AR.js: documentación de marcadores y eventos](https://ar-js-org.github.io/AR.js-Docs/marker-based/)
- [Patrones e imágenes originales de AR.js](https://github.com/AR-js-org/AR.js/tree/3.4.8/three.js/examples/marker-training/examples)
- [GitHub Pages con GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

Las licencias de las bibliotecas están en `assets/vendor/`. El juego requiere WebGL, permiso de cámara y HTTPS, o `localhost` para el desarrollo.
