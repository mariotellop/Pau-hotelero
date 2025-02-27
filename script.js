// Escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Fondo de cielo
scene.background = new THREE.Color(0x87CEEB);

// Luces
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(100, 50, 50);
scene.add(directionalLight);

// Cargador de texturas
const textureLoader = new THREE.TextureLoader();

// Terreno
const terrainGeometry = new THREE.PlaneGeometry(120, 100);
const terrainTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
const terrainMaterial = new THREE.MeshLambertMaterial({ map: terrainTexture });
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
scene.add(terrain);

// Edificio Principal
const buildingGeometry = new THREE.BoxGeometry(70, 12, 55);
const buildingTexture = textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg');
const buildingMaterial = new THREE.MeshLambertMaterial({ map: buildingTexture });
const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
building.position.set(0, 6, -20);
scene.add(building);

// Ventanas
const windowGeometry = new THREE.BoxGeometry(3, 2, 0.1);
const windowTexture = textureLoader.load('https://threejs.org/examples/textures/window.jpg');
const windowMaterial = new THREE.MeshLambertMaterial({ map: windowTexture });
for (let i = 0; i < 10; i++) {
    const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
    windowMesh.position.set(-32 + i * 7, 2, -47.5);
    scene.add(windowMesh);
}
for (let i = 0; i < 7; i++) {
    const windowP1 = new THREE.Mesh(windowGeometry, windowMaterial);
    windowP1.position.set(-24 + i * 7, 6, -47.5);
    scene.add(windowP1);
    const windowP2 = new THREE.Mesh(windowGeometry, windowMaterial);
    windowP2.position.set(-24 + i * 7, 10, -47.5);
    scene.add(windowP2);
}

// Azotea
const solarGeometry = new THREE.BoxGeometry(70, 0.2, 40);
const solarTexture = textureLoader.load('https://threejs.org/examples/textures/solar_panel.jpg');
const solarMaterial = new THREE.MeshLambertMaterial({ map: solarTexture });
const solarPanels = new THREE.Mesh(solarGeometry, solarMaterial);
solarPanels.position.set(0, 12.1, -20);
scene.add(solarPanels);

const terraceGeometry = new THREE.BoxGeometry(20, 0.1, 20);
const terraceTexture = textureLoader.load('https://threejs.org/examples/textures/wood.jpg');
const terraceMaterial = new THREE.MeshLambertMaterial({ map: terraceTexture });
const terrace = new THREE.Mesh(terraceGeometry, terraceMaterial);
terrace.position.set(25, 12.05, -40);
scene.add(terrace);

// Pistas de Tenis
const tennisGeometry = new THREE.BoxGeometry(36, 0.5, 18);
const tennisTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/clay.jpg');
const tennisMaterial = new THREE.MeshLambertMaterial({ map: tennisTexture });
for (let i = 0; i < 3; i++) {
    const tennisCourt = new THREE.Mesh(tennisGeometry, tennisMaterial);
    tennisCourt.position.set(-36 + i * 40, 0.25, 30);
    scene.add(tennisCourt);
    const roofGeometry = new THREE.BoxGeometry(36, 0.2, 18);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(-36 + i * 40, 10, 30);
    scene.add(roof);
}

// Pistas de Pádel
const padelGeometry = new THREE.BoxGeometry(20, 0.5, 10);
const padelTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grass.jpg');
const padelMaterial = new THREE.MeshLambertMaterial({ map: padelTexture });
for (let i = 0; i < 3; i++) {
    const padelCourt = new THREE.Mesh(padelGeometry, padelMaterial);
    padelCourt.position.set(-20 + i * 25, 0.25, 45);
    scene.add(padelCourt);
}

// Piscina Exterior
const poolGeometry = new THREE.BoxGeometry(25, 0.1, 25);
const poolTexture = textureLoader.load('https://threejs.org/examples/textures/water.jpg');
const poolMaterial = new THREE.MeshLambertMaterial({ map: poolTexture });
const pool = new THREE.Mesh(poolGeometry, poolMaterial);
pool.position.set(40, 0.05, 40);
scene.add(pool);

// Parking
const parkingGeometry = new THREE.BoxGeometry(50, 0.1, 50);
const parkingTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/asphalt.jpg');
const parkingMaterial = new THREE.MeshLambertMaterial({ map: parkingTexture });
const parking = new THREE.Mesh(parkingGeometry, parkingMaterial);
parking.position.set(0, 0.05, -45);
scene.add(parking);

// Jardines
const gardenGeometry = new THREE.BoxGeometry(120, 0.1, 20);
const gardenMaterial = new THREE.MeshLambertMaterial({ map: terrainTexture });
const gardenNorth = new THREE.Mesh(gardenGeometry, gardenMaterial);
gardenNorth.position.set(0, 0.05, 40);
scene.add(gardenNorth);
const gardenSouth = new THREE.Mesh(gardenGeometry, gardenMaterial);
gardenSouth.position.set(0, 0.05, -40);
scene.add(gardenSouth);

// Etiquetas (Sprites)
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

const buildingLabel = createLabel('Hotel 4*', new THREE.Vector3(0, 15, -20));
const tennisLabel = createLabel('Pistas de Tenis', new THREE.Vector3(0, 12, 30));
const padelLabel = createLabel('Pistas de Pádel', new THREE.Vector3(0, 8, 45));
const poolLabel = createLabel('Piscina', new THREE.Vector3(40, 5, 40));
scene.add(buildingLabel, tennisLabel, padelLabel, poolLabel);

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
const objects = [building, ...scene.children.filter(child => child.geometry === tennisGeometry || child.geometry === padelGeometry), pool];
const labels = [buildingLabel, tennisLabel, padelLabel, poolLabel];

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects);
    labels.forEach(label => label.visible = false);
    if (intersects.length > 0) {
        const intersected = intersects[0].object;
        if (intersected === building) buildingLabel.visible = true;
        else if (intersected.geometry === tennisGeometry) tennisLabel.visible = true;
        else if (intersected.geometry === padelGeometry) padelLabel.visible = true;
        else if (intersected === pool) poolLabel.visible = true;
    