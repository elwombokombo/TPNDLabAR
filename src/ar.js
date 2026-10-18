import { STATIONS } from './config.js';
let loading;
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => { script.remove(); reject(new Error('No se pudo cargar ' + src)); };
    document.head.appendChild(script);
  });
}
export async function loadAR() {
  if (!loading) loading = (async () => {
    if (!window.AFRAME) await loadScript('assets/vendor/aframe-1.8.0.min.js');
    await loadScript('assets/vendor/ar-3.4.8.js');
  })().catch(error => { loading = null; throw error; });
  return loading;
}
function ring() {
  return '<a-torus radius="0.62" radius-tubular="0.012" rotation="-90 0 0" position="0 0.02 0" color="#d3c393"></a-torus>';
}
export function modelMarkup(kind) {
  if (kind === 'key') return `
    <a-entity position="0 0.65 0" rotation="-90 0 0" animation="property: rotation; to: -90 360 0; loop: true; dur: 6500; easing: linear">
      <a-torus radius="0.23" radius-tubular="0.065" position="0 0.25 0" color="#eac278"></a-torus>
      <a-box width="0.09" height="0.63" depth="0.09" position="0 -0.17 0" color="#eac278"></a-box>
      <a-box width="0.26" height="0.08" depth="0.09" position="0.09 -0.43 0" color="#eac278"></a-box>
      <a-box width="0.21" height="0.08" depth="0.09" position="0.065 -0.26 0" color="#eac278"></a-box>
    </a-entity>${ring()}`;
  if (kind === 'compass') return `
    <a-entity position="0 0.5 0" animation="property: position; from: 0 0.5 0; to: 0 0.68 0; dir: alternate; loop: true; dur: 1600; easing: easeInOutSine">
      <a-cylinder radius="0.44" height="0.09" color="#b48a4e"></a-cylinder>
      <a-cylinder radius="0.38" height="0.095" color="#284e41"></a-cylinder>
      <a-entity position="0 0.1 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear">
        <a-cone radius-bottom="0.1" radius-top="0" height="0.38" rotation="90 0 0" position="0 0 -0.17" color="#e4b978"></a-cone>
        <a-cone radius-bottom="0.1" radius-top="0" height="0.38" rotation="-90 0 0" position="0 0 0.17" color="#c7ded0"></a-cone>
      </a-entity>
      <a-sphere radius="0.065" position="0 0.13 0" color="#e7d29a"></a-sphere>
    </a-entity>${ring()}`;
  return `
    <a-entity position="0 0.12 0">
      <a-box width="0.85" height="0.4" depth="0.6" position="0 0.2 0" color="#855336"></a-box>
      <a-box width="0.06" height="0.42" depth="0.62" position="-0.28 0.2 0" color="#d9ae62"></a-box>
      <a-box width="0.06" height="0.42" depth="0.62" position="0.28 0.2 0" color="#d9ae62"></a-box>
      <a-entity data-chest-lid position="0 0.4 -0.3" animation__open="property: rotation; to: -65 0 0; startEvents: treasure-open; dur: 1200; easing: easeOutCubic">
        <a-box width="0.88" height="0.15" depth="0.64" position="0 0.075 0.3" color="#a36a42"></a-box>
        <a-box width="0.07" height="0.17" depth="0.66" position="-0.28 0.075 0.3" color="#e0b76c"></a-box>
        <a-box width="0.07" height="0.17" depth="0.66" position="0.28 0.075 0.3" color="#e0b76c"></a-box>
      </a-entity>
      <a-entity data-treasure-gem visible="false" position="0 0.95 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 4500; easing: linear">
        <a-octahedron radius="0.24" color="#f3d183" material="emissive: #c99335; emissiveIntensity: 0.5"></a-octahedron>
        <a-torus radius="0.35" radius-tubular="0.015" rotation="70 0 0" color="#a8d7bc"></a-torus>
      </a-entity>
      <a-box width="0.13" height="0.13" depth="0.025" position="0 0.32 0.315" color="#e6c37f"></a-box>
    </a-entity>${ring()}`;
}
export function createScene(container, handlers) {
  const scene = document.createElement('a-scene');
  scene.setAttribute('embedded', '');
  scene.setAttribute('vr-mode-ui', 'enabled: false');
  scene.setAttribute('xr-mode-ui', 'enabled: false');
  scene.setAttribute('device-orientation-permission-ui', 'enabled: false');
  scene.setAttribute('renderer', 'antialias: true; alpha: true; precision: mediump');
  scene.setAttribute('loading-screen', 'enabled: false');
  scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false; detectionMode: mono; cameraParametersUrl: assets/ar/camera_para.dat; maxDetectionRate: 30; sourceWidth: 640; sourceHeight: 480;');
  const markers = new Map();
  for (const station of STATIONS) {
    const marker = document.createElement('a-marker');
    marker.id = 'marker-' + station.id;
    marker.setAttribute('type', 'pattern');
    marker.setAttribute('url', 'assets/markers/' + station.pattern + '.patt');
    marker.setAttribute('emitevents', 'true');
    marker.innerHTML = '<a-entity scale="0.4 0.4 0.4">' + modelMarkup(station.object) + '</a-entity>';
    marker.addEventListener('markerFound', () => handlers.found(station.id));
    marker.addEventListener('markerLost', () => handlers.lost(station.id));
    markers.set(station.id, marker);
    scene.appendChild(marker);
  }
  const camera = document.createElement('a-entity');
  camera.setAttribute('camera', '');
  camera.setAttribute('look-controls', 'enabled: false');
  scene.appendChild(camera);
  const light = document.createElement('a-entity');
  light.setAttribute('light', 'type: ambient; intensity: 1.5; color: #fff5dc');
  scene.appendChild(light);
  container.appendChild(scene);
  return {
    scene,
    openTreasure() {
      const marker = markers.get('patio');
      marker.querySelector('[data-chest-lid]').emit('treasure-open');
      marker.querySelector('[data-treasure-gem]').setAttribute('visible', 'true');
    },
    pause() {
      scene.pause();
      (scene.systems.arjs?._arSession?.arSource?.domElement ?? document.querySelector('#arjs-video'))?.srcObject?.getVideoTracks().forEach(track => { track.enabled = false; });
    },
    resume() {
      scene.play();
      (scene.systems.arjs?._arSession?.arSource?.domElement ?? document.querySelector('#arjs-video'))?.srcObject?.getVideoTracks().forEach(track => { track.enabled = true; });
    },
  };
}
