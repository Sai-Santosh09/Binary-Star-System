import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

const textureLoader = new THREE.TextureLoader();
const starTexture = textureLoader.load('./sun.jpg');

const camStart = new THREE.Vector3(-10,12,16);
const camEnd = new THREE.Vector3(10, 3, 10);
camera.position.copy(camStart);

const renderer = new THREE.WebGLRenderer({ antialias : true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const systemGroup = new THREE.Group();
scene.add(systemGroup);

const starGeometry = new THREE.BufferGeometry();
const starsCount = 2567;
const starPositions = new Float32Array(starsCount * 3);

for(let i = 0; i < starsCount * 3; i += 3){
    const radius = 100 + Math.random() * 200;
    const u = Math.random();
    const v = Math.random();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);

    starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starPositions[i + 2] = radius * Math.cos(phi);

}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starField = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
        color : 0xffffff,
        size : 0.5,
        transparent : true,
        opacity : 0.8,
        sizeAttenuation : true,
    })
    
);

scene.add(starField);

scene.add(new THREE.AmbientLight(0x0a0a15, 1.5));
const sunLight1 = new THREE.PointLight(0xfff3e0, 15, 150, 0.6);
const sunLight2 = new THREE.PointLight(0xe0f2fe, 15, 150, 0.6);
systemGroup.add(sunLight1, sunLight2);

const centerGeo = new THREE.SphereGeometry(0.15, 16,16);
const centerMat = new THREE.MeshBasicMaterial({
    color : 0x10b981,
    wireframe : true,
});

const centerMarker = new THREE.Mesh(centerGeo, centerMat);

systemGroup.add(centerMarker);

const starA = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshBasicMaterial({ 
        map : starTexture,
        color : 0xccfaff,
    })
);

const starB = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshBasicMaterial({ 
        map : starTexture,
        color : 0xff9955
     })
);

systemGroup.add(starA, starB);

const segments = 128;
function createOrbitLine() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array((segments + 1) * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return new THREE.LineLoop(
        geo,
        new THREE.LineBasicMaterial({
            color : 0xffffff,
            transparent : true,
            opacity : 0.5,
        })
    );    
}

const orbitA = createOrbitLine();
const orbitB = createOrbitLine();
systemGroup.add(orbitA, orbitB);

const totalDistance = 7.0;
let m1 = 1.0;
let m2 = 1.0;
let r1 = 0;
let r2 = 0;

function updateOrbitGeometry(line, radius){
    const positions = line.geometry.attributes.position.array;
    let index = 0;

    for(let i = 0; i <= segments; i++){
        const theta = (i / segments) * Math.PI * 2;
        positions [index++] = Math.cos(theta) * radius;
        positions [index++] = 0;
        positions [index++] = Math.sin(theta) * radius;
    }

    line.geometry.attributes.position.needsUpdate = true;
    line.geometry.computeBoundingSphere();
}

function updateSystem(){
    r1 = totalDistance * (m2 / (m1 + m2));
    r2 = totalDistance * (m1 / (m1 + m2));

    starA.scale.setScalar(Math.max(0.4, Math.sqrt(m1) * 0.8));
    starB.scale.setScalar(Math.max(0.4, Math.sqrt(m2) * 0.8));

    updateOrbitGeometry(orbitA, r1);
    updateOrbitGeometry(orbitB, r2);
}

updateSystem();

let targetScroll = 0;
let currentScroll = 0;
let isDragging = false;
let previousMousePosition = { x : 0, y : 0};

window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;
    if (maxScroll > 0){
        targetScroll = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    }
});

const canvas = renderer.domElement;

window.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x : e.clientX, y : e.clientY};
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    systemGroup.rotation.y += deltaX * 0.01;
    systemGroup.rotation.x += deltaY * 0.01;

    systemGroup.rotation.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI /2 , systemGroup.rotation.x)
    );

    previousMousePosition = { x : e.clientX, y : e.clientY};
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mouseleave', () => {
    isDragging = false;
});

let time = 0;
function animate(){
    requestAnimationFrame(animate);
    time += 0.01;

    starA.position.set(Math.cos(time) * r1, 0, Math.sin(time) * r1);
    starB.position.set(Math.cos(time + Math.PI) * r2, 0, Math.sin(time + Math.PI) * r2);

    sunLight1.position.copy(starA.position);
    sunLight2.position.copy(starB.position);

    starA.rotation.y += 0.01;
    starB.rotation.y += 0.01;
    centerMarker.rotation.y += 0.01;

    currentScroll += (targetScroll - currentScroll) * 0.05;
    camera.position.lerpVectors(camStart, camEnd, currentScroll);
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
