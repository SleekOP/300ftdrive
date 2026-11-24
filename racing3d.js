/* Original procedural Three.js scene for the Dhaka highway pursuit. */
(() => {
  const THREE = window.THREE;
  if (!THREE) return; // Keep the 2D fallback available when the CDN is offline.
  const host = document.querySelector('.scene-wrap');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.domElement.id = 'racing3dCanvas';
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  host.insertBefore(renderer.domElement, host.firstChild);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#9fc5d7');
  scene.fog = new THREE.Fog('#b8c7c0', 95, 430);
  const camera = new THREE.PerspectiveCamera(67, 1, .1, 650);
  const hemi = new THREE.HemisphereLight(0xd8ebff, 0x48503d, 2.0); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe3b4, 3.2); sun.position.set(-45, 65, -30); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -35; sun.shadow.camera.right = 35; sun.shadow.camera.top = 55; sun.shadow.camera.bottom = -25; scene.add(sun);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x65714f, roughness: 1 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 700), groundMat); ground.rotation.x = -Math.PI / 2; ground.position.set(0, -.16, -260); ground.receiveShadow = true; scene.add(ground);

  function asphaltTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#353a3c'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2800; i++) { const v = 45 + Math.random() * 55; g.fillStyle = `rgba(${v},${v},${v},${Math.random() * .20})`; const s = Math.random() * 2.4; g.fillRect(Math.random() * 256, Math.random() * 256, s, s); }
    const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2, 16); tex.colorSpace = THREE.SRGBColorSpace; return tex;
  }
  const roadMaterial = new THREE.MeshPhysicalMaterial({ map: asphaltTexture(), roughness: .94, clearcoat: .02 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(13, 650), roadMaterial);
  road.rotation.x = -Math.PI / 2; road.position.set(0, -.02, -275); road.receiveShadow = true; scene.add(road);
  const laneMarks = [];
  const white = new THREE.MeshStandardMaterial({ color: 0xe8e0c7, roughness: .8 });
  for (const x of [-2.16, 2.16]) for (let i = 0; i < 45; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(.10, .018, 4.8), white); m.position.set(x, .005, -i * 14); m.userData.markIndex = i; scene.add(m); laneMarks.push(m); }
  for (const x of [-6.42, 6.42]) { const stripe = new THREE.Mesh(new THREE.BoxGeometry(.13, .025, 650), new THREE.MeshStandardMaterial({ color: 0xe8dfc8 })); stripe.position.set(x, .012, -275); scene.add(stripe); }

  const roadRoughness = new THREE.MeshStandardMaterial({ color: 0xb6aa8e, roughness: .92 });
  const barrierMat = new THREE.MeshStandardMaterial({ color: 0x9c9f99, roughness: .82 });
  for (const x of [-7.5, 7.5]) { const b = new THREE.Mesh(new THREE.BoxGeometry(.48, .72, 650), barrierMat); b.position.set(x, .26, -275); b.castShadow = true; b.receiveShadow = true; scene.add(b); }
  const rainCount = 1100, rainPositions = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount; i++) { rainPositions[i * 3] = (Math.random() - .5) * 75; rainPositions[i * 3 + 1] = Math.random() * 24; rainPositions[i * 3 + 2] = Math.random() * 105 - 70; }
  const rainGeometry = new THREE.BufferGeometry(); rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  const rain = new THREE.Points(rainGeometry, new THREE.PointsMaterial({ color: 0xc8dcef, size: .075, transparent: true, opacity: .63, depthWrite: false })); scene.add(rain); rain.visible = false;
  const buildings = [], trees = [];
  const seeded = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  for (let i = 0; i < 64; i++) {
    const side = i % 2 ? -1 : 1, z = -24 - Math.floor(i / 2) * 18, x = side * (12 + seeded(i + 4) * 25);
    if (i % 3 === 0) {
      const h = 7 + seeded(i + 99) * 22, w = 5 + seeded(i + 22) * 8;
      const building = new THREE.Group(), depth = 8 + seeded(i) * 9;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), new THREE.MeshStandardMaterial({ color: [0xa3947c, 0x9eab9f, 0xb4a58d, 0x7b8b83][i % 4], roughness: .9 }));
      mesh.position.y = h / 2; mesh.castShadow = true; mesh.receiveShadow = true; building.add(mesh); building.position.set(x, 0, z); scene.add(building); buildings.push({ mesh: building, z, x, h, w });
      for (let row = 0; row < Math.min(5, Math.floor(h / 4)); row++) for (let col = 0; col < 2; col++) { const win = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.25), new THREE.MeshStandardMaterial({ color: 0x71817d, emissive: 0x19201d, roughness: .8 })); win.position.set((col ? 1 : -1) * w * .2, 2.6 + row * 3.1, depth / 2 + .015); building.add(win); }
    } else {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.18, .3, 3.5, 7), new THREE.MeshStandardMaterial({ color: 0x604b35, roughness: 1 })); trunk.position.set(x, 1.7, z); scene.add(trunk);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(2.1 + seeded(i + 40), 9, 7), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x496849 : 0x64774f, roughness: 1 })); crown.position.set(x, 4.4, z); crown.castShadow = true; scene.add(crown); trees.push({ trunk, crown, z, x });
    }
  }
  const carMat = (color, metal = .22) => new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: .34 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x293b42, metalness: .25, roughness: .18, transparent: true, opacity: .86, clearcoat: .9 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x17191a, roughness: .94 });
  const wheelGeo = new THREE.CylinderGeometry(.39, .39, .25, 18); wheelGeo.rotateZ(Math.PI / 2);
  function makeCar(color = 0x168278, type = 'car', police = false) {
    const root = new THREE.Group(), bus = type === 'bus', cng = type === 'cng', bike = type === 'bike';
    const w = bus ? 2.65 : bike ? 1.05 : cng ? 1.55 : 1.9, length = bus ? 7.7 : bike ? 2.1 : cng ? 2.55 : 4.55, height = bus ? 3 : bike ? 1.35 : cng ? 1.9 : 1.55;
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, height * .52, length), carMat(police ? 0xeee7db : color)); body.position.y = height * .46; body.castShadow = true; body.receiveShadow = true; root.add(body);
    if (!bike) { const cabin = new THREE.Mesh(new THREE.BoxGeometry(w * .78, height * .48, length * (bus ? .72 : .48)), bus ? carMat(police ? 0xe6e2d5 : color) : glassMat); cabin.position.set(0, height * .91, -.05); cabin.castShadow = true; root.add(cabin); }
    for (const sx of [-1, 1]) for (const sz of bus ? [-2.75, 0, 2.75] : [-length * .31, length * .31]) { const wheel = new THREE.Mesh(wheelGeo, tireMat); wheel.position.set(sx * w * .51, .40, sz); wheel.castShadow = true; root.add(wheel); }
    const lamp = (x, z, color, emissive) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.34, .16, .08), new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 1.3 })); m.position.set(x, .72, z); root.add(m); };
    for (const x of [-w * .32, w * .32]) { lamp(x, -length / 2 - .045, 0xffe4b5, 0xffb34d); lamp(x, length / 2 + .045, 0xe34234, 0x8b120b); }
    if (police) { const bar = new THREE.Mesh(new THREE.BoxGeometry(1.15, .14, .32), new THREE.MeshStandardMaterial({ color: 0xeff4f3, emissive: 0x277fff, emissiveIntensity: 2.2 })); bar.position.y = height * 1.17; root.add(bar); }
    root.userData.length = length; return root;
  }
  const player = makeCar(0x127d78); player.position.z = 1; scene.add(player);
  const headlights = [];
  for (const x of [-.62, .62]) { const lamp = new THREE.SpotLight(0xffedc7, 0, 115, .40, .55, 1.25); lamp.position.set(x, .78, -2.15); lamp.target.position.set(x * 1.45, -.5, -85); player.add(lamp, lamp.target); headlights.push(lamp); }
  const cop = makeCar(0xe5e4db, 'car', true); scene.add(cop); cop.visible = false;
  const trafficCars = new Map();
  const cabin = new THREE.Group(); camera.add(cabin); scene.add(camera);
  const dashMat = new THREE.MeshStandardMaterial({ color: 0x171d1c, roughness: .72 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x414b47, metalness: .35, roughness: .42 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x252c29, roughness: .88 });
  const hoodMat = new THREE.MeshStandardMaterial({ color: 0x126c68, metalness: .28, roughness: .38 });
  // These camera-attached layers make the view read as a windshield without covering the road.
  const wind = new THREE.Mesh(new THREE.PlaneGeometry(3.05, 1.72), new THREE.MeshPhysicalMaterial({ color: 0xa9c8ce, transparent: true, opacity: .055, roughness: .08, side: THREE.DoubleSide })); wind.position.set(0, -.02, -1.7); cabin.add(wind);
  const header = new THREE.Mesh(new THREE.BoxGeometry(3.2, .18, .2), leatherMat); header.position.set(0, .86, -1.58); cabin.add(header);
  const lowerFrame = new THREE.Mesh(new THREE.BoxGeometry(3.05, .13, .16), trimMat); lowerFrame.position.set(0, -.83, -1.58); cabin.add(lowerFrame);
  for (const side of [-1, 1]) { const pillar = new THREE.Mesh(new THREE.BoxGeometry(.16, 1.72, .2), leatherMat); pillar.position.set(side * 1.49, .02, -1.56); pillar.rotation.z = -side * .13; cabin.add(pillar); }
  const dashBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, .28, .86), dashMat); dashBase.position.set(0, -.99, -.84); cabin.add(dashBase);
  const dashPad = new THREE.Mesh(new THREE.BoxGeometry(2.72, .11, .73), leatherMat); dashPad.position.set(0, -.79, -.98); cabin.add(dashPad);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.88, .12, 1.55), hoodMat); hood.position.set(0, -1.06, -2.15); cabin.add(hood);
  const hoodHighlight = new THREE.Mesh(new THREE.BoxGeometry(1.65, .018, 1.15), new THREE.MeshStandardMaterial({ color: 0x368c83, metalness: .38, roughness: .34 })); hoodHighlight.position.set(0, - .986, -2.22); cabin.add(hoodHighlight);
  for (const side of [-1, 1]) {
    const doorRail = new THREE.Mesh(new THREE.BoxGeometry(.48, .16, 1.55), leatherMat); doorRail.position.set(side * 1.26, -.76, -.2); doorRail.rotation.x = -.08; cabin.add(doorRail);
    const vent = new THREE.Mesh(new THREE.BoxGeometry(.42, .09, .035), trimMat); vent.position.set(side * .83, -.76, -1.24); cabin.add(vent);
    for (let n = 0; n < 4; n++) { const slat = new THREE.Mesh(new THREE.BoxGeometry(.32, .012, .018), dashMat); slat.position.set(side * .83, -.745 + n * .018, -1.263); cabin.add(slat); }
  }
  const console = new THREE.Mesh(new THREE.BoxGeometry(.55, .12, .36), dashMat); console.position.set(0, -.91, -.56); cabin.add(console);
  const mirrorStem = new THREE.Mesh(new THREE.BoxGeometry(.035, .19, .04), trimMat); mirrorStem.position.set(0, .68, -1.49); cabin.add(mirrorStem);
  const mirror = new THREE.Mesh(new THREE.BoxGeometry(.62, .14, .12), dashMat); mirror.position.set(0, .57, -1.55); cabin.add(mirror);
  const tmp = new THREE.Vector3(), cameraAim = new THREE.Vector3(), desiredCamera = new THREE.Vector3(); let smoothX = 0, smoothSteer = 0, previousWorld = 0, rainStep = 0;
  function resize() { const r = host.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(host); resize();
  function render(state) {
    const laneX = (state.playerLane - 1) * 4.2; smoothX += (laneX - smoothX) * .075; smoothSteer += (state.steer - smoothSteer) * .06;
    const travel = state.world * .065, offset = travel % 14, sceneryTravel = travel % 560;
    for (const m of laneMarks) m.position.z = -m.userData.markIndex * 14 + offset - 5;
    roadMaterial.roughness = state.rainMode ? .24 : .94; roadMaterial.clearcoat = state.rainMode ? .62 : .02; roadMaterial.color.set(state.rainMode ? '#c6d0d3' : '#ffffff');
    roadMaterial.map.offset.y = (travel / 650 * 16) % 1;
    rain.visible = state.rainMode;
    if (state.rainMode) { const p = rainGeometry.attributes.position.array; rainStep += .55; for (let i = 0; i < rainCount; i++) { const k = i * 3 + 1; p[k] -= .42; if (p[k] < 0) p[k] = 22 + (i % 12) * .18; } rainGeometry.attributes.position.needsUpdate = true; rain.position.set(smoothX, 0, 3); }
    for (const o of buildings) { let z = ((o.z + sceneryTravel + 560) % 560); if (z > 80) z -= 560; o.mesh.position.z = z; }
    for (const o of trees) { let z = ((o.z + sceneryTravel + 560) % 560); if (z > 80) z -= 560; o.trunk.position.z = z; o.crown.position.z = z; }
    player.position.x = smoothX; player.rotation.y += (-smoothSteer * .045 - player.rotation.y) * .08; player.visible = !state.cockpitView;
    const visibleIds = new Set();
    for (const v of state.traffic) {
      const key = v.id; visibleIds.add(key); let model = trafficCars.get(key);
      if (!model) { model = makeCar(v.color, v.type); trafficCars.set(key, model); scene.add(model); }
      model.position.set((v.lane - 1) * 4.2, 0, -Math.max(-12, (1 - v.z) * 245)); model.visible = v.z > -.1 && v.z < 1.15;
    }
    for (const [id, model] of trafficCars) if (!visibleIds.has(id)) { scene.remove(model); trafficCars.delete(id); }
    cop.visible = state.policePresent; cop.position.set(smoothX, 0, Math.max(5, Math.min(45, state.policeGap * .22 + 5)));
    sun.intensity = state.nightMode ? .18 : state.rainMode ? 2.25 : 3.2; hemi.intensity = state.nightMode ? .48 : state.rainMode ? 1.35 : 2; scene.background.set(state.nightMode ? '#101b35' : state.rainMode ? '#657989' : '#9fc5d7'); scene.fog.color.set(state.nightMode ? '#263748' : state.rainMode ? '#85949b' : '#b8c7c0'); scene.fog.near = state.rainMode ? 45 : 95; scene.fog.far = state.rainMode ? 220 : 430;
    if (state.nightMode) { sun.color.set('#a5bce0'); sun.position.set(-25, 28, -20); } else { sun.color.set(state.rainMode ? '#c4cfdb' : '#ffe3b4'); sun.position.set(-45, 65, -30); }
    for (const lamp of headlights) lamp.intensity = state.nightMode ? 920 : 0;
    camera.fov = state.cockpitView ? 74 : 67; camera.updateProjectionMatrix();
    if (state.cockpitView) { desiredCamera.set(smoothX, 1.78, .42); tmp.set(smoothX + smoothSteer * .12, 1.5, -72); }
    else { desiredCamera.set(smoothX, 4.05, 10.6); tmp.set(smoothX, .85, -24); }
    camera.position.lerp(desiredCamera, .12); cameraAim.lerp(tmp, .12); camera.lookAt(cameraAim);
    cabin.visible = state.cockpitView;
    renderer.domElement.style.visibility = 'visible'; document.getElementById('game').style.visibility = 'hidden';
    renderer.render(scene, camera);
  }
  window.racing3D = { render };
})();
