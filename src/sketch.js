// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/loaders/FontLoader");
require("three/examples/js/geometries/TextGeometry");

const canvasSketch = require("canvas-sketch");

const { GUI } = require("dat.gui");
const OPTIONS = {
  selection: 0
};

const DISTANCE = 1.1;
const ORIGIN = new THREE.Vector3(0, 0, 0);
const AXIS_DISTANCE = new THREE.Vector3(-1, 0, -1);
const AXIS_MATERIAL = new THREE.LineBasicMaterial({
  color: 0x000000
});
const CUBES = [];
const TEXTS = [];

const BAR_MATERIAL = {
    0: new THREE.MeshPhongMaterial({
      color: 0xcdbefa,
      flatShading: true,
      // wireframe: true
    }),
    1: new THREE.MeshPhongMaterial({
      color: 0xad91ff,
      flatShading: true,
      // wireframe: true
    }),
    2:new THREE.MeshPhongMaterial({
      color: 0x926efa,
      flatShading: true,
      // wireframe: true
    }),
    3:new THREE.MeshPhongMaterial({
      color: 0x794df7,
      flatShading: true,
      // wireframe: true
    }),
    4: new THREE.MeshPhongMaterial({
      color: 0x6632fa,
      flatShading: true,
      // wireframe: true
    })
  }

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

// Fake data
let generateMockData = () => {
  return [3,5,1,9,7,10, 5, 8];
};

let generateMockTitle = () => {
  return {
    0: "Total Calls",
    1: "Answered Calls",
    2: "Missed Calls",
    3: "Transferred Calls",
    4: "Outbound Connected Calls"
  }
}
let generateMockAnalyticsData = () => {
  return {
    0: [10, 15, 16, 7, 8, 9, 23],
    1: [ 2,  3,  1, 2, 1,  2, 4],
    2: [ 0,  5,  2, 1, 2,  2, 4],
    3: [ 1,  2,  9, 0, 1,  0, 0],
    4: [ 4,  0,  0, 5, 3,  3, 5]
  }
}

let indexConverter = (index) => {
  return [Math.floor(index / 7), index % 7];
}


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
  tempOrigin.add(AXIS_DISTANCE);
  
  let vPoint = new THREE.Vector3(0, v_max, 0);
  vPoint.add(tempOrigin);
  let hPoint = new THREE.Vector3(h_max * DISTANCE + 1, 0, 0);
  hPoint.add(tempOrigin);
  // let zPoint = new THREE.Vector3(0, 0, h_max * DISTANCE);
  // zPoint.add(tempOrigin);


  const points = [];


  points.push([tempOrigin, vPoint]);
  points.push([tempOrigin, hPoint]);

  const lines = createLines(points, AXIS_MATERIAL);
  for (let i = 0 ; i < lines.length; i++){
    scene.add(lines[i]);
  }

}


let drawGridAxis = (scene, v_max, h_max) => {
  // Shift to left by one
  let tempOrigin = ORIGIN.clone();
  tempOrigin.add(AXIS_DISTANCE);
  const points = [];

  // For Days side
  for (let i = 0; i <= v_max; i++){
    let hPoint = new THREE.Vector3(h_max * DISTANCE + 1, i, 0);
    hPoint.add(tempOrigin);
    // let zPoint = new THREE.Vector3(0, 0, h_max * DISTANCE);
    // zPoint.add(tempOrigin);
    let from = tempOrigin.clone().add(new THREE.Vector3(0, i, 0));
    points.push([ from, hPoint]);
  }

  // For Calls Side
  for (let i = 0; i <= v_max; i++){
    let hPoint = new THREE.Vector3(0, i, h_max * DISTANCE + 1);
    hPoint.add(tempOrigin);
    // let zPoint = new THREE.Vector3(0, 0, h_max * DISTANCE);
    // zPoint.add(tempOrigin);
    let from = tempOrigin.clone().add(new THREE.Vector3(0, i, 0));
    points.push([ from, hPoint]);
  }

  // For Vertical
  let vPoint = new THREE.Vector3(0, v_max, 0);
  vPoint.add(tempOrigin);
  points.push([tempOrigin, vPoint]);


  const lines = createLines(points, AXIS_MATERIAL);
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
let createCube = (height=1, material=BAR_MATERIAL[0]) => {
  // Setup a geometry
  const geometry = new THREE.BoxGeometry(1, height, 1);

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
};

/* ==================================
Name: initBarChart
Params: a list of data
======================================
*/
let initBarChart = (data=[], material=BAR_MATERIAL[0]) => {
  if (data.length == 0) {
    return [];
  }
  const getData = data;
  const len = getData.length;
  const cubeList = [];
  for (let i = 0; i < len ; i++ ){
    const cube = createCube(getData[i], material);
    cubeList.push(cube);
  }

  return cubeList;
}


let drawBarChart = (scene, data=[], starting_z=0) => {
  // const min_data = 1; // We will recalculate this
  // const max_data = getMax(data); // we will recalculate this
  // drawAxis(scene, max_data, data.length);


  const cubes = initBarChart(data, BAR_MATERIAL[starting_z]);
  const startPos = ORIGIN;
  for (let i  = 0; i < cubes.length; i++){
    cubes[i].position.x = startPos.x + DISTANCE * i;
    const h = cubes[i].geometry.parameters.height;
    cubes[i].position.y = h / 2 + 0;
    cubes[i].position.z = ORIGIN.z + DISTANCE *  starting_z;
    CUBES.push(cubes[i]);
    scene.add(cubes[i]);
  }

}

let drawMultiBarChart = (scene, data=[]) => {
  const min_data = 1; // We will recalculate this
  const max_data = getMax(data[0]); // we will recalculate this
  drawGridAxis(scene, max_data, data[0].length);

  for(let i = 0; i < 5; i++){
    drawBarChart(scene, data[i], i)
  }

}

/* =============================
// Create Text
================================
*/

let createText = (scene, text=[]) => {
  const loader = new THREE.FontLoader();
  const startingPos = new THREE.Vector3(6 ,0, 7);
  loader.load( 'node_modules/three/examples/fonts/helvetiker_bold.typeface.json', function ( font ) {
      
      for (let i = 0; i < text.length; i++){
        const geometry = new THREE.TextGeometry( text[i], {
          font: font,
          size: 0.5,
          height: 0.01,
          
          // curveSegments: 2,
          // bevelEnabled: true,
          // bevelThickness: 0.1,
          // bevelSize: 2,
          // bevelOffset: 0,
          // bevelSegments: 5
        } );
      
        var textMaterial = new THREE.MeshPhongMaterial( { color: 0x049ef4 } );
  
        var mesh = new THREE.Mesh( geometry, textMaterial );
        mesh.position.set( startingPos.x, startingPos.y, startingPos.z );
        scene.add(mesh);
        TEXTS.push(mesh);
        startingPos.add(new THREE.Vector3(0,0,1));
        
      }
    
  });
}


/*
==================================================
Gui Operations
==================================================
*/
const reset = () => {
    for (let i = 0; i < CUBES.length; i++){
      let pos = indexConverter(i);
      CUBES[i].material = BAR_MATERIAL[Math.floor(pos[0])];

    }
}
const cubeSelected = (index) => {
  CUBES[index].material = new THREE.MeshPhongMaterial({
    color: 0x2ae7f5,
    flatShading: true,
    // wireframe: true
  })
}

const changeText = (scene, index) => {
  let pos = indexConverter(index);
    for(let i = 0; i < TEXTS.length; i++){
      TEXTS[i].removeFromParent();
    }
    let day = "Day " + String(pos[1]);
    createText(scene,  [day, generateMockTitle()[pos[0]], String(generateMockAnalyticsData()[pos[0]][pos[1]])]);
}




const sketch = ({ context, canvas, width, height }) => {
  //================================================
  // Stage 1: Set up scene and camera
  //================================================
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  const gui = new GUI();






  // WebGL background color
  renderer.setClearColor("#fff", 1);

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
  // Stage 0.1: Set up lights
  //================================================

  const light = new THREE.AmbientLight( 0x404040, 2 ); // soft white light
  scene.add( light );

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  directionalLight.position.set(0,10,10);
  scene.add( directionalLight );



  //================================================
  // Stage 2: Draw a bar chart
  //================================================
  // const data = generateMockData();
  // drawBarChart(scene, data);
  const data = generateMockAnalyticsData();
  drawMultiBarChart(scene, data);
  
  // // Setup Grid
  // const gridScale = 10;
  // scene.add(new THREE.GridHelper(gridScale, 10, "hsl(0, 0%, 50%)", "hsl(0, 0%, 70%)"));

 

  //Text examples
  createText(scene, ["-", "-", "-"]);




  gui.add(OPTIONS, "selection", 0, 34, 1).onChange((val) => {
    reset();
    cubeSelected(val);


    changeText(scene, val);



  });

  
  //===================================================
  // State 3: draw each frame
  //=================================================
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
      gui.destroy();
    }
  };
};

canvasSketch(sketch, settings);
