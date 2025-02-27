const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x87CEEB);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 50);
scene.add(directionalLight);

const terrainGeometry = new THREE.PlaneGeometry(120, 100);
const terrainMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
scene.add(terrain);

const buildingGeometry = new THREE.BoxGeometry(70, 12, 55);
const buildingMaterial = new THREE.MeshBasicMaterial({ color: 0xD2B48C });
const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
building.position.set(0, 6, -20);
scene.add(building);

const solarGeometry = new THREE.BoxGeometry(70, 0.2, 40);
const solarMaterial = new THREE.MeshBasicMaterial({ color: 0x1C2526 });
const solarPanels = new THREE.Mesh(solarGeometry, solarMaterial);
solarPanels.position.set(0, 12.1, -20);
scene.add(solarPanels);

const tennisGeometry = new THREE.BoxGeometry(36, 0.5, 18);
const tennisMaterial = new THREE.MeshBasicMaterial({ color: 0xFF4500 });
for (let i = 0; i < 3; i++) {
    const tennisCourt = new THREE.Mesh(tennisGeometry, tennisMaterial);
    tennisCourt.position.set(-36 + i * 40, 0.25, 30);
    scene.add(tennisCourt);
}

const padelGeometry = new THREE.BoxGeometry(20, 0.5, 10);
const padelMaterial = new THREE.MeshBasicMaterial({ color: 0x32CD32 });
for (let i = 0; i < 3; i++) {
    const padelCourt = new THREE.Mesh(padelGeometry, padelMaterial);
    padelCourt.position.set(-20 + i * 25, 0.25, 45);
    scene.add(padelCourt);
}

const poolGeometry = new THREE.BoxGeometry(25, 0.1, 25);
const poolMaterial = new THREE.MeshBasicMaterial({ color: 0x00CED1 });
const pool = new THREE.Mesh(poolGeometry, poolMaterial);
pool.position.set(40, 0.05, 40);
scene.add(pool);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 10;
controls.maxDistance = 200;

camera.position.set(100, 50, 100);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});