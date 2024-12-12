import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import holographicVertexShader from "./shaders/holographic/vertex.glsl";
import holographicFragmentShader from "./shaders/holographic/fragment.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Loaders
const gltfLoader = new GLTFLoader();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  55,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(14, 4.5, 12);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const rendererParameters = {
  clearColor: "#1d1f2a",
};

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setClearColor(rendererParameters.clearColor);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

gui.addColor(rendererParameters, "clearColor").onChange(() => {
  renderer.setClearColor(rendererParameters.clearColor);
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

const lightParameters = {
  intensity: 1,
};

// gui.add(lightParameters, "intensity", 0, 2, 0.01).onChange(() => {
//   directionalLight.intensity = lightParameters.intensity;
// });

/**
 * Material
 */
const materialParameters = {
  color: "#70c1ff",
  opacity: 0.5,
  intensity: 1.0, // Added intensity parameter
};

gui.addColor(materialParameters, "color").onChange(() => {
  material.uniforms.uColor.value.set(materialParameters.color);
});

gui.add(materialParameters, "opacity", 0, 1, 0.01).onChange(() => {
  material.uniforms.uOpacity.value = materialParameters.opacity;
});

gui.add(materialParameters, "intensity", 0, 2, 0.01).onChange(() => {
  material.uniforms.uIntensity.value = materialParameters.intensity;
});

const material = new THREE.ShaderMaterial({
  vertexShader: holographicVertexShader,
  fragmentShader: holographicFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
    uOpacity: new THREE.Uniform(materialParameters.opacity),
    uIntensity: new THREE.Uniform(materialParameters.intensity), // Pass intensity to shader
  },
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

/**
 * Objects
 */
let trunks = null;
const objectParameters = {
  rotationSpeed: 0.1,
  visible: true,
};

gltfLoader.load("./trunks.glb", (gltf) => {
  trunks = gltf.scene;
  gltf.scene.position.set(10, -2, 2);
  scene.add(gltf.scene);

  trunks.traverse((child) => {
    if (child.isMesh) child.material = material;
  });

  gui.add(objectParameters, "rotationSpeed", 0, 1, 0.01).name("Rotation Speed");
  gui
    .add(objectParameters, "visible")
    .name("Show/Hide Trunks")
    .onChange(() => {
      trunks.visible = objectParameters.visible;
    });
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update material
  material.uniforms.uTime.value = elapsedTime;

  // Rotate objects
  if (trunks) {
    trunks.rotation.y = -elapsedTime * objectParameters.rotationSpeed;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
