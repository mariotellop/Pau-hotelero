// Escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Variables globales
let time = 0; // Declaración única de time

// Fondo de cielo (dinámico con nubes)
const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: time },
        dayColor: { value: new THREE.Color(0x87CEEB) },
        nightColor: { value: new THREE.Color(0x191970) },
        isDay: { value: 1.0 }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec3 dayColor;
        uniform vec3 nightColor;
        uniform float isDay;
        varying vec3 vWorldPosition;
        void main() {
            vec3 color = mix(nightColor, dayColor, isDay);
            float cloudNoise = sin(vWorldPosition.x * 0.01 + time) * cos(vWorldPosition.z * 0.01 + time);
            float cloud = smoothstep(0.2, 0.8, cloudNoise);
            gl_FragColor = vec4(mix(color, vec3(1.0), cloud * isDay), 1.0);
        }
    `,
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

// Función para crear texturas avanzadas con canvas
function createTexture(color, pattern, type) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    context.fillStyle = color;
    context.fillRect(0, 0, 256, 256);

    context.fillStyle = pattern;
    if (type === 'water') {
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            context.beginPath();
            context.arc(x, y, 8, 0, Math.PI * 2);
            context.fill();
        }
    } else if (type === 'grass') {
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            context.fillRect(x, y, 4, 4);
        }
    } else if (type === 'brick') {
        context.strokeStyle = pattern;
        for (let i = 0; i < 256; i += 16) {
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(256, i);
            context.stroke();
        }
    } else {
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            context.beginPath();
            context.arc(x, y, 5, 0, Math.PI * 2);
            context.fill();
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
}

// Texturas
const poolTexture = createTexture('#00BFFF', '#ADD8E6', 'water');
const tennisTexture = createTexture('#FF4500', '#CD5C5C', 'generic');
const padelTexture = createTexture('#32CD32', '#228B22', 'generic');
const buildingTexture = createTexture('#D2B48C', '#DEB887', 'brick');
const terrainTexture = createTexture('#228B22', '#006400', 'grass');
const grassTexture = createTexture('#228B22', '#006400', 'grass');

// Terreno (con textura)
const terrainGeometry = new THREE.PlaneGeometry(120, 100);
const terrainMaterial = new THREE.MeshLambertMaterial({ map: terrainTexture });
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
terrain.receiveShadow = true;
scene.add(terrain);

// Edificio Principal con dos plantas (sin placas solares)
const buildingGeometry = new THREE.BoxGeometry(70, 18, 55);
const buildingMaterial = new THREE.MeshLambertMaterial({ map: buildingTexture });
const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
building.position.set(0, 9, -30);
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

// Ventanas alineadas en la fachada este
const windowGeometry = new THREE.BoxGeometry(3, 2, 0.1);
const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x4682B4 });
for (let i = 0; i < 5; i++) { // Reduje a 5 ventanas para mejor distribución
    const windowMeshEast = new THREE.Mesh(windowGeometry, windowMaterial);
    windowMeshEast.position.set(33, 8 + i * 2, -55); // Alineadas verticalmente en la fachada este
    windowMeshEast.rotation.y = 0; // Corrección: sin rotación para alinear con la fachada
    windowMeshEast.castShadow = true;
    scene.add(windowMeshEast);
}

// Planta baja (locales)
const shopGeometry = new THREE.BoxGeometry(20, 6, 20);
const shopMaterial = new THREE.MeshLambertMaterial({ color: 0xD3D3D3 });
const shopLeft = new THREE.Mesh(shopGeometry, shopMaterial);
shopLeft.position.set(-25, 3, -35);
shopLeft.receiveShadow = true;
shopLeft.castShadow = true;
scene.add(shopLeft);

const shopRight = new THREE.Mesh(shopGeometry, shopMaterial);
shopRight.position.set(25, 3, -35);
shopRight.receiveShadow = true;
shopRight.castShadow = true;
scene.add(shopRight);

// Lobby interior (planta baja)
const lobbyGeometry = new THREE.BoxGeometry(20, 6, 20);
const lobbyMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
const lobby = new THREE.Mesh(lobbyGeometry, lobbyMaterial);
lobby.position.set(0, 3, -10);
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

const lampGeometry = new THREE.SphereGeometry(1, 16, 16);
const lampMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
lamp.position.set(0, 5, -10);
lamp.castShadow = true;
scene.add(lamp);

// Detalles interiores en el lobby: Sillas detalladas (clicables)
const chairSeatGeometry = new THREE.BoxGeometry(1.5, 0.5, 1.5);
const chairBackGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.2);
const chairLegGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.2);
const chairMaterial = new THREE.MeshLambertMaterial({ color: 0x8A2BE2 });
const chairs = [];

function createChair(x, z) {
    const chairGroup = new THREE.Group();
    const seat = new THREE.Mesh(chairSeatGeometry, chairMaterial);
    seat.position.set(0, 0.75, 0);
    chairGroup.add(seat);

    const back = new THREE.Mesh(chairBackGeometry, chairMaterial);
    back.position.set(0, 1.5, -0.65);
    chairGroup.add(back);

    const leg1 = new THREE.Mesh(chairLegGeometry, chairMaterial);
    leg1.position.set(-0.65, 0.25, -0.65);
    chairGroup.add(leg1);
    const leg2 = new THREE.Mesh(chairLegGeometry, chairMaterial);
    leg2.position.set(0.65, 0.25, -0.65);
    chairGroup.add(leg2);
    const leg3 = new THREE.Mesh(chairLegGeometry, chairMaterial);
    leg3.position.set(-0.65, 0.25, 0.65);
    chairGroup.add(leg3);
    const leg4 = new THREE.Mesh(chairLegGeometry, chairMaterial);
    leg4.position.set(0.65, 0.25, 0.65);
    chairGroup.add(leg4);

    chairGroup.position.set(x, 0, z);
    chairGroup.castShadow = true;
    chairGroup.receiveShadow = true;
    chairGroup.userData = { info: 'Silla detallada del lobby' };
    scene.add(chairGroup);
    chairs.push(chairGroup);
    return chairGroup;
}

createChair(-2, -12);
createChair(2, -12);
createChair(-2, -8);
createChair(2, -8);

// Detalles interiores en el lobby: Mesa (clicable)
const tableGeometry = new THREE.BoxGeometry(4, 1, 2);
const tableMaterial = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
const table = new THREE.Mesh(tableGeometry, tableMaterial);
table.position.set(0, 0.5, -10);
table.castShadow = true;
table.receiveShadow = true;
table.userData = { info: 'Mesa burlywood del lobby' };
scene.add(table);

// Detalles interiores en el lobby: Planta decorativa (clicable)
const plantGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
const plantMaterial = new THREE.MeshLambertMaterial({ color: 0x006400 });
const plant = new THREE.Mesh(plantGeometry, plantMaterial);
plant.position.set(-8, 1, -15);
plant.castShadow = true;
plant.receiveShadow = true;
plant.userData = { info: 'Planta decorativa del lobby' };
scene.add(plant);

// Primera planta (habitaciones)
const floorGeometry = new THREE.BoxGeometry(70, 0.2, 55);
const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
const firstFloor = new THREE.Mesh(floorGeometry, floorMaterial);
firstFloor.position.set(0, 6, -30);
firstFloor.receiveShadow = true;
firstFloor.castShadow = true;
scene.add(firstFloor);

const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
for (let i = 0; i < 5; i++) {
    const wallGeometryWest = new THREE.BoxGeometry(0.2, 10, 35);
    const wallWest = new THREE.Mesh(wallGeometryWest, wallMaterial);
    wallWest.position.set(-30 + i * 15, 11, -35);
    wallWest.receiveShadow = true;
    wallWest.castShadow = true;
    scene.add(wallWest);

    const wallGeometryEast = new THREE.BoxGeometry(0.2, 10, 35);
    const wallEast = new THREE.Mesh(wallGeometryEast, wallMaterial);
    wallEast.position.set(30 - i * 15, 11, -35);
    wallEast.receiveShadow = true;
    wallEast.castShadow = true;
    scene.add(wallEast);
}

const bedMaterial = new THREE.MeshLambertMaterial({ color: 0x4682B4 });
const headboardMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const nightstandMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
const bedsWest = [], bedsEast = [], headboardsWest = [], headboardsEast = [], nightstandsWestLeft = [], nightstandsWestRight = [], nightstandsEastLeft = [], nightstandsEastRight = [];
for (let i = 0; i < 4; i++) {
    const bedGeometryWest = new THREE.BoxGeometry(5, 1, 10);
    const bedWest = new THREE.Mesh(bedGeometryWest, bedMaterial);
    bedWest.position.set(-25 + i * 15, 6.5, -40);
    bedWest.receiveShadow = true;
    bedWest.castShadow = true;
    bedWest.userData = { info: `Cama ${i + 1} oeste - Habitación ${i + 1}` };
    scene.add(bedWest);
    bedsWest.push(bedWest);

    const headboardGeometry = new THREE.BoxGeometry(5, 2, 0.2);
    const headboardWest = new THREE.Mesh(headboardGeometry, headboardMaterial);
    headboardWest.position.set(-25 + i * 15, 7.5, -45);
    headboardWest.castShadow = true;
    headboardWest.receiveShadow = true;
    headboardWest.userData = { info: `Cabecera de cama ${i + 1} oeste` };
    scene.add(headboardWest);
    headboardsWest.push(headboardWest);

    const nightstandGeometry = new THREE.BoxGeometry(1, 1, 1);
    const nightstandWestLeft = new THREE.Mesh(nightstandGeometry, nightstandMaterial);
    nightstandWestLeft.position.set(-26.5 + i * 15, 6.5, -42);
    nightstandWestLeft.castShadow = true;
    nightstandWestLeft.receiveShadow = true;
    nightstandWestLeft.userData = { info: `Mesita izquierda de cama ${i + 1} oeste` };
    scene.add(nightstandWestLeft);
    nightstandsWestLeft.push(nightstandWestLeft);

    const nightstandWestRight = new THREE.Mesh(nightstandGeometry, nightstandMaterial);
    nightstandWestRight.position.set(-23.5 + i * 15, 6.5, -42);
    nightstandWestRight.castShadow = true;
    nightstandWestRight.receiveShadow = true;
    nightstandWestRight.userData = { info: `Mesita derecha de cama ${i + 1} oeste` };
    scene.add(nightstandWestRight);
    nightstandsWestRight.push(nightstandWestRight);

    const bedEast = new THREE.Mesh(bedGeometryWest, bedMaterial);
    bedEast.position.set(25 - i * 15, 6.5, -40);
    bedEast.receiveShadow = true;
    bedEast.castShadow = true;
    bedEast.userData = { info: `Cama ${i + 1} este - Habitación ${i + 5}` };
    scene.add(bedEast);
    bedsEast.push(bedEast);

    const headboardEast = new THREE.Mesh(headboardGeometry, headboardMaterial);
    headboardEast.position.set(25 - i * 15, 7.5, -45);
    headboardEast.castShadow = true;
    headboardEast.receiveShadow = true;
    headboardEast.userData = { info: `Cabecera de cama ${i + 1} este` };
    scene.add(headboardEast);
    headboardsEast.push(headboardEast);

    const nightstandEastLeft = new THREE.Mesh(nightstandGeometry, nightstandMaterial);
    nightstandEastLeft.position.set(23.5 - i * 15, 6.5, -42);
    nightstandEastLeft.castShadow = true;
    nightstandEastLeft.receiveShadow = true;
    nightstandEastLeft.userData = { info: `Mesita izquierda de cama ${i + 1} este` };
    scene.add(nightstandEastLeft);
    nightstandsEastLeft.push(nightstandEastLeft);

    const nightstandEastRight = new THREE.Mesh(nightstandGeometry, nightstandMaterial);
    nightstandEastRight.position.set(26.5 - i * 15, 6.5, -42);
    nightstandEastRight.castShadow = true;
    nightstandEastRight.receiveShadow = true;
    nightstandEastRight.userData = { info: `Mesita derecha de cama ${i + 1} este` };
    scene.add(nightstandEastRight);
    nightstandsEastRight.push(nightstandEastRight);
}

// Azotea con terraza (sin placas solares)
const terraceGeometry = new THREE.BoxGeometry(20, 0.1, 20);
const terraceMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const terrace = new THREE.Mesh(terraceGeometry, terraceMaterial);
terrace.position.set(25, 18.05, -45);
terrace.castShadow = true;
scene.add(terrace);

// Piscina Exterior con efecto de agua simplificado
const poolGeometry = new THREE.BoxGeometry(25, 0.1, 25);
const poolMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: time },
        baseColor: { value: new THREE.Color(0x00BFFF) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        varying vec2 vUv;

        void main() {
            float wave = sin(vUv.x * 15.0 + time * 2.0) * cos(vUv.y * 15.0 + time * 2.0) * 0.1;
            vec3 color = baseColor + vec3(wave, wave, wave * 0.5);
            gl_FragColor = vec4(color, 0.9); // Semi-transparente
        }
    `,
    transparent: true
});
const pool = new THREE.Mesh(poolGeometry, poolMaterial);
pool.position.set(45, 0.1, 45);
pool.receiveShadow = true;
scene.add(pool);

// Tumbonas alrededor de la piscina
const loungeChairGeometry = new THREE.BoxGeometry(2, 0.2, 4);
const loungeChairMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5F5 });
const loungeChairs = [];

function createLoungeChair(x, z, rotationY = 0) {
    const loungeChair = new THREE.Mesh(loungeChairGeometry, loungeChairMaterial);
    loungeChair.position.set(x, 0.1, z);
    loungeChair.rotation.y = rotationY;
    loungeChair.castShadow = true;
    loungeChair.receiveShadow = true;
    loungeChair.userData = { info: 'Tumbona junto a la piscina' };
    scene.add(loungeChair);
    loungeChairs.push(loungeChair);
    return loungeChair;
}

// Colocar tumbonas alrededor de la piscina
createLoungeChair(35, 55);          // Suroeste
createLoungeChair(55, 55);          // Sureste
createLoungeChair(35, 35, Math.PI); // Noroeste (rotada 180°)
createLoungeChair(55, 35, Math.PI); // Noreste (rotada 180°)

// Sombrillas alrededor de la piscina
const umbrellaPoleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 16);
const umbrellaPoleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const umbrellaCoverGeometry = new THREE.ConeGeometry(2, 1.5, 16);
const umbrellaCoverMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4500 });
const umbrellas = [];

function createUmbrella(x, z) {
    const umbrellaGroup = new THREE.Group();
    const pole = new THREE.Mesh(umbrellaPoleGeometry, umbrellaPoleMaterial);
    pole.position.set(0, 1.5, 0);
    umbrellaGroup.add(pole);

    const cover = new THREE.Mesh(umbrellaCoverGeometry, umbrellaCoverMaterial);
    cover.position.set(0, 3, 0);
    umbrellaGroup.add(cover);

    umbrellaGroup.position.set(x, 0, z);
    umbrellaGroup.castShadow = true;
    umbrellaGroup.receiveShadow = true;
    umbrellaGroup.userData = { info: 'Sombrilla junto a la piscina' };
    scene.add(umbrellaGroup);
    umbrellas.push(umbrellaGroup);
    return umbrellaGroup;
}

// Colocar sombrillas cerca de las tumbonas
createUmbrella(33, 55);  // Suroeste, cerca de la tumbona
createUmbrella(57, 55);  // Sureste, cerca de la tumbona
createUmbrella(33, 35);  // Noroeste, cerca de la tumbona
createUmbrella(57, 35);  // Noreste, cerca de la tumbona

// Mesas pequeñas junto a las tumbonas
const smallTableGeometry = new THREE.BoxGeometry(1, 0.5, 1);
const smallTableMaterial = new THREE.MeshLambertMaterial({ color: 0xDEB887 }); // Color madera
const smallTables = [];

function createSmallTable(x, z) {
    const smallTable = new THREE.Mesh(smallTableGeometry, smallTableMaterial);
    smallTable.position.set(x, 0.25, z);
    smallTable.castShadow = true;
    smallTable.receiveShadow = true;
    smallTable.userData = { info: 'Mesa junto a la piscina' };
    scene.add(smallTable);
    smallTables.push(smallTable);
    return smallTable;
}

// Colocar mesas cerca de las tumbonas
createSmallTable(34, 57);  // Suroeste, entre tumbona y sombrilla
createSmallTable(56, 57);  // Sureste, entre tumbona y sombrilla
createSmallTable(34, 33);  // Noroeste, entre tumbona y sombrilla
createSmallTable(56, 33);  // Noreste, entre tumbona y sombrilla

// Toallas sobre las tumbonas
const towelGeometry = new THREE.BoxGeometry(1.8, 0.05, 3.8);
const towelMaterial = new THREE.MeshLambertMaterial({ color: 0x00CED1 }); // Color turquesa
const towels = [];

function createTowel(x, z, rotationY = 0) {
    const towel = new THREE.Mesh(towelGeometry, towelMaterial);
    towel.position.set(x, 0.25, z); // Sobre la tumbona (0.1 + 0.15)
    towel.rotation.y = rotationY;
    towel.castShadow = true;
    towel.receiveShadow = true;
    towel.userData = { info: 'Toalla sobre la tumbona' };
    scene.add(towel);
    towels.push(towel);
    return towel;
}

// Colocar toallas sobre las tumbonas
createTowel(35, 55);          // Suroeste
createTowel(55, 55);          // Sureste
createTowel(35, 35, Math.PI); // Noroeste (rotada 180°)
createTowel(55, 35, Math.PI); // Noreste (rotada 180°)

// Césped alrededor de la piscina
const grassGeometry = new THREE.PlaneGeometry(40, 40);
const grassMaterial = new THREE.MeshLambertMaterial({ map: grassTexture });
const grass = new THREE.Mesh(grassGeometry, grassMaterial);
grass.position.set(45, 0.05, 45); // Centrado en la piscina, ligeramente elevado
grass.rotation.x = -Math.PI / 2;
grass.receiveShadow = true;
grass.castShadow = true;
grass.userData = { info: 'Césped alrededor de la piscina' };
scene.add(grass);

// Bar pequeño junto a la piscina con techo
const barCounterGeometry = new THREE.BoxGeometry(10, 1.5, 4);
const barCounterMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Color madera oscura
const barCounter = new THREE.Mesh(barCounterGeometry, barCounterMaterial);
barCounter.position.set(20, 1, 45); // A la izquierda de la piscina
barCounter.castShadow = true;
barCounter.receiveShadow = true;
barCounter.userData = { info: 'Bar junto a la piscina' };
scene.add(barCounter);

const barRoofGeometry = new THREE.BoxGeometry(12, 0.2, 6);
const barRoofMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 }); // Color gris oscuro
const barRoof = new THREE.Mesh(barRoofGeometry, barRoofMaterial);
barRoof.position.set(20, 2.5, 45); // Encima de la barra
barRoof.castShadow = true;
barRoof.receiveShadow = true;
scene.add(barRoof);

const barStoolGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16);
const barStoolMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 }); // Color metálico
const barStools = [];
function createBarStool(x, z) {
    const stool = new THREE.Mesh(barStoolGeometry, barStoolMaterial);
    stool.position.set(x, 0.4, z); // Altura ajustada para la barra
    stool.castShadow = true;
    stool.receiveShadow = true;
    stool.userData = { info: 'Taburete del bar' };
    scene.add(stool);
    barStools.push(stool);
    return stool;
}
// Colocar taburetes a lo largo de la barra
createBarStool(15, 47); // Frente a la barra
createBarStool(17, 47);
createBarStool(19, 47);
createBarStool(21, 47);
createBarStool(23, 47);
createBarStool(25, 47);

// Pistas de Tenis con líneas de campo, red ajustada y postes (con placas solares)
const tennisGeometry = new THREE.BoxGeometry(36, 0.5, 18);
const tennisMaterial = new THREE.MeshLambertMaterial({ map: tennisTexture });
const tennisCourts = [];
const tennisNets = [];
for (let i = 0; i < 3; i++) {
    const tennisCourt = new THREE.Mesh(tennisGeometry, tennisMaterial);
    tennisCourt.position.set(-28 + i * 40, 0.25, 10); // Desplazado 20 unidades hacia el este
    tennisCourt.castShadow = true;
    tennisCourt.receiveShadow = true;
    scene.add(tennisCourt);
    tennisCourts.push(tennisCourt);

    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const outerLineGeometry = new THREE.BoxGeometry(36.2, 0.1, 0.2);
    const outerLineBottom = new THREE.Mesh(outerLineGeometry, lineMaterial);
    outerLineBottom.position.set(-28 + i * 40, 0.26, 10 - 9);
    scene.add(outerLineBottom);
    const outerLineTop = new THREE.Mesh(outerLineGeometry, lineMaterial);
    outerLineTop.position.set(-28 + i * 40, 0.26, 10 + 9);
    scene.add(outerLineTop);
    const outerLineLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 18.4), lineMaterial);
    outerLineLeft.position.set(-28 + i * 40 - 18, 0.26, 10);
    scene.add(outerLineLeft);
    const outerLineRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 18.4), lineMaterial);
    outerLineRight.position.set(-28 + i * 40 + 18, 0.26, 10);
    scene.add(outerLineRight);

    const singlesLineGeometry = new THREE.BoxGeometry(13.34, 0.1, 0.2);
    const singlesLineBottom = new THREE.Mesh(singlesLineGeometry, lineMaterial);
    singlesLineBottom.position.set(-28 + i * 40, 0.26, 10 - 9);
    scene.add(singlesLineBottom);
    const singlesLineTop = new THREE.Mesh(singlesLineGeometry, lineMaterial);
    singlesLineTop.position.set(-28 + i * 40, 0.26, 10 + 9);
    scene.add(singlesLineTop);
    const singlesLineLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 18.4), lineMaterial);
    singlesLineLeft.position.set(-28 + i * 40 - 6.57, 0.26, 10);
    scene.add(singlesLineLeft);
    const singlesLineRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 18.4), lineMaterial);
    singlesLineRight.position.set(-28 + i * 40 + 6.57, 0.26, 10);
    scene.add(singlesLineRight);

    const centerLineGeometry = new THREE.BoxGeometry(0.2, 0.1, 18);
    const tennisCenterLine = new THREE.Mesh(centerLineGeometry, lineMaterial);
    tennisCenterLine.position.set(-28 + i * 40, 0.26, 10);
    scene.add(tennisCenterLine);

    const serviceLineGeometry = new THREE.BoxGeometry(13.34, 0.1, 0.2);
    const tennisServiceLineLeft = new THREE.Mesh(serviceLineGeometry, lineMaterial);
    tennisServiceLineLeft.position.set(-28 + i * 40, 0.26, 10 - 2.56);
    scene.add(tennisServiceLineLeft);
    const tennisServiceLineRight = new THREE.Mesh(serviceLineGeometry, lineMaterial);
    tennisServiceLineRight.position.set(-28 + i * 40, 0.26, 10 + 2.56);
    scene.add(tennisServiceLineRight);

    const netGeometry = new THREE.PlaneGeometry(36, 0.73);
    const netMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, opacity: 0.8, transparent: true });
    const tennisNet = new THREE.Mesh(netGeometry, netMaterial);
    tennisNet.position.set(-28 + i * 40, 0.615, 10);
    tennisNet.rotation.y = Math.PI / 2;
    scene.add(tennisNet);
    tennisNets.push(tennisNet);

    const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 16);
    const postMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const leftPost = new THREE.Mesh(postGeometry, postMaterial);
    leftPost.position.set(-28 + i * 40 - 18, 0.65, 10);
    leftPost.castShadow = true;
    scene.add(leftPost);
    const rightPost = new THREE.Mesh(postGeometry, postMaterial);
    rightPost.position.set(-28 + i * 40 + 18, 0.65, 10);
    rightPost.castShadow = true;
    scene.add(rightPost);

    const solarRoofGeometry = new THREE.BoxGeometry(38, 0.2, 20);
    const solarRoofMaterial = new THREE.MeshLambertMaterial({ color: 0x1C2526 });
    const solarRoof = new THREE.Mesh(solarRoofGeometry, solarRoofMaterial);
    solarRoof.position.set(-28 + i * 40, 10, 10);
    solarRoof.castShadow = true;
    scene.add(solarRoof);
}

// Pistas de Pádel con líneas de campo, red y postes (con placas solares)
const padelGeometry = new THREE.BoxGeometry(20, 0.5, 10);
const padelMaterial = new THREE.MeshLambertMaterial({ map: padelTexture });
const padelCourts = [];
const padelNets = [];
for (let i = 0; i < 3; i++) {
    const padelCourt = new THREE.Mesh(padelGeometry, padelMaterial);
    padelCourt.position.set(-30 + i * 25, 0.25, 30);
    padelCourt.castShadow = true;
    padelCourt.receiveShadow = true;
    scene.add(padelCourt);
    padelCourts.push(padelCourt);

    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const outerLineGeometry = new THREE.BoxGeometry(20.2, 0.1, 0.2);
    const outerLineBottom = new THREE.Mesh(outerLineGeometry, lineMaterial);
    outerLineBottom.position.set(-30 + i * 25, 0.26, 30 - 5);
    scene.add(outerLineBottom);
    const outerLineTop = new THREE.Mesh(outerLineGeometry, lineMaterial);
    outerLineTop.position.set(-30 + i * 25, 0.26, 30 + 5);
    scene.add(outerLineTop);
    const outerLineLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 10.4), lineMaterial);
    outerLineLeft.position.set(-30 + i * 25 - 10, 0.26, 30);
    scene.add(outerLineLeft);
    const outerLineRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 10.4), lineMaterial);
    outerLineRight.position.set(-30 + i * 25 + 10, 0.26, 30);
    scene.add(outerLineRight);

    const centerLineGeometry = new THREE.BoxGeometry(0.2, 0.1, 10);
    const padelCenterLine = new THREE.Mesh(centerLineGeometry, lineMaterial);
    padelCenterLine.position.set(-30 + i * 25, 0.26, 30);
    scene.add(padelCenterLine);

    const serviceLineGeometry = new THREE.BoxGeometry(20.2, 0.1, 0.2);
    const padelServiceLineLeft = new THREE.Mesh(serviceLineGeometry, lineMaterial);
    padelServiceLineLeft.position.set(-30 + i * 25, 0.26, 30 - 2.78);
    scene.add(padelServiceLineLeft);
    const padelServiceLineRight = new THREE.Mesh(serviceLineGeometry, lineMaterial);
    padelServiceLineRight.position.set(-30 + i * 25, 0.26, 30 + 2.78);
    scene.add(padelServiceLineRight);

    const netGeometry = new THREE.PlaneGeometry(10, 0.7);
    const netMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, opacity: 0.8, transparent: true });
    const padelNet = new THREE.Mesh(netGeometry, netMaterial);
    padelNet.position.set(-30 + i * 25, 0.6, 30);
    padelNet.rotation.y = Math.PI / 2;
    scene.add(padelNet);
    padelNets.push(padelNet);

    const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.72, 16);
    const postMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const leftPost = new THREE.Mesh(postGeometry, postMaterial);
    leftPost.position.set(-30 + i * 25 - 5, 0.61, 30);
    leftPost.castShadow = true;
    scene.add(leftPost);
    const rightPost = new THREE.Mesh(postGeometry, postMaterial);
    rightPost.position.set(-30 + i * 25 + 5, 0.61, 30);
    rightPost.castShadow = true;
    scene.add(rightPost);

    const solarRoofGeometry = new THREE.BoxGeometry(22, 0.2, 12);
    const solarRoofMaterial = new THREE.MeshLambertMaterial({ color: 0x1C2526 });
    const solarRoof = new THREE.Mesh(solarRoofGeometry, solarRoofMaterial);
    solarRoof.position.set(-30 + i * 25, 8, 30);
    solarRoof.castShadow = true;
    scene.add(solarRoof);
}

// Raycaster para interacción
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const interactiveObjects = [
    building, ...tennisCourts, ...padelCourts, pool, ...loungeChairs, ...umbrellas, ...smallTables, ...towels, grass, barCounter, barRoof, ...barStools,
    ...chairs, table, plant,
    ...bedsWest, ...bedsEast, ...headboardsWest, ...headboardsEast,
    ...nightstandsWestLeft, ...nightstandsWestRight, ...nightstandsEastLeft, ...nightstandsEastRight
];
const detailsDiv = document.getElementById('details');
const dayNightDiv = document.getElementById('dayNight');

// Farolas (ajustadas las dos del oeste)
const streetLightGeometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 16);
const streetLightMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
const lightBulbGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const lightBulbMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF99, emissive: 0xFFFF99 });
const streetLights = [];

function createStreetLight(x, z) {
    const pole = new THREE.Mesh(streetLightGeometry, streetLightMaterial);
    pole.position.set(x, 2.5, z);
    pole.castShadow = true;
    scene.add(pole);

    const bulb = new THREE.Mesh(lightBulbGeometry, lightBulbMaterial);
    bulb.position.set(x, 5, z);
    bulb.castShadow = true;
    scene.add(bulb);

    const light = new THREE.PointLight(0xFFFF99, 0, 20);
    light.position.set(x, 5, z);
    light.castShadow = true;
    scene.add(light);

    streetLights.push(light);
}

// Colocar farolas (ajustadas las dos del oeste)
createStreetLight(-50, 20);  // Tenis oeste, ajustado de -70 a -50
createStreetLight(-40, 40);  // Pádel oeste, ajustado de -60 a -40
createStreetLight(-30, 25);  // Tenis centro
createStreetLight(10, 20);   // Tenis este
createStreetLight(-30, 45);  // Pádel centro
createStreetLight(0, 40);    // Pádel este
createStreetLight(30, 55);   // Piscina suroeste
createStreetLight(60, 55);   // Piscina sureste

// Jardines con arbustos
const gardenGeometry = new THREE.PlaneGeometry(120, 20);
const gardenMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
const gardenNorth = new THREE.Mesh(gardenGeometry, gardenMaterial);
gardenNorth.position.set(0, 0.05, 55);
gardenNorth.rotation.x = -Math.PI / 2;
gardenNorth.receiveShadow = true;
scene.add(gardenNorth);
const gardenSouth = new THREE.Mesh(gardenGeometry, gardenMaterial);
gardenSouth.position.set(0, 0.05, -40);
gardenSouth.rotation.x = -Math.PI / 2;
gardenSouth.receiveShadow = true;
scene.add(gardenSouth);

const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x006400 });
const bushesNorth = [];
const bushesSouth = [];
for (let i = 0; i < 5; i++) {
    const bushNorth = new THREE.Mesh(bushGeometry, bushMaterial);
    bushNorth.position.set(-50 + i * 20, 0.5, 55);
    if (bushNorth.position.x < 32.5 || bushNorth.position.x > 57.5) {
        bushNorth.castShadow = true;
        scene.add(bushNorth);
        bushesNorth.push(bushNorth);
    }
}
for (let i = 0; i < 5; i++) {
    const bushSouth = new THREE.Mesh(bushGeometry, bushMaterial);
    bushSouth.position.set(-60 + i * 24, 0.5, -40);
    if (bushSouth.position.x < -35 || bushSouth.position.x > 35) {
        bushSouth.castShadow = true;
        scene.add(bushSouth);
        bushesSouth.push(bushSouth);
    }
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

// Etiquetas para puntos cardinales y otras áreas
const buildingLabel = createSign('Hotel 4*', new THREE.Vector3(0, 21, -30));
const tennisLabel = createSign('Pistas de Tenis', new THREE.Vector3(-8, 12, 10));
const padelLabel = createSign('Pistas de Pádel', new THREE.Vector3(0, 8, 30));
const poolLabel = createSign('Piscina', new THREE.Vector3(45, 5, 45));
const northLabel = createSign('Norte', new THREE.Vector3(0, 20, 50));
const southLabel = createSign('Sur', new THREE.Vector3(0, 20, -50));
const eastLabel = createSign('Este', new THREE.Vector3(50, 20, 0));
const westLabel = createSign('Oeste', new THREE.Vector3(-50, 20, 0));
const labels = [buildingLabel, tennisLabel, padelLabel, poolLabel];
const cardinalLabels = [northLabel, southLabel, eastLabel, westLabel];
scene.add(buildingLabel, tennisLabel, padelLabel, poolLabel, northLabel, southLabel, eastLabel, westLabel);

// Definición de createSign
function createSign(text, position) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = '#000000';
    context.fillRect(0, 0, 256, 64);
    context.font = '30px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.fillText(text, 128, 40);
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(20, 5, 1);
    sprite.position.copy(position);
    return sprite;
}

// Contorno para resaltar selección
const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00, side: THREE.BackSide });
let selectedObject = null;
let outlineMesh = null;

function createOutline(object) {
    if (outlineMesh) scene.remove(outlineMesh);
    const geometry = object.geometry ? object.geometry.clone() : new THREE.BoxGeometry(1, 1, 1);
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

// Corrección del error: Verificación de vectores en smoothZoom
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects);
    labels.forEach(label => label.visible = false);
    cardinalLabels.forEach(label => label.visible = true);
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
    const intersects = raycaster.intersectObjects(interactiveObjects);
    if (intersects.length > 0) {
        const intersected = intersects[0].object;
        selectedObject = intersected;
        createOutline(intersected);
        detailsDiv.style.display = 'block';
        let targetPosition, targetLookAt;
        if (intersected === building) {
            detailsDiv.innerHTML = 'Hotel 4*: 70 habitaciones, spa, gimnasio.<br>Superficie: 2,450 m²';
            targetPosition = new THREE.Vector3(50, 20, -50);
            targetLookAt = new THREE.Vector3(0, 9, -30);
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
            targetPosition = new THREE.Vector3(65, 20, 65);
            targetLookAt = new THREE.Vector3(45, 0, 45);
        } else if (intersected.userData && intersected.userData.info) {
            detailsDiv.innerHTML = intersected.userData.info;
            targetPosition = intersected.position.clone().add(new THREE.Vector3(5, 5, 5));
            targetLookAt = intersected.position.clone();
        } else {
            // Valor por defecto si no se encuentra un caso específico
            targetPosition = camera.position.clone();
            targetLookAt = controls.target.clone();
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
        smoothZoom(new THREE.Vector3(0, 14, -15), new THREE.Vector3(0, 11, -30), 1);
    }
}
window.addEventListener('dblclick', onDoubleClick);

// Interfaz
let isDay = true;
let isSummer = true;
const toggleLightButton = document.getElementById('toggleLight');
toggleLightButton.addEventListener('click', () => {
    isDay = !isDay;
    skyMaterial.uniforms.isDay.value = isDay ? 1.0 : 0.0;
    if (isDay) {
        directionalLight.intensity = 2.0;
        ambientLight.intensity = 0.8;
        nightLight.intensity = 0;
        volumetricLight.intensity = 0;
        interiorLight.intensity = 0.5;
        lamp.material.color.set(0xFFD700);
        dayNightDiv.textContent = 'Día';
        streetLights.forEach(light => light.intensity = 0);
        if (isSummer) {
            directionalLight.position.set(50, 70, 50);
        } else {
            directionalLight.position.set(50, 30, 50);
        }
    } else {
        directionalLight.intensity = 0.5;
        ambientLight.intensity = 0.3;
        nightLight.intensity = 1;
        volumetricLight.intensity = 0.5;
        interiorLight.intensity = 0.8;
        lamp.material.color.set(0xFFA500);
        dayNightDiv.textContent = 'Noche';
        streetLights.forEach(light => light.intensity = 1);
        if (isSummer) {
            directionalLight.position.set(-50, 70, -50);
        } else {
            directionalLight.position.set(-50, 30, -50);
        }
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
        detailsDiv.style.display = 'block';
        setTimeout(() => { detailsDiv.style.display = 'none'; }, 2000);
    } else {
        if (isSummer) {
            directionalLight.position.set(-50, 70, -50);
            detailsDiv.innerHTML = 'Verano: Noche';
        } else {
            directionalLight.position.set(-50, 30, -50);
            detailsDiv.innerHTML = 'Invierno: Noche';
        }
        detailsDiv.style.display = 'block';
        setTimeout(() => { detailsDiv.style.display = 'none'; }, 2000);
    }
});

let isRaining = false;
document.getElementById('resetRotation').addEventListener('click', () => {
    building.rotation.y = 0;
    isRaining = !isRaining;
    rain.visible = isRaining;
    if (isRaining) skyMaterial.uniforms.isDay.value = 0.5; // Cielo grisáceo durante lluvia
});

document.getElementById('viewHotel').addEventListener('click', () => {
    smoothZoom(new THREE.Vector3(50, 20, -50), new THREE.Vector3(0, 9, -30), 1);
});
document.getElementById('viewCourts').addEventListener('click', () => {
    smoothZoom(new THREE.Vector3(0, 20, 50), new THREE.Vector3(0, 0, 20), 1);
});
document.getElementById('viewPool').addEventListener('click', () => {
    smoothZoom(new THREE.Vector3(65, 20, 65), new THREE.Vector3(45, 0, 45), 1);
});

document.getElementById('colorChairsRed').addEventListener('click', () => {
    chairs.forEach(chair => {
        chair.children.forEach(child => child.material.color.set(0xFF0000));
    });
});
document.getElementById('colorChairsBlue').addEventListener('click', () => {
    chairs.forEach(chair => {
        chair.children.forEach(child => child.material.color.set(0x0000FF));
    });
});
document.getElementById('colorBedsGreen').addEventListener('click', () => {
    bedsWest.forEach(bed => bed.material.color.set(0x00FF00));
    bedsEast.forEach(bed => bed.material.color.set(0x00FF00));
});
document.getElementById('colorBedsPurple').addEventListener('click', () => {
    bedsWest.forEach(bed => bed.material.color.set(0x800080));
    bedsEast.forEach(bed => bed.material.color.set(0x800080));
});

// Animación
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    skyMaterial.uniforms.time.value = time;
    poolMaterial.uniforms.time.value = time;

    if (isRaining) {
        const rainPositions = rain.geometry.attributes.position.array;
        for (let i = 0; i < rainCount; i++) {
            rainPositions[i * 3 + 1] -= 0.5;
            if (rainPositions[i * 3 + 1] < 0) rainPositions[i * 3 + 1] = 50;
        }
        rain.geometry.attributes.position.needsUpdate = true;
    }

    bushesNorth.forEach((bush, i) => {
        bush.position.x = -50 + i * 20 + Math.sin(time + i) * 0.2;
    });
    bushesSouth.forEach((bush, i) => {
        bush.position.x = -60 + i * 24 + Math.cos(time + i) * 0.2;
    });

    loungeChairs.forEach((chair, i) => {
        chair.position.y = 0.1 + Math.sin(time + i) * 0.05;
    });

    umbrellas.forEach((umbrella, i) => {
        const cover = umbrella.children[1];
        cover.position.x = Math.sin(time + i) * 0.1;
    });

    smallTables.forEach((table, i) => {
        table.position.y = 0.25 + Math.sin(time + i + 2) * 0.03;
    });

    towels.forEach((towel, i) => {
        towel.position.y = 0.25 + Math.sin(time + i * 1.5) * 0.02;
    });

    grass.position.y = 0.05 + Math.sin(time * 0.5) * 0.01;

    barStools.forEach((stool, i) => {
        stool.position.y = 0.4 + Math.sin(time + i * 0.5) * 0.02;
    });

    if (!isDay) {
        volumetricLight.intensity = 0.5 + Math.sin(time) * 0.2;
        interiorLight.intensity = 0.8 + Math.cos(time) * 0.2;
        directionalLight.shadow.bias = -0.00005 + Math.sin(time) * 0.00002;
    } else {
        directionalLight.shadow.bias = -0.00005;
    }

    tennisNets.forEach(net => {
        net.position.y = 0.615 + Math.sin(time) * 0.05;
    });
    padelNets.forEach(net => {
        net.position.y = 0.6 + Math.sin(time) * 0.03;
    });

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