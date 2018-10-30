var camera = null,
renderer = null,
scene = null,
root = null,
group = null,
game = false,
ambientLight = null,
button = null,
objLoader = null,
chicken=null,treeModel = null,posicionX=-20,
orbitControls = null,
chickenBoxHelper = null, treeBoxHelper = null, chickenBox = null, treeBox = null, newTree=null, carModel=null,currentTime,
carBoxHelper = null, carBox= null, valueScore = 0, speed = 0.01, dotGeo = null, enfrente = null, izquierda =null, derecha=null, atras=null,
step = 5, chickenGroup=null, treesColliders = [], carsColliders = [];
var map = "", mapUrl="", grass = null, river = null, troncos = null, road =null;
var trigger = false, turnDown = false, turnUp = false, turnRight = false, turnLeft=false, fired = false,load = false;
var maxTiles = 20;
var materials = {dot: new THREE.MeshBasicMaterial({color: 0x0000ff })};
function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentKeyUp(event){
  fired=false;
}
function updateScore(){
  valueScore = valueScore + 1;
  document.getElementById("score").innerHTML = "Score: "+valueScore;
}

function updateCollision(){
  turnDown = true;
  turnUp = true;
  turnRight = true;
  turnLeft = true;
  for (var i = 0; i< treesColliders.length; i++) {
    if(treesColliders[i].containsPoint(enfrente.position)){
      turnUp = false;
    }
    if(treesColliders[i].containsPoint(atras.position)){
      turnDown = false;
    }
    if(treesColliders[i].containsPoint(izquierda.position)){
      turnLeft = false;
    }
    if(treesColliders[i].containsPoint(derecha.position)){
      turnRight = false;
    }
  }
}

function onDocumentKeyDown(event) {
  if (!fired && chicken.move) {
    var keyCode = event.which;
    fired = true;
    //Up
    if (keyCode == 87) {
      if(chickenGroup.rotation.y != 0){
        chickenGroup.rotation.y = 0
      }
      if(turnUp){
        chickenGroup.translateX(step);
        moverPuntos(3);
        updateScore();
      }
      updateCollision();
    }
    //Down
    else if (keyCode == 83) {
      if(chickenGroup.rotation.y != -Math.PI){
        chickenGroup.rotation.y = - Math.PI;
      }
        if(turnDown){
          chickenGroup.translateX(step);
          moverPuntos(2);
        }
        updateCollision();
    }
    //izquierda
    else if (keyCode == 65) {
        if(chickenGroup.rotation.y != Math.PI/2){
          chickenGroup.rotation.y = Math.PI/2;
        }
        if(turnLeft){
          chickenGroup.translateX(step);
          moverPuntos(0);
        }
        updateCollision();
    }
    //derecha
    else if (keyCode == 68) {
        if(chickenGroup.rotation.y != -Math.PI / 2){
          chickenGroup.rotation.y = -Math.PI / 2;
        }
        if(turnRight){
          chickenGroup.translateX(step);
          moverPuntos(1);
        }
        updateCollision();
    }
  }
}

function moverPuntos(direccion){
  switch (direccion)
  {
    case 0: //izquierda
        enfrente.position.z -= step;
        atras.position.z -= step;
        izquierda.position.z -= step;
        derecha.position.z -= step;
        break;
    case 1: //derecha
        enfrente.position.z += step;
        atras.position.z += step;
        izquierda.position.z += step;
        derecha.position.z += step;
        break;
    case 2: //atras
        enfrente.position.x -= step;
        atras.position.x -= step;
        izquierda.position.x -= step;
        derecha.position.x -= step;
        break;
    case 3: //enfrente
        enfrente.position.x += step;
        atras.position.x += step;
        izquierda.position.x += step;
        derecha.position.x += step;
        break;

  }
}


function startGame(){
  chicken.move= true;
  button.style.display = "none";
}


function loadObj()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();

    objLoader.load('models/Chicken/chicken.obj',function(object){
            var texture = new THREE.TextureLoader().load('models/Chicken/chicken.png');
            object.traverse( function (child)
            {
                if (child instanceof THREE.Mesh){
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                }
            } );

            chicken = object;
            chickenGroup = new THREE.Object3D;
            chicken.move = false;
            chicken.scale.set(5,5,5);
            chicken.position.z = 0;
            chicken.position.x = 0;
            chicken.rotation.y = Math.PI/2;
            chickenBoxHelper = new THREE.BoxHelper();
            chickenBoxHelper.setFromObject(chicken,0x00ff00);
            chickenBoxHelper.update();
            chickenGroup.add(chicken);
            dotGeo = new THREE.SphereGeometry(0.5);
            derecha = new THREE.Mesh(dotGeo, this.materials.dot);
            derecha.position.set(chickenGroup.position.x,0, chickenGroup.position.z +step);
            atras = new THREE.Mesh(dotGeo, this.materials.dot);
            atras.position.set(chickenGroup.position.x-step,0, chickenGroup.position.z);
            enfrente = new THREE.Mesh(dotGeo, this.materials.dot);
            enfrente.position.set(chickenGroup.position.x+step,0, chickenGroup.position.z);
            izquierda = new THREE.Mesh(dotGeo, this.materials.dot);
            izquierda.position.set(chickenGroup.position.x,0, chickenGroup.position.z -step);
            derecha.visible = false;
            izquierda.visible = false;
            enfrente.visible = false;
            atras.visible = false;
            scene.add(enfrente);
            scene.add(atras);
            scene.add(derecha);
            scene.add(izquierda);

            chickenBoxHelper.visible=true;
            chickenBox = new THREE.Box3().setFromObject(chickenBoxHelper);
            chicken.collider = chickenBox;
            chickenGroup.add(chickenBoxHelper);
            root.add(chickenBoxHelper);
            root.add(chickenGroup);

            objLoader.load('models/Trees/Tree1/tree1.obj', function(object) {
              var texture = new THREE.TextureLoader().load('models/Trees/Tree1/tree1.png');
              object.traverse( function (child)
              {
                  if (child instanceof THREE.Mesh)
                  {
                      child.castShadow = true;
                      child.receiveShadow = true;
                      child.material.map = texture;
                  }
              });
              treeModel = object;
              treeModel.scale.set(step,step,step);
              treeModel.position.x=posicionX;
              treeModel.position.z=-10;
              /*treeBoxHelper = new THREE.BoxHelper();
              treeBoxHelper.setFromObject(treeModel, 0x00ff00);
              treeBoxHelper.position = treeModel.position;*/
              //treeBoxHelper.update();
              treeBox = new THREE.Box3().setFromObject(treeModel);
              treesColliders.push(treeBox);
              //root.add(treeBoxHelper);
              root.add(treeModel);
            });
              objLoader.load('models/Cars/Car1/car1.obj', function(object) {
                var texture = new THREE.TextureLoader().load('models/Cars/Car1/car1.png');
                object.traverse( function (child)
                {
                    if (child instanceof THREE.Mesh)
                    {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material.map = texture;
                    }
                });
                carModel = object;
                carModel.scale.set(5,5,5);
                carModel.position.x=10;
                carModel.position.z=-50 - Math.random() * 50;
                root.add(carModel);
              });
              objLoader.load('models/Land/grass.obj',function(object){
                var texture = new THREE.TextureLoader().load('models/Land/grass.png');
                object.traverse(function (child)
                {
                    if (child instanceof THREE.Mesh){
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material.map = texture;
                    }
                });
                grass = object;
                grass.scale.set(5,-1,5);
                grass.position.x = posicionX;
                grass.rotation.set(0,Math.PI / 2,Math.PI);
                root.add(grass);
                while (posicionX <= 5) {
                    generateLand();
                    posicionX += 5;
                }
              });
              objLoader.load('models/Road/road2.obj',function(object){
                var texture = new THREE.TextureLoader().load('models/Road/road2.png');
                object.traverse(function (child)
                {
                    if (child instanceof THREE.Mesh){
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material.map = texture;
                    }
                });
                road = object;
                road.scale.set(5,-1,5);
                road.position.x=10;
                road.rotation.set(0,Math.PI / 2,Math.PI);
                root.add(road);
              });

        },
        function (xhr) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
        });
}



function addTree(){
  var newTree = treeModel.clone();
  newTree.position.x = posicionX;
  newTree.position.z = generarRandom(-20,20);
  var treeBoxNew = new THREE.Box3().setFromObject(newTree);
  treesColliders.push(treeBoxNew);
  root.add(newTree);
  console.log("new tree");
}


function addCar(){
  var newCar = carModel.clone();
  newCar.position.x = posicionX;
  var z = generarRandom(-1,1);
  if (z < 0) {
    newCar.position.z = z*20;
  }
  else if (z > 0) {
    newCar.position.z = z*20;
  }
  else if(z == 0){
    newCar.position.z = 20;
  }
  var carBoxNew = new THREE.Box3().setFromObject(newCar);
  carsColliders.push(carBoxNew);
  root.add(newCar);
  console.log("new tree");
}

function generarRandom(min, max){
  return  Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMap(){
  var mapPart = generarRandom(1,3);
  switch (mapPart) {
    case 1:
      generateLand();
      break;
    case 2:
      //generateRoad();
      generateLand();
      break;
    case 3:
      //generateRiver();
      generateLand();
      break;
    //default:
  }
  posicionX+=step;
}

function generateLand(){
  var newGrass = grass.clone();
  newGrass.position.x = posicionX;
  var numTrees = generarRandom(0,5);
  for (var i = 0; i < numTrees; i++) {
    addTree();
  }
  root.add(newGrass);
}

function animate(){
  //if(game){
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    //console.log(chicken);
    if(chicken && treeModel && carModel){
      chickenBoxHelper.update();
      chickenBox = new THREE.Box3().setFromObject(chicken);
      //treeBoxHelper.update();
      //carBoxHelper.update();
      carBox = new THREE.Box3().setFromObject(carModel);
      if(chickenBox.intersectsBox(carBox)){
        console.log("choco");
        chicken.move = false;
        carModel.position.z = carModel.position.z;
      }
      if(chicken.move){
        camera.position.x +=(speed * deltat);
        carModel.position.z += 0.03 * deltat;
        if(carModel.position.z > 40)
          carModel.position.z = -70 - Math.random() * 50;
        if(maxTiles  > 0){
          generateMap();
          maxTiles--;
        }
        if(maxTiles < 9){
          maxTiles += 20;
        }
      }
      if(camera.position.x - (1.3*deltat) > chickenGroup.position.x || chickenGroup.position.z > camera.right - 5 || chickenGroup.position.z < camera.left + 10){
        chicken.move = false;
      }
      if(camera.position.x + (1.7*deltat) < chickenGroup.position.x){
        speed = 0.03;
      }
      else{
        speed = 0.01;
      }

    }
  //}
}

function run() {
  requestAnimationFrame(function() { run(); });
  renderer.render(scene, camera);
  animate();
}

function createScene(canvas) {
  // Create the Three.js renderer and attach it to our canvas
  renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
  // Set the viewport size
  renderer.setSize(canvas.width, canvas.height);
  // Turn on shadows
  renderer.shadowMap.enabled = true;
  // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Create a new Three.js scene
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-30,30,20,-20, 0.1, 5000);
  camera.position.set(-15, 25, 5);
  camera.lookAt(scene.position);

  //orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
  scene.add(camera);

  // Create a group to hold all the objects
  root = new THREE.Object3D;
  ambientLight = new THREE.AmbientLight ( 0xffffff );
  root.add(ambientLight);
  group = new THREE.Object3D;
  loadObj();

  root.add(group);
  scene.add(root);

  window.addEventListener( 'resize', onWindowResize);
  document.addEventListener("keydown", onDocumentKeyDown, false);
  document.addEventListener("keyup", onDocumentKeyUp);
  document.getElementById("score").innerHTML = "Score: "+valueScore;
  button = document.getElementById("start");
}
