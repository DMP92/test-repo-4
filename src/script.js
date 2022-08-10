import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from 'gsap/all';
import { gsap } from 'gsap';
gsap.registerPlugin(ScrollToPlugin);

const onButton = document.querySelector('.onButton');
const offButton = document.querySelector('.offButton');

let scene1Status = 'on';
let scene2Status = 'off';
let scene3Status = 'off';

// onButton.addEventListener('click', () => {
//     scene2Status = 'on';
//     console.log(scene2Status);
// })

// offButton.addEventListener('click', () => {
//     scene2Status = 'off';
//     console.log(scene2Status);
// })

gsap.registerPlugin(ScrollTrigger);

// import * as dat from 'lil-gui'
// import { LinearEncoding, sRGBEncoding } from 'three';

let deltaTime = null;

// Elements
const overlayPanel = document.querySelector('.loading-overlay');
const loadingBar = document.querySelector('.loading-bar');
const enterButton = document.querySelector('.enter');
const loadingScreenText = document.querySelector('.loading-screen-text');
const webgl = document.querySelector('.webgl');
const body = document.body;

// When enter button is pressed remove overlay
function enter() 
{
    // Remove overlay
    gsap.to(overlayPanel, { duration: 2, backgroundColor: 'transparent'})
    gsap.to(enterButton, { duration: 2, color: 'transparent', borderColor: 'transparent'})
    gsap.to(loadingScreenText.childNodes, { duration: 2, color: 'transparent'})
    
    // Make scene 2 invisible
    parameters.sceneOptions.scene2.sceneObject.visible = true;
    // micelleMixer2.timeScale = 0;
    
    setTimeout(() => {
        gsap.to(parameters.sceneOptions.scene1, { duration: 0.5, value: 1 })
        parameters.sceneOptions.scene2.sceneObject.opacity = 0;
    }, 2000);
    
    setTimeout(() => {
        overlayPanel.style.display = 'none';

        gsap.to(particlesMaterial, { duration: 3, opacity: 1 })

        body.classList.remove('stop-scrolling');
        webgl.classList.remove('stop-scrolling');
        // Remove enter button
        webgl.style.position = 'relative !important'
        body.style.cssText = 'overflow-y: scroll !important; overflow-x: hidden;';
    }, 2500);
}

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        // Iterate through chemistry children
        iterateChemistry();

        // Remove loading bar
        setTimeout(() => { 
            loadingBar.classList.add('ended');
            loadingBar.style.transform = '';
        }, 500);
        
        // Show enter button
        setTimeout(() => 
        {
            
            enterButton.style.display = 'block';
            enterButton.addEventListener('click', () =>
            {
                enter();
            })
        }, 1500);
    },
    // Progress
    (itemsUrl, itemsLoaded, itemsTotal) => 
    {
        // Prevent scrolling while page is loading resources
        body.classList.add('stop-scrolling');
        webgl.classList.add('stop-scrolling');

        let progressRatio = itemsLoaded / itemsTotal;
        loadingBar.style.transform = `scaleX(${progressRatio})`;
    }
);

const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
// const gui = new dat.GUI();

const parameters = {
    lightColor: 0xffffff,
    headColor: 0xffffff,
    tailColor: 0xffffff,
    ambientBright: 1,
    rectLight: 0,
    pointLight: 400,
    particleColor: 'white',
    sceneOptions: 
    {
        scene1: { value: 0, position: { x: 0, y: 0, z: 0}, sceneObject: null },
        scene2: { value: 0, position: { x: 0, y: 0, z: 0}, sceneObject: null },
        scene3: { value: 0, position: { x: 0, y: 0, z: 0} }
    }
}

// gui
//     .addColor(parameters, 'particleColor')
//     .onChange(() => {
//         particlesMaterial.color.set(parameters.particleColor);
//     })

// gui
//     .addColor(parameters, 'headColor')
//     .onChange(() => {
//         headMaterial.color.set(parameters.headColor);
//     })

// gui
//     .addColor(parameters, 'tailColor')
//     .onChange(() => {
//         tailMats.color.set(parameters.tailColor);
//     })

// gui 
//     .add(parameters, 'ambientBright').min(0).max(50).step(0.25)
//     .onChange(() => {
//         ambientLight.intensity = (parameters.ambientBright);
//         blackAmbientLight.intensity = (parameters.ambientBright);
//     })
    
// gui
//     .add(parameters, 'rectLight').min(0).max(500).step(0.25)
//     .onChange(() => {
//         rectAreaLight.intensity = (parameters.rectLight);
//         rectAreaLight2.intensity = (parameters.rectLight);
//         rectAreaLight3.intensity = (parameters.rectLight);
//         rectAreaLight4.intensity = (parameters.rectLight);
//     })
    
// gui
//     .add(parameters, 'pointLight').min(0).max(50).step(0.25)
//     .onChange(() => {
//         pointLight.intensity = (parameters.pointLight);
//         pointLight2.intensity = (parameters.pointLight);
//         pointLight3.intensity = (parameters.pointLight);
//     })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const scene2 = new THREE.Scene();
const scene3 = new THREE.Scene();

// Textures
 const textureLoader = new THREE.TextureLoader(loadingManager);

//  Update all materials
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            
        }
    })
}

/**
 * Particles
 */
const particlesTexture = textureLoader.load('/Textures/Particles/1.png');

const objectsDistance = 4;

 let particlesCount = 1000;
 const positions = new Float32Array(particlesCount * 3);
 
 for (let i = 0; i < particlesCount; i++) {
     positions[i * 3 + 0] = (Math.random() - .5) * 10;
     positions[i * 3 + 1] = objectsDistance * 1 - Math.random() * objectsDistance * 3;
     positions[i * 3 + 2] = (Math.random() - .5) * 10;
 }
 
 const particlesGeometry = new THREE.BufferGeometry();
 particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
 
 // Material
 const particlesMaterial = new THREE.PointsMaterial({
     color: '#174AA6',
     sizeAttenuation: true,
     size: .09,
     alphaTest: .001,
     transparent: true,
     alphaMap: particlesTexture,
     depthWrite: false,
     alphaTest: 0.001,
     opacity: 0
 });

 // Particles
 const particles = new THREE.Points(particlesGeometry, particlesMaterial);
//  scene.add(particles)

// Lights
const lights = 
{
    color: parameters.lightColor,
}

const pointLight = new THREE.PointLight('white', 25);
pointLight.castShadow = true;
pointLight.shadow.normalBias = 0.0000001;
pointLight.shadow.bias = -0.000001;
pointLight.shadow.mapSize.width = 1024 * 4;
pointLight.shadow.mapSize.height = 1024 * 4;
pointLight.shadow.camera.near = .1;
pointLight.shadow.camera.far = 10;
pointLight.position.set(-0, 1, 4);

let pointLightScene2 = pointLight.clone();
let pointLightScene3 = pointLight.clone();

scene.add(pointLight);
scene2.add(pointLightScene2);
scene3.add(pointLightScene3);

const pointLight2 = new THREE.PointLight('blue', 400);

// pointLight2.castShadow = true;
// pointLight2.shadow.normalBias = 0.1;
// pointLight2.shadow.bias = 0.0001;
scene.add(pointLight2);
pointLight2.position.set(-10, 0, -30);
pointLight2.color.setHex(0xFFFFFF).convertSRGBToLinear()
let pointLight2Scene2 = pointLight2.clone();
let pointLight2Scene3 = pointLight2.clone();
scene2.add(pointLight2Scene2);
scene3.add(pointLight2Scene3);


const pointLight3 = new THREE.PointLight('white', parameters.pointLight);
pointLight3.position.set(100, -25, -1);

let pointLight3Scene2 = pointLight3.clone();
let pointLight3Scene3 = pointLight3.clone();
// pointLight3.castShadow = true;
// pointLight3.shadow.normalBias = 0.1;
// pointLight3.shadow.bias = 0.0001;
scene.add(pointLight3);
scene2.add(pointLight3Scene2);
scene3.add(pointLight3Scene3);

const pointLightHelper = new THREE.PointLightHelper(pointLight3);
scene.add(pointLightHelper);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
scene2.add(cameraGroup);
scene3.add(cameraGroup);

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100)
cameraGroup.add(camera);

cameraGroup.position.set(0, 0, 3);


window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    
    // Update camera
    canvas.style.width = `${window.innerWidth} !important`;
    canvas.style.height = `${window.innerHeight} !important`;
    
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    
    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // setModel();
})

// Draco loader
const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('/draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

// Cube Textures
const environmentMap = cubeTextureLoader.load([
    '/Images/Standard-Cube-Map/nx.jpg',
    '/Images/Standard-Cube-Map/ny.jpg',
    '/Images/Standard-Cube-Map/nz.jpg',
    '/Images/Standard-Cube-Map/px.jpg',
    '/Images/Standard-Cube-Map/py.jpg',
    '/Images/Standard-Cube-Map/pz.jpg',
])
environmentMap.encoding = THREE.sRGBEncoding;
scene.environment = environmentMap;
scene2.environment = environmentMap;
scene3.environment = environmentMap;

// Displacement
// const fabric2Disp = textureLoader.load('/Baked Images/Displacement/Abstract_002_DISP.png');
// const snowDisp = textureLoader.load('/Baked Images/Displacement/Snow/Snow_001_DISP.png');
const contaminantDisp = textureLoader.load('/Baked Images/Displacement/RoadDirt017_DISP_3K.jpg')
contaminantDisp.flipY = false;

// Test sphere materials
const testColor = textureLoader.load('/Baked Images/Color/RoadDirt017_COL_3K-min.jpg');
testColor.encoding = THREE.sRGBEncoding;
const testAO = textureLoader.load('/Baked Images/Color/RoadDirt017_AO_3K-min.jpg');
testAO.encoding = THREE.sRGBEncoding;
const testNRM = textureLoader.load('/Baked Images/Normals/RoadDirt017_NRM_3K-min (1).jpg');
testNRM.encoding = THREE.sRGBEncoding;
const testRO = textureLoader.load('/Baked Images/Roughness/RoadDirt017_GLOSS_3K-min.jpg');
testRO.encoding = THREE.sRGBEncoding;

// Normals
// const concreteNormals = textureLoader.load('/Baked Images/Normals/Concrete_Muddy_001_Normal.jpg')
// const concreteRough = textureLoader.load('/Baked Images/Roughness/Concrete_Muddy_001_Roughness.jpg')
// const concreteAO = textureLoader.load('/Baked Images/Roughness/Concrete_Muddy_001_AmbientOcclusion.jpg')
// const normalHeads = textureLoader.load('/Baked Images/Normals/download.jpg')
const normalHeads2 = textureLoader.load('/Baked Images/Normals/download-1.jpg')
// const fabricNormals = textureLoader.load('/Baked Images/Normals/Fabric_Knitted_006_normal.jpg')
// const fabricNormals2 = textureLoader.load('/Baked Images/Normals/Abstract_002_NRM.jpg')
// const snowNorm = textureLoader.load('/Baked Images/Normals/Snow_001_NORM.jpg');

// Roughness
// const snowRough = textureLoader.load('/Baked Images/Roughness/Snow_001_ROUGH.jpg')

// Matcaps
const blueMatcap = textureLoader.load('/Baked Images/Matcaps/blue-matcap-11.jpg');
blueMatcap.encoding = THREE.sRGBEncoding;

const darkGreyMatcap = textureLoader.load('/Baked Images/Matcaps/dark-grey-matcap.jpg');
darkGreyMatcap.encoding = THREE.sRGBEncoding;

const greenMatcap = textureLoader.load('/Baked Images/Matcaps/green-matcap.jpg');
greenMatcap.encoding = THREE.sRGBEncoding;

const greyMatcap = textureLoader.load('/Baked Images/Matcaps/blue-matcap-2.jpg');
greyMatcap.encoding = THREE.sRGBEncoding;

const orangeMatcap = textureLoader.load('/Baked Images/Matcaps/orange-matcap.jpg');
// orangeMatcap.encoding = THREE.sRGBEncoding;

const offwhiteMatcap = textureLoader.load('/Baked Images/Matcaps/offwhite-matcap.jpg');
offwhiteMatcap.encoding = THREE.sRGBEncoding;

const gloomyBlueMatcap = textureLoader.load('/Baked Images/Matcaps/gloomy-blue-matcap.png');

const shinyBlueMatcap = textureLoader.load('/Baked Images/Matcaps/shiny-blue-matcap.png');
const aquaBlueMatcap = textureLoader.load('/Baked Images/Matcaps/aqua-blue-matcap.png');
const blenderBlueMatcap = textureLoader.load('/Baked Images/Matcaps/blender-blue-matcap.png');
const blenderBlueMatcap2 = textureLoader.load('/Baked Images/Matcaps/blender-blue-matcap-2.png');
const blenderBlueMatcap3 = textureLoader.load('/Baked Images/Matcaps/blender-blue-matcap-3.png');
const blenderBlueMatcap4 = textureLoader.load('/Baked Images/Matcaps/blender-blue-matcap-4.png');

// const tailMats = new THREE.MeshPhongMaterial({ 
//     shininess: 20,
//     specular: 'whitesmoke',
//     color: '#ff5900',
// });
// const greenFog = new THREE.Fog();
// greenFog.color = '#138626'

const darkGreyMats = new THREE.MeshStandardMaterial({
    color: '#2a2a2e',
    roughness: 1,
    transparent: true,
    envMap: environmentMap,
    envMapIntensity: 1,
    metalness: 0.25
})

const greenMats = new THREE.MeshStandardMaterial({
    color: '#35B44A',
    roughness: 1,
    metalness: 0.4,
    transparent: true,
    envMap: environmentMap,
    envMapIntensity: 2,
})

const blueHydroMats = new THREE.MeshStandardMaterial({
    color: '#0e4d99',
    roughness: 1,
    metalness: 0.4,
    transparent: true,
    envMap: environmentMap,
    envMapIntensity: 5,
    opacity: parameters.sceneOptions.scene2.value,
})

// const blueHydroMats = new THREE.MeshMatcapMaterial({ matcap: orangeMatcap })

const offWhiteMaterial = new THREE.MeshStandardMaterial({
    color: 'white', 
    envMap: environmentMap, 
    envMapIntensity: 0.25, 
    roughness: 1, 
    metalness: 0.4,
    transparent: true, 
    opacity: parameters.sceneOptions.scene1.value 
})

const blueMats = new THREE.MeshMatcapMaterial({
    matcap: blenderBlueMatcap3,
    transparent: true,
    displacementScale: 0.005,
    shadeSmooth: true
})

const tailMats = new THREE.MeshMatcapMaterial({
    matcap: orangeMatcap,
    transparent: true,
    opacity: parameters.sceneOptions.scene1.value,
})

const orangeIcoMats = new THREE.MeshMatcapMaterial({
    matcap: orangeMatcap,
    transparent: true,
    opacity: parameters.sceneOptions.scene2.value,
})

const contaminantMats = textureLoader.load('/Baked Images/Color/RoadDirt017_COL_3K-min.jpg');
contaminantMats.flipY = false;
contaminantMats.encoding = THREE.sRGBEncoding;

const contaminantNormals = textureLoader.load('/Baked Images/Normals/RoadDirt017_NRM_3K-min (1).jpg');
contaminantNormals.flipY = false;

const contaminantGEO = new THREE.SphereBufferGeometry(1, 32, 32);
const contaminant = new THREE.MeshStandardMaterial({ 
    // wireframe: true,
    transparent: true, 
    envMapIntensity: 1.5,
    map: testColor, 
    aoMap: testAO, 
    roughnessMap: testRO, 
    roughness: 0.25, 
    normalMap: testNRM, 
    displacementMap: contaminantDisp, 
    displacementScale: 0.1, 
    // color: '#FFCBCB',
    // color: '#c0bbb6',
    opacity: parameters.sceneOptions.scene1.value,
});
contaminant.encoding = THREE.sRGBEncoding;

// const bakedMats = textureLoader.load('/Baked Images/Micelle Head_CO5.jpg');
// bakedMats.encoding = THREE.sRGBEncoding;
// bakedMats.flipY = false;
// const headMats = new THREE.MeshStandardMaterial({ map: bakedMats });
let turnedMesh = null;

const headMaterial = new THREE.MeshStandardMaterial({ 
    color: '#3049A5', 
    envMap: environmentMap, 
    envMapIntensity: 5, 
    roughness: 1, 
    metalness: 0.4, 
    // normalMap: normalHeads2,
    transparent: true, 
    opacity: parameters.sceneOptions.scene1.value 
})

const cubeGeo2 = new THREE.BoxBufferGeometry(1, 1, 1);
const cubeGeo3 = new THREE.BoxBufferGeometry(1, 1, 1);

const sphereGeo2 = new THREE.SphereBufferGeometry(1, 32, 32);
const sphereExample = new THREE.Mesh( sphereGeo2, blueMats );

sphereExample.position.set(0, 0, 0);

// scene.add(sphereExample);

const cube2 = new THREE.Mesh(cubeGeo2, blueMats);
const cube3 = new THREE.Mesh(cubeGeo3, headMaterial);

cube2.position.set(0, 0, 0)
cube2.rotation.y = Math.PI * 0.25;
cube3.position.set(1, 1, 1)

// scene.add(cube2);
// scene3.add(cube3);


// head color - color: '#010d6a'

/**
 * Mixers
 */
 const mixers = []

 let micelleMixer1 = null;
 let micelleMixer2 = null;
 let micelleMixer3 = null;
 let micelleMixer4 = null;
 let micelleMixer5 = null;
 
 /**
  * Meshes
  */
 const mesh = [];

const animations = [];
const motionArray = {};
motionArray.spheres = {};


const motionArray2 = [];

const gltfSceneOptions = {};
gltfSceneOptions.scale = 1.25

let chemistryChildren = null;
let sceneOptions = {};

function iterateChemistry() {
    if (chemistryChildren !== null)
    {
        for (let i = 0; i < chemistryChildren.length; i++)
        {
            // If multiple children
            if (chemistryChildren[i].children.length - 1 >= 1)
            {
                let mesh = chemistryChildren[i].children;

                for (let j = 0; j < mesh.length; j++)
                {
                    let orangeIco = mesh[j].name.search('Orange');
                    let blueIco = mesh[j].name.search('Blue');
                    let textIco = mesh[j].name.search('Text');
                    // console.log('list item', mesh[j].name)
                    switch(true)
                    {
                        case orangeIco !== -1:
                                chemistryChildren[i].children[j].material = orangeIcoMats;
                            break;
                            case blueIco !== -1:
                                chemistryChildren[i].children[j].material = blueHydroMats;
                            break;
                            case textIco !== -1:
                                chemistryChildren[i].children[j].material = offWhiteMaterial;
                            break;
                    }
                }
            }
            // If only one child
            else 
            {
                let whiteIco = chemistryChildren[i].children[0].name.search('White');
                let connector = chemistryChildren[i].children[0].name.search('Cube');
                switch(true)
                {
                    case whiteIco !== -1:
                        chemistryChildren[i].children[0].material = offWhiteMaterial;
                        break;
                        case connector !== -1:
                        chemistryChildren[i].children[0].material = darkGreyMats;
                }
            }
        }
    }
}

let object = null;

let meshes = {};

gltfLoader.load(
	// resource URL
	'/Models/cool-ox-export-6-15.glb',
	// called when the resource is loaded
	( gltf ) =>
    {
        // GLTF
        console.log('GLTF', gltf)

        object = gltf.scene;

        // Scene 1
        sceneOptions.scenes = [];

        sceneOptions.scenes.push(gltf.scene.children[1]);

        // Scene 2
        sceneOptions.scenes.push(gltf.scene.children[2]);

        // Scene rotation
        gltf.scene.rotation.y = - Math.PI * 0.5;

        // Child 1
        gltf.scene.position.set(-0.1, 0, -0.1)
        // gltf.scene.rotation.y = - (Math.PI * .5);

        // Child 2
        // gltf.scene.children[1].position.set(8, 2, -1)

		// gltf.scene.scale.set(gltfSceneOptions.scale, gltfSceneOptions.scale, gltfSceneOptions.scale)
        gltf.scene.scale.set(0.75, 0.75, 0.75)

        turnedMesh = gltf.scene;
        gltf.scene.traverse((child) =>
        {
            /**
             * Scene 1 - Micelle
             */

            child.castShadow = true;
            child.receiveShadow = true;
            child.encoding = THREE.sRGBEncoding;

            // Chemistry Armature
            // Micelle Armature 2

            const wholeMicelle = gltf.scene.children[6];
            // wholeMicelle.position.set(-1, 0, -2)
            wholeMicelle.position.z = 0.6;
            wholeMicelle.position.x = 1;
            wholeMicelle.rotation.y = - Math.PI * 0.25;

            
            // Right Micelle Parts
            const headRight = gltf.scene.children[6].children[2].children.find(child => child.name === 'Low_poly_micelle_head008');
            headRight.material = blueHydroMats;
            motionArray.head = headRight;

            const tailsRight = gltf.scene.children[6].children[2].children.find(child => child.name === 'Low_poly_micelle_tails011');
            tailsRight.material = tailMats;
            motionArray.tails = tailsRight;

            // Left Micelle Parts
            const headLeft = gltf.scene.children[6].children[0].children.find(child => child.name === 'Low_poly_micelle_head101');
            headLeft.material = blueHydroMats;

            const tailsLeft = gltf.scene.children[6].children[0].children.find(child => child.name === 'Low_poly_micelle_tails054');
            tailsLeft.material = tailMats;

            // Contaminant
            const contaminantSphere = gltf.scene.children[6].children[3].children.find(child => child.name === 'Sphere012');
            contaminantSphere.material = contaminant;
            contaminantSphere.geometry = contaminantGEO;
            motionArray.contaminant = contaminantSphere;

            // Chemistry 
            
            const chemistryWhole = gltf.scene.children[2].children[0];
            chemistryChildren = gltf.scene.children[2].children[0].children;
        })
            
        // Push meshes into array
        mesh.push(gltf.scene.children[1])
        mesh.push(gltf.scene.children[2])

        mesh[0].transparent = true;
        mesh[1].transparent = true;

        const axisHelper = new THREE.AxesHelper();
        // scene.add(axisHelper);

        let axisHelper2 = axisHelper.clone();
        // scene2.add(axisHelper2);

        parameters.sceneOptions.scene2.sceneObject = gltf.scene.children[1];

        mesh[0].opacity = parameters.sceneOptions.scene1.value;
        mesh[0].opacity = parameters.sceneOptions.scene2.value;

        // let scene1Micelle = gltf.scene.children[6].clone();
        let scene2Micelle = gltf.scene.children[6].clone();
        scene2Micelle.rotation.y = - Math.PI * 0.85;

        meshes.micelle1 = gltf.scene.children[6];
        
        gltf.scene.children[6].position.set(0, 0, -1)

        meshes.micelle2 = scene2Micelle;


        meshes.chemistry1 = gltf.scene.children[2];
        meshes.chemistry1.rotation.y = - Math.PI * 0.5;

        scene.add(meshes.micelle1);
        scene2.add(scene2Micelle);
        scene3.add(gltf.scene.children[2]);

        console.log('POST GLTF', gltf);
        
        // Mixers
        micelleMixer1 = new THREE.AnimationMixer(scene2Micelle);
        micelleMixer2 = new THREE.AnimationMixer(meshes.chemistry1);

        // Actions
        const micelleEnter = micelleMixer1.clipAction(gltf.animations[4]);
        const micelleOpen = micelleMixer1.clipAction(gltf.animations[8]);
        const chemistryAnimation1 = micelleMixer2.clipAction(gltf.animations[3]);
        
        // // Play actions
        // Prevent objects from disappearing @ action's end
        micelleEnter.clampWhenFinished = true;
        micelleOpen.clampWhenFinished = true;
        chemistryAnimation1.clampWhenFinished = true;
        
        // Push actions outside of this function
        animations.push(micelleEnter);
        animations.push(micelleOpen);
        animations.push(chemistryAnimation1);
        
        // Push each mixer into Mixer object
        mixers.push(micelleMixer1);
        mixers.push(micelleMixer2);

        // Sections
        const section1 = document.querySelector('.section-0');
        const section2 = document.querySelector('.section-1');
        const section3 = document.querySelector('.section-2');

        
        // Create action functions
        // createAnimation(micelleMixer1, micelleMotion1, gltf.animations[0]);
        // createAnimation(micelleMixer2, hydroRotate, gltf.animations[2]);

        // Control animation timelines
        
        // Micelle Enter Play
        let micelleEnterTimes = 'play';

        let micelleEnterTime = {
            // get time() {
            //     return micelleMixer1.time;
            // },
            // set time(value) {
            //     if (micelleEnterTimes !== 'pause')
            //     {
            //         micelleEnter.paused = false;
            //         micelleMixer1.setTime(value);
            //         micelleEnter.paused = true;
            //     }
            // }
        }

        let micelleOpenTime = {
            get time() {
                return micelleMixer1.time;
            },
            set time(value) {
                micelleOpen.paused = false;
                micelleMixer1.setTime(value);
                micelleOpen.paused = true;
            }
        };

        let chemistryAnimateTime = {
            get time() {
                return micelleMixer2.time;
            },
            set time(value) {
                chemistryAnimation1.paused = false;
                micelleMixer2.setTime(value);
                chemistryAnimation1.paused = true;
            }
        };

        function enterSection2() 
        {

        }

        // Micelle Enter Animate
        const s0 = gsap.timeline({
            scrollTrigger:
            {
                trigger: '.section-0',
                start: "top top",
                end: "+=1000%",
                pin: true,
                scrub: true,

                onUpdate: function (self) {
                    camera.updateProjectionMatrix();
                    if (self.progress > 0.95)
                    {
                        console.log(self.direction)
                        micelleEnterTimes = 'pause'
                    }
                    if (self.progress <= 0.5)
                    {
                        micelleEnterTimes = 'play';
                    }

                    scrollDirection = self.direction;
                },
                // Play animations
                onEnter: (self) => 
                {
                    gsap.to(parameters.sceneOptions.scene2, { duration: 0.5, value: 1 });
                    gsap.to(parameters.sceneOptions.scene1, { duration: 0.5, value: 1 });
                    micelleEnter.play();
                    scene1Status = 'on';
                    scene2Status = 'off';
                    scene3Status = 'off';
                    console.log(self);
                },
                // Disappear when leaving scroll
                onLeave: (self) => 
                {
                    activeScroll = 0;
                    // Fade out
                    scene1Status = 'on';
                    scene2Status = 'off';

                    micelleOpen.play();
                    // micelleOpen.paused = true;
                    // Disable scroll and prepare the next section
                    body.style.overflowY = 'hidden';
                    gsap.to(window, { duration: 2, scrollTo: { y: section2.getBoundingClientRect().top + 200  } })
                    meshes.micelle1.rotation.y = 0;
                    gsap.to(meshes.micelle1.position, { x: 1, y: 0, z: 0.6, duration: 1.35 })
                    gsap.to(meshes.micelle1.rotation, { y: - Math.PI * 0.85, duration: 1.35 })
                    micelleOpen.crossFadeFrom(micelleEnter, 0);
                },
                // Show up when scrolling back up
                onEnterBack: () => 
                {
                    activeScroll = passiveScroll;
                    body.style.overflowY = 'scroll';

                    scene1Status = 'on';
                    scene2Status = 'off';
                    micelleEnterTimes = 'play';
                    micelleEnter.paused = false;
                    micelleEnter.play();
                    micelleEnter.crossFadeFrom(micelleOpen, 0);

                    micelleOpen.reset();
                    
                    console.log('S1 Enter Back');
                },
            }
        })
        s0.to(micelleEnterTime, {
            time: gltf.animations[4].duration,
            repeat: 0
        })

        // Micelle Rotate Animate
        const s1 = gsap.timeline({
            scrollTrigger:
            {
                trigger: '.section-1',
                start: "top top",
                end: "+=1000%",
                pin: true,
                scrub: true,

                onUpdate: function (self) {
                    camera.updateProjectionMatrix();
                    scrollDirection = self.direction;
                },
                // Play animations
                onEnter: (self) => 
                {
                    body.style.overflowY = 'scroll';
                    scene1Status = 'off';
                    scene2Status = 'on';
                    scene3Status = 'off';
                    console.log('ENTER SECTION 1')
                    micelleOpen.play();
                    micelleOpen.clampWhenFinished = true;
                },
                // Disappear when leaving scroll
                onLeave: () => 
                {
                    // Fade out
                    scene1Status = 'off';
                    scene2Status = 'off';
                    gsap.to(parameters.sceneOptions.scene2, { duration: 0.5, value: 0 });
                    setTimeout(() => { gltf.scene.children[1].children[0].visible = false }, 400);
                    // setTimeout(() => { scene2Status = 'off' }, 400);
                    console.log('LEAVE');
                },
                // Show up when scrolling back up
                onEnterBack: () => 
                {
                    scene1Status = 'off';
                    scene2Status = 'on';
                    scene3Status = 'off';
                    // pointLight.intensity = 25;
                    micelleOpen.play();
                    // micelleOpen.clampWhenFinished = true;
                    console.log('S1 Enter Back')
                    
                    gsap.to(parameters.sceneOptions.scene2, { duration: 0.5, value: 1 });
                    gsap.to(parameters.sceneOptions.scene1, { duration: 0.5, value: 1 });
                },
                onLeaveBack: () => 
                {
                    scene1Status = 'on';
                    scene2Status = 'off';

                    body.style.overflowY = 'hidden';
                    gsap.to(window, { duration: 2, scrollTo: { y: section1.getBoundingClientRect().top - (section1.getBoundingClientRect().height + 200) } })
                    gsap.to(meshes.micelle1.position, { x: 0, y: 0, z: -1, duration: 2.1 })
                    gsap.to(meshes.micelle1.rotation, { y: 0, duration: 2.1 })
                    // micelleOpen.clampWhenFinished = false;
                    console.log('on leave back')
                }
            }
        })
        s1.to(micelleOpenTime, {
            time: gltf.animations[5].duration,
            repeat: 0
        })
        
        // Second animation
        const s2 = gsap.timeline({
            scrollTrigger:
            {
                trigger: '.section-2',
                start: 'top top',
                end: '+=6000%',
                pin: true,
                scrub: true,

                // Play animations
                onUpdate: function () {
                    camera.updateProjectionMatrix();
                },

                onEnter: () => 
                {
                    scene1Status = 'off';
                    scene2Status = 'off';
                    scene3Status = 'on';
                    // pointLight.intensity = 18;
                    console.log('enter section 2');

                    meshes.micelle2.visible = false;
                    gsap.to(parameters.sceneOptions.scene2, { duration: 0.5, value: 1 });
                    gsap.to(orangeIcoMats, { duration: 0.5, opacity: 1 });
                    chemistryAnimation1.play();
                    chemistryAnimation1.clampWhenFinished = true;
                },
                // Disappear when leaving scroll
                onLeave: () => 
                {
                    gsap.to(parameters.sceneOptions.scene2, { duration: 0.5, value: 0 });
                    setTimeout(() => { gltf.scene.children[1].visible = false }, 400);
                    console.log('LEAVE 12');
                },
                // Show up when scrolling back up
                onEnterBack: () => 
                {
                    chemistryAnimation1.play();
                    gsap.to(mesh[1], { duration: 0, visible: true})
                    gsap.to(parameters.sceneOptions.scene2, { duration: 0.5, value: 1 })
                },
                onLeaveBack: () => 
                {
                    scene3Status = 'off';
                    scene2Status = 'on';

                    chemistryAnimation1.reset();
                    gsap.to(parameters.sceneOptions.scene2, { duration: 0.5, value: 0 });
                    setTimeout(() => { gltf.scene.children[1].visible = false }, 400);
                }
            }
        })

        s2.to(chemistryAnimateTime,
            {
                time: gltf.animations[3].duration,
                repeat: 0
            })

        const s3 = gsap.timeline({
            scrollTrigger:
            {
                trigger: '.section-2',
                start: 'top top',
                end: '+=6000%',
                pin: true,
                // Play animations
                onEnter: () => 
                {
                    console.log('play');
                    // playSection1();
                },
                // Disappear when leaving scroll
                onLeave: () => 
                {
                    console.log('LEAVE')
                },
                // Show up when scrolling back up
                onEnterBack: () => 
                {
                    // playSection1();
                    console.log('play2');
                },
                onUpdate: (self) => 
                {
                    
                }
            }
        })

        updateAllMaterials()
    }
);

            
    function createAnimation(mixer, action, clip) {
        let proxy = {
            get time() {
            return mixer.time;
            },
            set time(value) {
            action.paused = false;
            mixer.setTime(value);
            action.paused = true;
            }
        };
        
        let scrollingTL = gsap.timeline({
            scrollTrigger: {
                trigger: renderer.domElement,
                start: "top top",
                end: "+=3000%",
                pin: true,
                scrub: true,
                onUpdate: function () {
                    camera.updateProjectionMatrix();
                }
            }
        });
        
        scrollingTL.to(proxy, {
            time: clip.duration,
            repeat: 3
        });
    }
              

// Responsive Model Size
function setModel()
{
    switch(true)
    {
        case window.innerWidth > 950:
            gsap.to(gltfSceneOptions, {duration: 2, scale: 1 });
            break;
        case window.innerWidth === 950:
            console.log('=');
            break;
        case window.innerWidth < 950:
            gsap.to(gltfSceneOptions, {duration: 2, scale: 1 });
            break;
    }
}
setModel();

//Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    // physicallyCorrectLights: true,
    gammaOutput: true,
    gammaFactor: 2.2,
    transparent: true
})


renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x000000, 0)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;

const controls = new OrbitControls(camera, canvas);
controls.enabled = true;
controls.enableDamping = true;
camera.position.set(0, 0, 0);
controls.update();

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

// Transitions
let micelleTransition1 = false;

/**
 * Cursor
 */
 const cursor = {};
 cursor.x = 0;
 cursor.y = 0;
 
 window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / window.innerWidth -.5;
    cursor.y = event.clientY / window.innerHeight - .5;
 })

let scrollDirection = null;

let passiveScroll = 0.0005;

let activeScroll = passiveScroll;

var isScrolling;

// Listen for scroll events
window.addEventListener('scroll', function ( event ) {

    // Adjust scrolling speed
    if (scrollDirection === 1)
    {
        activeScroll = passiveScroll + 0.005;
    }
    else if (scrollDirection === -1)
    {
        activeScroll = (-0.0005 - 0.005);
    }

	// Clear our timeout throughout the scroll
	window.clearTimeout( isScrolling );

	// Set a timeout to run after scrolling ends
	isScrolling = setTimeout(function() {

		// Run the callback
		activeScroll = passiveScroll;

	}, 66);

}, false);


const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();
    deltaTime = elapsedTime - lastElapsedTime;
    lastElapsedTime = elapsedTime;


   controls.update();
    // Update scene
    if (motionArray.head !== undefined && motionArray.tails !== undefined)
    {
        // motionArray.contaminant.rotation.x += 0.0005;
        meshes.micelle2.children[3].rotation.z += 0.0005;
        // sphereExample.rotation.y += 0.0005;
        // sphereExample.position.y += Math.sin(elapsedTime) / 1550;
        // sphereExample.position.x += (Math.sin(elapsedTime) / 1550) * 20;
    }
    
    for (const mixer of mixers) mixer.update(deltaTime);

    // Animate camera
    // camera.position.y = - scrollY / Math.round(sizes.height) *  2;
    if (object !== null)
    {
        // object.position.set(0, 0, 0);
    }

    const parallaxX = cursor.x * 0.5;
    const parallaxY = - cursor.y * 0.5;

    for (const item of motionArray2)
    {
        if (micelleTransition1 === true && item.position.z >= -1)
        {
            // item.position.z -= 0.01;
        }
        else if (micelleTransition1 === false && item.position.z <= 0)
        {
            // item.position.z += 0.01;
        }
    }

    if (sceneOptions.scenes)
    {
        for (let i = 0; i < sceneOptions.scenes.length; i++)
        {
            // sceneOptions.scenes[i].position.y += Math.sin(elapsedTime + i) / 1550;
        }
    }

    if (micelleMixer1)
    {
        micelleMixer1.update(deltaTime * 0.001)
    }

    /**
     * Update Materials
     */

    // Scene 1
    contaminant.opacity = parameters.sceneOptions.scene1.value;
    headMaterial.opacity = parameters.sceneOptions.scene1.value;
    tailMats.opacity = parameters.sceneOptions.scene1.value;
    
    // Scene 2
    blueHydroMats.opacity = parameters.sceneOptions.scene2.value;
    orangeIcoMats.opacity = parameters.sceneOptions.scene2.value;
    offWhiteMaterial.opacity = parameters.sceneOptions.scene2.value;

    // for (const key of motionArray)
    // {
    //     // if (key === 'spheres') console.log('TRUE')
    //     console.log(key)
    // }

    cube2.rotation.y += activeScroll;

    if (meshes.micelle1)
    {
        if (scene1Status === 'on')
        {
            meshes.micelle1.rotation.y += activeScroll;
        }
        // meshes.micelle2.rotation.y += activeScroll;
    }
    
    // meshes.micelle2.rotation.y += activeScroll;
    
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime;

    // Violent shaking was due to the line below
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

    // Render
    if (scene1Status === 'on')
    {
        renderer.render(scene, camera)
    }
    
    renderer.autoClear = false;

    if (scene2Status === 'on')
    {
        renderer.render(scene2, camera)
    }

    if (scene3Status === 'on')
    {
        renderer.render(scene3, camera)
    }

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()
