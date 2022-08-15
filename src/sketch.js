// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

// Fake data
let generateMockData = () => {
  return [1,3,5,7,9];
};


/* =======================
Name: createSphere 
Params: TBD
Usage:
// const sphere = createSphere();
// scene.add(sphere);
===========================
*/
let createSphere = () => {
  // Setup a geometry
  const geometry = new THREE.SphereGeometry(1, 32, 16);

  // Setup a material
  const material = new THREE.MeshBasicMaterial({
    color: "red",
    wireframe: true
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 1;
  return mesh;
};



/* ============================
Name: createCube 
Params: a number, suggest the height
Usage:
// const cube = createCube();
// scene.add(cube);
================================
*/
let createCube = (height=1) => {
  // Setup a geometry
  const geometry = new THREE.BoxGeometry(1, height, 1);

  // Setup a material
  const material = new THREE.MeshBasicMaterial({
    color: "pink",
    wireframe: true
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
};

/* ==================================
Name: initBarChart
Params: a list of data
======================================
*/
let initBarChart = (data=[]) => {
  if (data.length == 0) {
    return [];
  }
  const getData = generateMockData();
  const len = getData.length;
  const cubeList = [];
  for (let i = 0; i < len ; i++ ){
    const cube = createCube(getData[i]);
    cubeList.push(cube);
  }

  return cubeList;
}


let drawBarChart = (scene, data=[]) => {
  const min_data = 1; // We will recalculate this
  const max_data = 9; // we will recalculate this
  const cubes = initBarChart(data);
  const startPos = 0;
  const dis = 2;
  for (let i  = 0; i < cubes.length; i++){
    cubes[i].position.x = startPos + dis * i;
    const h = cubes[i].geometry.parameters.height;
    cubes[i].position.y = h / 2 + 0;
    scene.add(cubes[i]);
  }

}


const sketch = ({ context }) => {
  //================================================
  // Stage 1: Set up scene and camera
  //================================================
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, 10);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  





  //================================================
  // Stage 2: Draw a bar chart
  //================================================
  const data = generateMockData();
  drawBarChart(scene, data);

  // Setup Grid
  const gridScale = 10;
  scene.add(new THREE.GridHelper(gridScale, 10, "hsl(0, 0%, 50%)", "hsl(0, 0%, 70%)"));

  
  
  
  
  
  
  
  
  
  
  
  //===================================================
  // State 3: draw each frame
  //==================================================
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
