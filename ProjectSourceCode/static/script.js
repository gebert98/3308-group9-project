const { Scene, PerspectiveCamera, WebGLRenderer, PointLight } = THREE;
const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 300;
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('globe-container').appendChild(renderer.domElement);
const light = new PointLight(0xffffff, 1);
light.position.set(200, 200, 200);
scene.add(light);
const Globe = new ThreeGlobe()
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg') // URL to globe texture
  .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png') // URL to topology texture

scene.add(Globe);
function animate() {
  requestAnimationFrame(animate);
  Globe.rotation.y += 0.001; 
  renderer.render(scene, camera);
}

animate();