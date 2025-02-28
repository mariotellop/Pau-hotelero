// Escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Fondo de cielo
scene.background = new THREE.Color(0x87CEEB);

// Luces
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(40, 50, 40);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.bias = -0.0001;
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
interiorLight.position.set(0, 8, -30);
interiorLight.castShadow = true;
scene.add(interiorLight);

// Terreno
const terrainGeometry = new THREE.PlaneGeometry(120, 100);
const terrainMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
terrain.receiveShadow = true;
scene.add(terrain);

// Edificio Principal con interiores
const buildingGeometry = new THREE.BoxGeometry(70, 12, 55);
const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
building.position.set(0, 6, -30); // Norte
building.castShadow = true;
building.receiveShadow = true;
scene.add(building);

const entranceGeometry = new THREE.BoxGeometry(10, 6, 5);
const entranceMaterial = new THREE.MeshLambertMaterial({ color: 0xA9A9A9 });
const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
entrance.position.set(0, 3, -2.5);
entrance.castShadow = true;
entrance.receiveShadow = true;
scene.add(entrance);

// Lobby interior
const lobbyGeometry = new THREE.BoxGeometry(20, 10, 20);
const lobbyMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
const lobby = new THREE.Mesh(lobbyGeometry, lobbyMaterial);
lobby.position.set(0, 5, -10);
lobby.receiveShadow = true;
lobby.castShadow = true;
scene.add(lobby);

const counterGeometry = new THREE.BoxGeometry(10, 2, 5);
const counterMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const counter = new THREE.Mesh(counterGeometry, counterMaterial);
counter.position.set(0, 1, -5);
counter.receiveShadow = true;
counter.castShadow = true;
scene.add(counter);

// Lámpara en el lobby
const lampGeometry = new THREE.SphereGeometry(1, 16, 16);
const lampMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
lamp.position.set(0, 9, -10);
lamp.castShadow = true;
scene.add(lamp);

// Paredes interiores (divisiones de habitaciones)
const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
for (let i = 0; i < 5; i++) {
    const wallGeometryWest = new THREE.BoxGeometry(0.2, 10, 35);
    const wallWest = new THREE.Mesh(wallGeometryWest, wallMaterial);
    wallWest.position.set(-30 + i * 15, 5, -35);
    wallWest.receiveShadow = true;
    wallWest.castShadow = true;
    scene.add(wallWest);

    const wallGeometryEast = new THREE.BoxGeometry(0.2, 10, 35);
    const wallEast = new THREE.Mesh(wallGeometryEast, wallMaterial);
    wallEast.position.set(30 - i * 15, 5, -35);
    wallEast.receiveShadow = true;
    wallEast.castShadow = true;
    scene.add(wallEast);
}

// Camas en habitaciones
const bedMaterial = new THREE.MeshLambertMaterial({ color: 0x4682B4 });
for (let i = 0; i < 4; i++) {
    const bedGeometryWest = new THREE.BoxGeometry(5, 1, 10);
    const bedWest = new THREE.Mesh(bedGeometryWest, bedMaterial);
    bedWest.position.set(-25 + i * 15, 0.5, -40);
    bedWest.receiveShadow = true;
    bedWest.castShadow = true;
    scene.add(bedWest);

    const bedGeometryEast = new THREE.BoxGeometry(5, 1, 10);
    const bedEast = new THREE.Mesh(bedGeometryEast, bedMaterial);
    bedEast.position.set(25 - i * 15, 0.5, -40);
    bedEast.receiveShadow = true;
    bedEast.castShadow = true;
    scene.add(bedEast);
}

// Paredes con ventanas (exterior)
const windowGeometry = new THREE.BoxGeometry(3, 2, 0.1);
const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x4682B4 });
for (let i = 0; i < 10; i++) {
    const windowMeshWest = new THREE.Mesh(windowGeometry, windowMaterial);
    windowMeshWest.position.set(-32 + i * 7, 2, -57.5);
    windowMeshWest.castShadow = true;
    scene.add(windowMeshWest);
    const windowMeshEast = new THREE.Mesh(windowGeometry, windowMaterial);
    windowMeshEast.position.set(-32 + i * 7, 2, -2.5);
    windowMeshEast.rotation.y = Math.PI;
    windowMeshEast.castShadow = true;
    scene.add(windowMeshEast);
}
for (let i = 0; i < 7; i++) {
    const windowP1West = new THREE.Mesh(windowGeometry, windowMaterial);
    windowP1West.position.set(-24 + i * 7, 6, -57.5);
    windowP1West.castShadow = true;
    scene.add(windowP1West);
    const windowP2West = new THREE.Mesh(windowGeometry, windowMaterial);
    windowP2West.position.set(-24 + i * 7, 10, -57.5);
    windowP2West.castShadow = true;
    scene.add(windowP2West);
    const windowP1East = new THREE.Mesh(windowGeometry, windowMaterial);
    windowP1East.position.set(-24 + i * 7, 6, -2.5);
    windowP1East.rotation.y = Math.PI;
    windowP1East.castShadow = true;
    scene.add(windowP1East);
    const windowP2East = new THREE.Mesh(windowGeometry, windowMaterial);
    windowP2East.position.set(-24 + i * 7, 10, -2.5);
    windowP2East.rotation.y = Math.PI;
    windowP2East.castShadow = true;
    scene.add(windowP2East);
}

// Azotea
const solarGeometry = new THREE.BoxGeometry(70, 0.2, 40);
const solarMaterial = new THREE.MeshLambertMaterial({ color: 0x1C2526 });
const solarPanels = new THREE.Mesh(solarGeometry, solarMaterial);
solarPanels.position.set(0, 12.1, -30);
solarPanels.castShadow = true;
scene.add(solarPanels);

const terraceGeometry = new THREE.BoxGeometry(20, 0.1, 20);
const terraceMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const terrace = new THREE.Mesh(terraceGeometry, terraceMaterial);
terrace.position.set(25, 12.05, -45);
terrace.castShadow = true;
scene.add(terrace);

// Pistas de Tenis con líneas de campo
const tennisGeometry = new THREE.BoxGeometry(36, 0.5, 18);
const tennisMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4500 });
const tennisCourts = [];
for (let i = 0; i < 3; i++) {
    const tennisCourt = new THREE.Mesh(tennisGeometry, tennisMaterial);
    tennisCourt.position.set(-48 + i * 40, 0.25, 10);
    tennisCourt.castShadow = true;
    tennisCourt.receiveShadow = true;
    scene.add(tennisCourt);
    tennisCourts.push(tennisCourt);

    // Líneas blancas para la pista de tenis (dimensiones reales escaladas: 23.77m longitud x 10.97m ancho dobles)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
    // Contorno externo (dobles)
    const outerPoints = [
        new THREE.Vector3(-48 + i * 40 - 18, 0.26, 10 - 9),
        new THREE.Vector3(-48 + i * 40 + 18, 0.26, 10 - 9),
        new THREE.Vector3(-48 + i * 40 + 18, 0.26, 10 + 9),
        new THREE.Vector3(-48 + i * 40 - 18, 0.26, 10 + 9),
        new THREE.Vector3(-48 + i * 40 - 18, 0.26, 10 - 9)
    ];
    const outerLineGeometry = new THREE.BufferGeometry().setFromPoints(outerPoints);
    const tennisOuterLine = new THREE.Line(outerLineGeometry, lineMaterial);
    scene.add(tennisOuterLine);

    // Líneas de singles (8.23m ancho escalado a 13.14 en el modelo)
    const singlesPoints = [
        new THREE.Vector3(-48 + i * 40 - 13.14 / 2, 0.26, 10 - 9),
        new THREE.Vector3(-48 + i * 40 + 13.14 / 2, 0.26, 10 - 9),
        new THREE.Vector3(-48 + i * 40 + 13.14 / 2, 0.26, 10 + 9),
        new THREE.Vector3(-48 + i * 40 - 13.14 / 2, 0.26, 10 + 9),
        new THREE.Vector3(-48 + i * 40 - 13.14 / 2, 0.26, 10 - 9)
    ];
    const singlesLineGeometry = new THREE.BufferGeometry().setFromPoints(singlesPoints);
    const tennisSinglesLine = new THREE.Line(singlesLineGeometry, lineMaterial);
    scene.add(tennisSinglesLine);

    // Línea central (servicio)
    const centerLinePoints = [
        new THREE.Vector3(-48 + i * 40, 0.26, 10 - 9),
        new THREE.Vector3(-48 + i * 40, 0.26, 10 + 9)
    ];
    const centerLineGeometry = new THREE.BufferGeometry().setFromPoints(centerLinePoints);
    const tennisCenterLine = new THREE.Line(centerLineGeometry, lineMaterial);
    scene.add(tennisCenterLine);

    const roofGeometry = new THREE.BoxGeometry(38, 0.2, 20);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(-48 + i * 40, 10, 10);
    roof.castShadow = true;
    scene.add(roof);
}

// Pistas de Pádel con líneas de campo
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

    // Líneas blancas para la pista de pádel (dimensiones reales escaladas: 20m x 10m)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
    // Contorno externo
    const outerPoints = [
        new THREE.Vector3(-30 + i * 25 - 10, 0.26, 30 - 5),
        new THREE.Vector3(-30 + i * 25 + 10, 0.26, 30 - 5),
        new THREE.Vector3(-30 + i * 25 + 10, 0.26, 30 + 5),
        new THREE.Vector3(-30 + i * 25 - 10, 0.26, 30 + 5),
        new THREE.Vector3(-30 + i * 25 - 10, 0.26, 30 - 5)
    ];
    const outerLineGeometry = new THREE.BufferGeometry().setFromPoints(outerPoints);
    const padelOuterLine = new THREE.Line(outerLineGeometry, lineMaterial);
    scene.add(padelOuterLine);

    // Línea central
    const centerLinePoints = [
        new THREE.Vector3(-30 + i * 25, 0.26, 30 - 5),
        new THREE.Vector3(-30 + i * 25, 0.26, 30 + 5)
    ];
    const centerLineGeometry = new THREE.BufferGeometry().setFromPoints(centerLinePoints);
    const padelCenterLine = new THREE.Line(centerLineGeometry, lineMaterial);
    scene.add(padelCenterLine);

    // Líneas de servicio (6.95m desde la red, escalado a 5.56 en el modelo)
    const serviceLineLeftPoints = [
        new THREE.Vector3(-30 + i * 25 - 10, 0.26, 30 - 2.78),
        new THREE.Vector3(-30 + i * 25 + 10, 0.26, 30 - 2.78)
    ];
    const serviceLineLeftGeometry = new THREE.BufferGeometry().setFromPoints(serviceLineLeftPoints);
    const padelServiceLineLeft = new THREE.Line(serviceLineLeftGeometry, lineMaterial);
    scene.add(padelServiceLineLeft);

    const serviceLineRightPoints = [
        new THREE.Vector3(-30 + i * 25 - 10, 0.26, 30 + 2.78),
        new THREE.Vector3(-30 + i * 25 + 10, 0.26, 30 + 2.78)
    ];
    const serviceLineRightGeometry = new THREE.BufferGeometry().setFromPoints(serviceLineRightPoints);
    const padelServiceLineRight = new THREE.Line(serviceLineRightGeometry, lineMaterial);
    scene.add(padelServiceLineRight);

    const roofGeometry = new THREE.BoxGeometry(22, 0.2, 12);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(-30 + i * 25, 8, 30);
    roof.castShadow = true;
    scene.add(roof);
}

// Piscina Exterior
const poolGeometry = new THREE.BoxGeometry(25, 0.1, 25);
const poolMaterial = new THREE.MeshBasicMaterial({ color: 0x00BFFF });
const pool = new THREE.Mesh(poolGeometry, poolMaterial);
pool.position.set(40, 0.1, 40);
pool.receiveShadow = true;
scene.add(pool);

// Jardines con arbustos
const gardenGeometry = new THREE.BoxGeometry(120, 0.1, 20);
const gardenMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
const gardenNorth = new THREE.Mesh(gardenGeometry, gardenMaterial);
gardenNorth.position.set(0, 0.05, 45);
gardenNorth.receiveShadow = true;
scene.add(gardenNorth);
const gardenSouth = new THREE.Mesh(gardenGeometry, gardenMaterial);
gardenSouth.position.set(0, 0.05, -40);
gardenSouth.receiveShadow = true;
scene.add(gardenSouth);

const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x006400 });
const bushesNorth = [];
const bushesSouth = [];
for (let i = 0; i < 10; i++) {
    const bushNorth = new THREE.Mesh(bushGeometry, bushMaterial);
    bushNorth.position.set(-50 + i * 10, 0.5, 50);
    bushNorth.castShadow = true;
    scene.add(bushNorth);
    bushesNorth.push(bushNorth);
    const bushSouth = new THREE.Mesh(bushGeometry, bushMaterial);
    bushSouth.position.set(-50 + i * 10, 0.5, -35);
    bushSouth.castShadow = true;
    scene.add(bushSouth);
    bushesSouth.push(bushSouth);
}

// Partículas (lluvia)
const rainCount = 500;
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3);
const rainSizes = new Float32Array(rainCount);
for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = Math.random() * 120 - 60;
    rainPositions[i * 3 + 1] = Math.random() * 50;
    rainPositions[i * 3 + 2] = Math.random() * 100 - 50;
    rainSizes[i] = Math.random() * 0.2 + 0.1;
}
rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
rainGeometry.setAttribute('size', new THREE.BufferAttribute(rainSizes, 1));
const rainMaterial = new THREE.PointsMaterial({ color: 0xAAAAAA, sizeAttenuation: true, transparent: true });
const rain = new THREE.Points(rainGeometry, rainMaterial);
rain.visible = false;
scene.add(rain);

// Etiquetas
function createLabel(text, position) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '24px Arial';
    context.fillStyle = 'white';
    context.fillText(text, 0, 24);
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(10, 5, 1);
    sprite.position.copy(position);
    return sprite;
}

const buildingLabel = createLabel('Hotel 4*', new THREE.Vector3(0, 15, -30));
const tennisLabel = createLabel('Pistas de Tenis', new THREE.Vector3(-8, 12, 10));
const padelLabel = createLabel('Pistas de Pádel', new THREE.Vector3(0, 8, 30));
const poolLabel = createLabel('Piscina', new THREE.Vector3(40, 5, 40));
const labels = [buildingLabel, tennisLabel, padelLabel, poolLabel];
scene.add(buildingLabel, tennisLabel, padelLabel, poolLabel);

// Contorno para resaltar selección
const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00, side: THREE.BackSide });
let selectedObject = null;
let outlineMesh = null;

function createOutline(object) {
    if (outlineMesh) scene.remove(outlineMesh);
    const geometry = object.geometry.clone();
    outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
    outlineMesh.position.copy(object.position);
    outlineMesh.scale.multiplyScalar(1.05);
    scene.add(outlineMesh);
}

// Controles de cámara
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 10;
controls.maxDistance = 200;

camera.position.set(100, 50, 100);

// Raycaster para interacción
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const objects = [building, ...tennisCourts, ...padelCourts, pool];
const detailsDiv = document.getElementById('details');
const dayNightDiv = document.getElementById('dayNight');

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects);
    labels.forEach(label => label.visible = false);
    if (intersects.length > 0) {
        const intersected = intersects[0].object;
        if (intersected === building) buildingLabel.visible = true;
        else if (tennisCourts.includes(intersected)) tennisLabel.visible = true;
        else if (padelCourts.includes(intersected)) padelLabel.visible = true;
        else if (intersected === pool) poolLabel.visible = true;
    }
}
window.addEventListener('mousemove', onMouseMove);

function smoothZoom(targetPosition, targetLookAt, duration) {
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();

    function animateZoom(currentTime) {
        const elapsed = (currentTime - startTime) / 1000;
        const t = Math.min(elapsed / duration, 1);

        camera.position.lerpVectors(startPosition, targetPosition, t);
        controls.target.lerpVectors(startTarget, targetLookAt, t);

        if (t < 1) {
            requestAnimationFrame(animateZoom);
        }
        controls.update();
    }

    requestAnimationFrame(animateZoom);
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        const intersected = intersects[0].object; // Corregido de 'interected'
        selectedObject = intersected;
        createOutline(interected);
        detailsDiv.style.display = 'block';
        let targetPosition, targetLookAt;
        if (intersected === building) {
            detailsDiv.innerHTML = 'Hotel 4*: 70 habitaciones, spa, gimnasio.<br>Superficie: 2,450 m²';
            targetPosition = new THREE.Vector3(50, 20, -50);
            targetLookAt = new THREE.Vector3(0, 6, -30);
        } else if (tennisCourts.includes(intersected)) {
            detailsDiv.innerHTML = 'Pistas de Tenis: 3 cubiertas (+1 espacio).<br>Superficie: 1,950 m²';
            targetPosition = new THREE.Vector3(0, 20, 50);
            targetLookAt = new THREE.Vector3(-8, 0, 10);
        } else if (padelCourts.includes(intersected)) {
            detailsDiv.innerHTML = 'Pistas de Pádel: 3 cubiertas (+1 espacio).<br>Superficie: 1,008 m²';
            targetPosition = new THREE.Vector3(0, 20, 50);
            targetLookAt = new THREE.Vector3(0, 0, 30);
        } else if (intersected === pool) {
            detailsDiv.innerHTML = 'Piscina Exterior: Borde infinito.<br>Superficie: 625 m²';
            targetPosition = new THREE.Vector3(60, 20, 60);
            targetLookAt = new THREE.Vector3(40, 0, 40);
        }
        smoothZoom(targetPosition, targetLookAt, 1);
    } else {
        detailsDiv.style.display = 'none';
        if (outlineMesh) scene.remove(outlineMesh);
        selectedObject = null;
    }
}
window.addEventListener('click', onMouseClick);

function onDoubleClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([building]);
    if (intersects.length > 0) {
        smoothZoom(new THREE.Vector3(0, 8, -15), new THREE.Vector3(0, 5, -30), 1);
    }
}
window.addEventListener('dblclick', onDoubleClick);

// Interfaz
let isDay = true;
const toggleLightButton = document.getElementById('toggleLight');
toggleLightButton.addEventListener('click', () => {
    isDay = !isDay;
    if (isDay) {
        scene.background = new THREE.Color(0x87CEEB);
        directionalLight.position.set(40, 50, 40);
        directionalLight.intensity = 1.0;
        ambientLight.intensity = 0.8;
        nightLight.intensity = 0;
        volumetricLight.intensity = 0;
        interiorLight.intensity = 0;
        dayNightDiv.textContent = 'Día';
    } else {
        scene.background = new THREE.Color(0x191970);
        directionalLight.position.set(-40, 50, -40);
        directionalLight.intensity = 0.5;
        ambientLight.intensity = 0.3;
        nightLight.intensity = 1;
        volumetricLight.intensity = 0.5 + Math.sin(time) * 0.2;
        interiorLight.intensity = 0.5;
        dayNightDiv.textContent = 'Noche';
    }
});

let isRaining = false;
const toggleRainButton = document.getElementById('toggleRain');
toggleRainButton.addEventListener('click', () => {
    isRaining = !isRaining;
    rain.visible = isRaining;
    scene.background = isRaining ? new THREE.Color(0x666666) : (isDay ? new THREE.Color(0x87CEEB) : new THREE.Color(0x191970));
});

document.getElementById('resetRotation').addEventListener('click', () => {
    building.rotation.y = 0;
});

document.getElementById('viewHotel').addEventListener('click', () => {
    smoothZoom(new THREE.Vector3(50, 20, -50), new THREE.Vector3(0, 6, -30), 1);
});
document.getElementById('viewCourts').addEventListener('click', () => {
    smoothZoom(new THREE.Vector3(0, 20, 50), new THREE.Vector3(0, 0, 20), 1);
});
document.getElementById('viewPool').addEventListener('click', () => {
    smoothZoom(new THREE.Vector3(60, 20, 60), new THREE.Vector3(40, 0, 40), 1);
});

// Animación
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.05;

    // Animar lluvia
    if (isRaining) {
        const rainPositions = rain.geometry.attributes.position.array;
        for (let i = 0; i < rainCount; i++) {
            rainPositions[i * 3 + 1] -= 0.5;
            if (rainPositions[i * 3 + 1] < 0) rainPositions[i * 3 + 1] = 50;
        }
        rain.geometry.attributes.position.needsUpdate = true;
    }

    // Animar arbustos
    bushesNorth.forEach((bush, i) => {
        bush.position.x = -50 + i * 10 + Math.sin(time + i) * 0.2;
    });
    bushesSouth.forEach((bush, i) => {
        bush.position.x = -50 + i * 10 + Math.cos(time + i) * 0.2;
    });

    // Luces dinámicas y sombras
    if (!isDay) {
        volumetricLight.intensity = 0.5 + Math.sin(time) * 0.2;
        directionalLight.shadow.bias = -0.0001 + Math.sin(time) * 0.00005;
    } else {
        directionalLight.shadow.bias = -0.0001;
    }

    // Actualizar contorno si el edificio rota
    if (selectedObject && outlineMesh) {
        outlineMesh.position.copy(selectedObject.position);
        outlineMesh.rotation.copy(selectedObject.rotation);
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});