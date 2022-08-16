// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const DISTANCE = 2;
const ORIGIN = new THREE.Vector3(0, 0, 0);
const AXIS_MATEGIAL = new THREE.LineBasicMaterial({
  color: 0x0000ff
});

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

// Fake data
let generateMockData = () => {
  return [3,5,1,9,7];
};

let getMax = (data=[]) => {
  return data.reduce((a, b) => { return Math.max(a, b) });
}


/* ============================
Name: createSingleLine
Params: [Vector3], take a list of Vec3
================================
*/
let createSingleLine = (points=[], material) => {
  const geometry = new THREE.BufferGeometry().setFromPoints( points );
  const line = new THREE.Line( geometry, material );
  return line
}

/* ============================
Name: createLines
Params: [[Vector3]], take a list of list of Vec3
================================
*/
let createLines = (data=[], material) => {
  const lines = [];
  for (let i = 0; i < data.length; i++){
    const line = createSingleLine(data[i], material)
    lines.push(line);
  }
  return lines;
};


let drawAxis = (scene, v_max, h_max) => {
  
  // Shift to left by one
  let tempOrigin = ORIGIN.clone();
  tempOrigin.add(new THREE.Vector3(-1, 0, 0))
  
  let vPoint = new THREE.Vector3(0, v_max, 0);
  vPoint.add(tempOrigin);
  let hPoint = new THREE.Vector3(h_max * DISTANCE, 0, 0);
  hPoint.add(tempOrigin);


  const points = [];
  points.push([tempOrigin, vPoint]);
  points.push([tempOrigin, hPoint]);

  const lines = createLines(points, AXIS_MATEGIAL);
  for (let i = 0 ; i < lines.length; i++){
    scene.add(lines[i]);
  }

}



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
  const max_data = getMax(data); // we will recalculate this
  drawAxis(scene, max_data, data.length);



  const cubes = initBarChart(data);
  const startPos = ORIGIN;
  for (let i  = 0; i < cubes.length; i++){
    cubes[i].position.x = startPos.x + DISTANCE * i;
    const h = cubes[i].geometry.parameters.height;
    cubes[i].position.y = h / 2 + 0;
    cubes[i].position.z = ORIGIN.z;
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
  camera.position.set(0, 10, 10);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup axes helpers
  const axesHelper = new THREE.AxesHelper( 5 );
  scene.add( axesHelper );





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
