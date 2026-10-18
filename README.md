# El secreto de Sacré Coeur

Búsqueda del tesoro en realidad aumentada para navegador. Tres marcadores físicos guían una expedición por **entrada → biblioteca → patio**.

## URL del juego

https://sacre-coeur-expedicion-ar.santiagoamadeo123.chatgpt.site/

El sitio se publica con Sites como servidor HTTPS. También puede alojarse en GitHub Pages con los pasos de abajo. La publicación de Sites se prepara en una copia aislada ignorada por Git, `.site-release/`, para conservar el remoto GitHub de esta carpeta. Su identidad está en `.openai/hosting.json`.

## Empezar

1. Ejecutá `npm start` y abrí **http://localhost:4173** en tu computadora. No hace falta instalar dependencias para jugar, compilar ni ejecutar las pruebas de lógica.
2. Para un ensayo sin cámara, abrí **http://localhost:4173/?demo=1**. El ensayo tiene su propio progreso y no completa la partida real.
3. Abrí **http://localhost:4173/marcadores.html**, imprimí las tres hojas A4 al 100 % y ubicá cada una en su estación.
4. Desde el celular, abrí la URL HTTPS publicada, permití la cámara y escaneá los carteles en orden.

No abras `index.html` con doble clic: los módulos y la cámara necesitan un servidor. Para probar con el celular, usá la URL HTTPS publicada; el HTTP de una IP de red local no habilita la cámara.

## Recorrido

| Estación | Patrón | Elemento 3D | Siguiente pista |
| --- | --- | --- | --- |
| Entrada | Hiro | Llave dorada animada | Las historias de la biblioteca |
| Biblioteca | Kanji | Brújula animada | El cielo abierto del patio |
| Patio | Letra A | Cofre que se abre y revela una gema | Mensaje final y tiempo de expedición |

Mantené el marcador visible durante 900 ms. Los repetidos no suman, uno fuera de orden indica dónde continuar y perderlo antes de tiempo cancela la captura. El progreso queda en el navegador del dispositivo. El reloj mide el tiempo desde el inicio, incluidas las pausas, y se congela al completar los tres sellos. El sonido es opcional y se activa con ♪. Reiniciar pide confirmación y borra solo la partida del modo actual.

La historia es ficticia; no se atribuyen hechos históricos al edificio. El mapa de portada es conceptual, no un plano real.

## Publicar en GitHub Pages

El sitio es estático: no necesita backend, claves ni servicios pagos.

1. Subí los archivos al repositorio.
2. En **Settings → Pages → Build and deployment**, seleccioná **Deploy from a branch**, la rama con este proyecto (actualmente `Piloto_Amadeo`) y **/(root)**. Guardá.
3. Esperá a que GitHub termine la publicación. La URL esperada es **https://elwombokombo.github.io/TPNDLabAR/**; solo funciona después de activar Pages y de que el despliegue termine.
4. Probá esa URL desde el celular antes de entregarla.

`.nojekyll` permite servir directamente los archivos. `npm run build` también prepara `dist/` para Azure Static Web Apps u otro servidor estático.

## Montaje para Bruno, Maxi y Gonzalo

- Definan el punto exacto y visible dentro de cada lugar. Coloquen el primer cartel en entrada, el segundo en biblioteca y el tercero en patio. Confirmen que sean accesibles durante las próximas semanas.
- Impriman en papel blanco mate. Conserven todo el margen blanco y el borde negro, sin brillo ni pliegues. Los marcadores no son QR.
- Dejen la URL del juego junto al primer cartel. Las hojas imprimibles muestran automáticamente la dirección desde la que se imprimen: impriman desde la URL publicada.
- Prueben el recorrido completo con un celular real: permisos, las tres detecciones, pistas, recarga y final. Usen “Reiniciar expedición” para repetir.
- Compartan a los testers la URL y el punto de inicio; reserven la página con los tres marcadores para el equipo.

Lista de control: [docs/PRUEBA.md](docs/PRUEBA.md).

## Personalizar y entender el código

- **src/config.js**: lugares, pistas y mensaje del tesoro. Cambien la clave de almacenamiento si modifican el recorrido luego de las pruebas.
- **src/ar.js**: carga de A-Frame y AR.js, entidades y los tres modelos hechos con primitivas 3D.
- **src/game.js**: reglas de orden y progreso, independientes de la cámara.
- **src/app.js**: recibe `markerFound` y `markerLost`, confirma la detección, guarda el progreso y actualiza el feedback.
- **src/print.js**: genera los tres carteles desde la misma configuración del juego.

AR.js compara la imagen de la cámara con los archivos `.patt`. Si reconoce uno, estima su posición y orientación. A-Frame coloca el objeto 3D sobre ese marcador; JavaScript usa el evento de detección para avanzar la historia.

## Verificar

- `npm test`: orden, duplicados, persistencia, datos corruptos y tiempo final.
- `npm run build`: prepara los archivos públicos y verifica los recursos críticos.
- Para las pruebas de navegador: `npm install`, `npx playwright-core install chromium`, `npm run test:browser`.
- Las pruebas del navegador cubren el recorrido en modo ensayo, móvil/escritorio, persistencia, reinicio, impresión, cámara de prueba y reconocimiento real de los patrones por AR.js. No sustituyen la validación física de cámara e impresión.

## Tecnología y fuentes

Versiones estables verificadas el 17/10/2026, guardadas localmente para no depender de un CDN durante el juego:

- [A-Frame 1.8.0](https://github.com/aframevr/aframe/releases/tag/v1.8.0).
- [AR.js 3.4.8](https://github.com/AR-js-org/AR.js/releases/tag/3.4.8).
- Patrones, imágenes y calibración de cámara de [AR-js-org/AR.js](https://github.com/AR-js-org/AR.js/tree/3.4.8/three.js/examples/marker-training/examples).
- [Documentación oficial de marcadores y eventos](https://ar-js-org.github.io/AR.js-Docs/marker-based/).
- [Configurar GitHub Pages desde una rama](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Licencias de las bibliotecas en **assets/vendor/**. La cámara se procesa en el navegador: el proyecto no graba ni sube imágenes. Requiere HTTPS (o localhost), WebGL y permiso de cámara.
