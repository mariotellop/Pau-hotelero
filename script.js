// Escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Variables globales
let time = 0;

// Fondo de cielo
const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
const skyMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: time }, dayColor: { value: new THREE.Color(0x87CEEB) }, nightColor: { value: new THREE.Color(0x191970) }, isDay: { value: 1.0 } },
    vertexShader: `varying vec3 vWorldPosition; void main() { vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float time; uniform vec3 dayColor; uniform vec3 nightColor; uniform float isDay; varying vec3 vWorldPosition; void main() { vec3 color = mix(nightColor, dayColor, isDay); float cloudNoise = sin(vWorldPosition.x * 0.01 + time) * cos(vWorldPosition.z * 0.01 + time); float cloud = smoothstep(0.2, 0.8, cloudNoise); gl_FragColor = vec4(mix(color, vec3(1.0), cloud * isDay), 1.0); }`,
    side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// Luces
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(50, 70, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -60;
directionalLight.shadow.camera.right = 60;
directionalLight.shadow.camera.top = 60;
directionalLight.shadow.camera.bottom = -60;
directionalLight.shadow.bias = -0.00005;
scene.add(directionalLight);
const nightLight = new THREE.PointLight(0xffff99, 0, 50);
nightLight.position.set(0, 15, -30);
nightLight.castShadow = true;
scene.add(nightLight);
const volumetricLight = new THREE.SpotLight(0xffff99, 0, 100, Math.PI / 6, 0.5);
volumetricLight.position.set(0, 20, -30);
volumetricLight.castShadow = true;
volumetricLight.shadow.mapSize.width = 1024;
volumetricLight.shadow.mapSize.height = 1024;
scene.add(volumetricLight);
const interiorLight = new THREE.PointLight(0xFFFFE0, 0.5, 50);
interiorLight.position.set(0, 14, -30);
interiorLight.castShadow = true;
scene.add(interiorLight);

// Texturas
const buildingTexture = createTexture('#FFFFFF', '#D3D3D3', 'brick'); // Blanco con acentos grises
const terrainTexture = createTexture('#228B22', '#006400', 'grass');
const glassTexture = createTexture('#87CEEB', '#ADD8E6', 'generic'); // Vidrio azul claro

function createTexture(color, pattern, type) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0, 0, 256, 256);
    context.fillStyle = pattern;
    if (type === 'water') {
        for (let i = 0; i < 30; i++) { const x = Math.random() * 256; const y = Math.random() * 256; context.beginPath(); context.arc(x, y, 8, 0, Math.PI * 2); context.fill(); }
    } else if (type === 'grass') {
        for (let i = 0; i < 50; i++) { const x = Math.random() * 256; const y = Math.random() * 256; context.fillRect(x, y, 4, 4); }
    } else if (type === 'brick') {
        context.strokeStyle = pattern;
        for (let i = 0; i < 256; i += 16) { context.beginPath(); context.moveTo(0, i); context.lineTo(256, i); context.stroke(); }
    } else {
        for (let i = 0; i < 20; i++) { const x = Math.random() * 256; const y = Math.random() * 256; context.beginPath(); context.arc(x, y, 5, 0, Math.PI * 2); context.fill(); }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
}

// Terreno
const terrainGeometry = new THREE.PlaneGeometry(200, 150);
const terrainMaterial = new THREE.MeshLambertMaterial({ map: terrainTexture });
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
terrain.receiveShadow = true;
scene.add(terrain);

// Hotel
const buildingWidth = 70;
const buildingDepth = 55;
const buildingHeight = 25; // 5 plantas de 5 unidades cada una
const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
const buildingMaterial = new THREE.MeshLambertMaterial({ map: buildingTexture });
const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
building.position.set(0, buildingHeight / 2, 0);
building.castShadow = true;
building.receiveShadow = true;
scene.add(building);

// Techo negro escalonado
const roofGeometry = new THREE.BoxGeometry(buildingWidth + 2, 2, buildingDepth + 2);
const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x1C2526 }); // Negro
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.position.set(0, buildingHeight + 1, 0);
roof.castShadow = true;
scene.add(roof);

// Logo simple (texto 2D)
const logoCanvas = document.createElement('canvas');
logoCanvas.width = 256;
logoCanvas.height = 64;
const logoContext = logoCanvas.getContext('2d');
logoContext.fillStyle = '#FFD700';
logoContext.fillRect(0, 0, 256, 64);
logoContext.font = '30px Arial';
logoContext.fillStyle = 'black';
logoContext.textAlign = 'center';
logoContext.fillText('Pau Hotel', 128, 40);
const logoTexture = new THREE.Texture(logoCanvas);
logoTexture.needsUpdate = true;
const logoMaterial = new THREE.SpriteMaterial({ map: logoTexture });
const logo = new THREE.Sprite(logoMaterial);
logo.scale.set(20, 5, 1);
logo.position.set(0, buildingHeight + 1.5, buildingDepth / 2 + 1);
scene.add(logo);

// Entrada de vidrio
const entranceGeometry = new THREE.BoxGeometry(20, 6, 5);
const entranceMaterial = new THREE.MeshLambertMaterial({ map: glassTexture, transparent: true, opacity: 0.7 });
const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
entrance.position.set(0, 3, -buildingDepth / 2 + 2.5);
entrance.castShadow = true;
entrance.receiveShadow = true;
scene.add(entrance);

// Ventanas (fachadas este, sur y oeste)
const windowGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.8 });
const windowSpacingX = 6;
const windowSpacingZ = 6;
const windowOffsetX = -buildingWidth / 2 + 2;
const windowOffsetZ = -buildingDepth / 2 + 2;
for (let floor = 0; floor < 5; floor++) {
    for (let x = 0; x < 10; x++) { // Más ventanas en fachada este y oeste
        const windowEast = new THREE.Mesh(windowGeometry, windowMaterial);
        windowEast.position.set(buildingWidth / 2 - 1, 1.5 + floor * 5, windowOffsetZ + x * windowSpacingZ);
        windowEast.rotation.y = 0;
        windowEast.castShadow = true;
        scene.add(windowEast);

        const windowWest = new THREE.Mesh(windowGeometry, windowMaterial);
        windowWest.position.set(-buildingWidth / 2 + 1, 1.5 + floor * 5, windowOffsetZ + x * windowSpacingZ);
        windowWest.rotation.y = Math.PI;
        windowWest.castShadow = true;
        scene.add(windowWest);
    }
    for (let z = 0; z < 8; z++) { // Ventanas en fachada sur
        const windowSouth = new THREE.Mesh(windowGeometry, windowMaterial);
        windowSouth.position.set(windowOffsetX + z * windowSpacingX, 1.5 + floor * 5, -buildingDepth / 2 + 1);
        windowSouth.rotation.y = Math.PI / 2;
        windowSouth.castShadow = true;
        scene.add(windowSouth);
    }
}

// Paneles verticales decorativos
const panelGeometry = new THREE.BoxGeometry(0.2, 10, buildingDepth);
const panelMaterial = new THREE.MeshLambertMaterial({ color: 0xD3D3D3 });
for (let i = -2; i <= 2; i++) {
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(i * 10, 5, 0);
    panel.castShadow = true;
    scene.add(panel);
}

// Entorno: Calle y árboles
const roadGeometry = new THREE.PlaneGeometry(200, 50);
const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.position.set(0, 0.01, -75);
road.rotation.x = -Math.PI / 2;
road.receiveShadow = true;
scene.add(road);

const treeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 16);
const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x006400 });
for (let i = -80; i <= 80; i += 20) {
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    tree.position.set(i, 2.5, -70);
    tree.castShadow = true;
    scene.add(tree);
}

// Personas básicas (cubos simples)
const personGeometry = new THREE.BoxGeometry(1, 2, 1);
const personMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 });
for (let i = -50; i <= 50; i += 20) {
    const person = new THREE.Mesh(personGeometry, personMaterial);
    person.position.set(i, 1, -65);
    person.castShadow = true;
    scene.add(person);
}

// Vehículos básicos (cubos simples)
const carGeometry = new THREE.BoxGeometry(4, 2, 2);
const carMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
for (let i = -60; i <= 60; i += 20) {
    const car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.set(i, 1, -80);
    car.castShadow = true;
    scene.add(car);
}

// Pistas de Tenis
const tennisGeometry = new THREE.BoxGeometry(36, 0.5, 18);
const tennisMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4500 });
const tennisCourts = [];
for (let i = 0; i < 3; i++) {
    const tennisCourt = new THREE.Mesh(tennisGeometry, tennisMaterial);
    tennisCourt.position.set(-38 + i * 40, 0.25, 10);
    tennisCourt.castShadow = true;
    tennisCourt.receiveShadow = true;
    scene.add(tennisCourt);
    tennisCourts.push(tennisCourt);
}

// Pistas de Pádel
const padelGeometry = new THREE.BoxGeometry(20, 0.5, 10);
const padelMaterial = new THREE.MeshLambertMaterial({ color: 0x32CD32 });
const padelCourts = [];
for (let i = 0; i < 3; i++) {
    const padelCourt = new THREE.Mesh(padelGeometry, padelMaterial);
    padelCourt.position.set(-30 + i * 25, 0.25, 30);
    padelCourt.castShadow = true;
    padelCourt.receiveShadow = true;
    scene.add(padelCourt);
    padelCourts.push(padelCourt);
}

// Piscina
const poolGeometry = new THREE.BoxGeometry(25, 0.1, 25);
const poolMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: time }, baseColor: { value: new THREE.Color(0x00BFFF) } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float time; uniform vec3 baseColor; varying vec2 vUv; void main() { float wave = sin(vUv.x * 15.0 + time * 2.0) * cos(vUv.y * 15.0 + time * 2.0) * 0.1; vec3 color = baseColor + vec3(wave, wave, wave * 0.5); gl_FragColor = vec4(color, 0.9); }`,
    transparent: true
});
const pool = new THREE.Mesh(poolGeometry, poolMaterial);
pool.position.set(45, 0.1, 45);
pool.receiveShadow = true;
scene.add(pool);

// Raycaster y controles
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const interactiveObjects = [building, ...tennisCourts, ...padelCourts, pool];
const detailsDiv = document.getElementById('details');
const dayNightDiv = document.getElementById('dayNight');

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 10;
controls.maxDistance = 200;
camera.position.set(100, 50, 100);

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects);
    if (intersects.length > 0) detailsDiv.innerHTML = intersects[0].uuid;
    else detailsDiv.innerHTML = '';
}
window.addEventListener('mousemove', onMouseMove);

function smoothZoom(targetPosition, targetLookAt, duration) {
    if (!targetPosition || !targetLookAt) {
        console.warn("smoothZoom: targetPosition o targetLookAt no definidos, usando valores por defecto");
        targetPosition = targetPosition || camera.position.clone();
        targetLookAt = targetLookAt || controls.target.clone();
    }
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();

    function animateZoom(currentTime) {
        const elapsed = (currentTime - startTime) / 1000;
        const t = Math.min(elapsed / duration, 1);
        camera.position.lerpVectors(startPosition, targetPosition, t);
        controls.target.lerpVectors(startTarget, targetLookAt, t);
        if (t < 1) requestAnimationFrame(animateZoom);
        controls.update();
    }
    requestAnimationFrame(animateZoom);
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects);
    if (intersects.length > 0) smoothZoom(new THREE.Vector3(20, 20, 20), intersects[0].object.position, 1);
}
window.addEventListener('click', onMouseClick);

function onDoubleClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([building]);
    if (intersects.length > 0) smoothZoom(new THREE.Vector3(0, 14, -15), new THREE.Vector3(0, 11, 0), 1);
}
window.addEventListener('dblclick', onDoubleClick);

let isDay = true;
let isSummer = true;
document.getElementById('toggleLight').addEventListener('click', () => {
    isDay = !isDay;
    skyMaterial.uniforms.isDay.value = isDay ? 1.0 : 0.0;
    if (isDay) {
        directionalLight.intensity = 2.0;
        ambientLight.intensity = 0.8;
        nightLight.intensity = 0;
        volumetricLight.intensity = 0;
        interiorLight.intensity = 0.5;
        dayNightDiv.textContent = 'Día';
        if (isSummer) directionalLight.position.set(50, 70, 50);
        else directionalLight.position.set(50, 30, 50);
    } else {
        directionalLight.intensity = 0.5;
        ambientLight.intensity = 0.3;
        nightLight.intensity = 1;
        volumetricLight.intensity = 0.5;
        interiorLight.intensity = 0.8;
        dayNightDiv.textContent = 'Noche';
        if (isSummer) directionalLight.position.set(-50, 70, -50);
        else directionalLight.position.set(-50, 30, -50);
    }
});

document.getElementById('toggleRain').addEventListener('click', () => {
    isSummer = !isSummer;
    if (isDay) {
        if (isSummer) {
            directionalLight.position.set(50, 70, 50);
            detailsDiv.innerHTML = 'Verano: Sol alto';
        } else {
            directionalLight.position.set(50, 30, 50);
            detailsDiv.innerHTML = 'Invierno: Sol bajo';
        }
    } else {
        if (isSummer) {
            directionalLight.position.set(-50, 70, -50);
            detailsDiv.innerHTML = 'Verano: Noche';
        } else {
            directionalLight.position.set(-50, 30, -50);
            detailsDiv.innerHTML = 'Invierno: Noche';
        }
    }
    detailsDiv.style.display = 'block';
    setTimeout(() => { detailsDiv.style.display = 'none'; }, 2000);
});

let isRaining = false;
document.getElementById('resetRotation').addEventListener('click', () => {
    building.rotation.y = 0;
    isRaining = !isRaining;
    if (isRaining) skyMaterial.uniforms.isDay.value = 0.5;
});

document.getElementById('viewHotel').addEventListener('click', () => {
    smoothZoom(new THREE.Vector3(50, 20, -50), new THREE.Vector3(0, 9, 0), 1);
});
document.getElementById('viewCourts').addEventListener('click', () => {
    smoothZoom(new THREE.Vector3(0, 20, 50), new THREE.Vector3(0, 0, 20), 1);
});
document.getElementById('viewPool').addEventListener('click', () => {
    smoothZoom(new THREE.Vector3(65, 20, 65), new THREE.Vector3(45, 0, 45), 1);
});

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    skyMaterial.uniforms.time.value = time;
    poolMaterial.uniforms.time.value = time;
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});