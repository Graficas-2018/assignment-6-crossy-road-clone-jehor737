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
step = 5, chickenGroup=null, treesColliders = [], carsColliders = [],riverColliders=[], troncosColliders=[], cars = null;
var grass = null, river = null, troncos = null, road =null;
var trigger = false, turnDown = false, turnUp = false, turnRight = false, turnLeft=false, fired = false,zTreesPositions = [-20,-15,-10,-5,0,5,10,15,20];
var maxTiles = 20;
var materials = {dot: new THREE.MeshBasicMaterial({color: 0x0000ff })};
var valor = 0;
function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentKeyUp(event){
  fired=false;
  if(!chicken.enTronco)
    chicken.position.y = 0;
}
function updateScore(){
  valueScore = valueScore + 1;
  document.getElementById("score").innerHTML = "Score: "+valueScore;
}

function updateCollisionTree(){
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

function updateCollisionCars(deltat){
  if(!chicken.move){
    return;
  }
  for (var i = 0; i< carsColliders.length; i++) {
    if (carsColliders[i].direction == 2) {
      carsColliders[i].position.z -= 0.03 * deltat;
      if(carsColliders[i].position.z < -40)
        carsColliders[i].position.z = 70 + Math.random() * 5;
    }
    else{
      carsColliders[i].position.z += 0.03 * deltat;
      if(carsColliders[i].position.z > 40)
        carsColliders[i].position.z = -70 - Math.random() * 5;
    }
    var carBoxNew = new THREE.Box3().setFromObject(carsColliders[i]);
    carsColliders[i].collider = carBoxNew;
  }
  for(var i=0; i < carsColliders.length; i++){
    if (carsColliders[i].collider.intersectsBox(chickenBox)) {
      console.log("Muerte por coche");
      chicken.move = false;
    }
  }
}

function updateStep(){
  var closer=0;
  if (chicken.enTronco && chickenBox.intersectsBox(troncosColliders[valor].collider)) {
    console.log("Hola");
  }
  else if(chicken.enTronco && !chickenBox.intersectsBox(troncosColliders[valor].collider)){
    chicken.enTronco = false;
    chicken.position.y=0;
    chickenGroup.position.z= Math.floor((chickenGroup.position.z/step))*step;
    enfrente.position.z = chickenGroup.position.z;
    atras.position.z = chickenGroup.position.z;
    derecha.position.z = chickenGroup.position.z + step;
    izquierda.position.z = chickenGroup.position.z - step;
  }
}

function updateCollisionTroncos(deltat){
  if(!chicken.move){
    return;
  }
  for (var i = 0; i< troncosColliders.length; i++) {
    if(troncosColliders[i].direction == 2){
      troncosColliders[i].position.z -= step*0.1;
      if(troncosColliders[i].position.z < -40)
        troncosColliders[i].position.z = 40 + Math.random() * 5;
    }
    else{
      troncosColliders[i].position.z += step*0.1;
      if(troncosColliders[i].position.z > 40)
        troncosColliders[i].position.z = -40 - Math.random() * 5;
    }
    var troncoBoxNew = new THREE.Box3().setFromObject(troncosColliders[i]);
    troncosColliders[i].collider = troncoBoxNew;
    if (chickenBox.intersectsBox(troncosColliders[i].collider)) {
      chicken.position.y=1;
      chickenGroup.position.z = troncosColliders[i].position.z;
      valor = i;
      chicken.enTronco = true;
      enfrente.position.z = chickenGroup.position.z;
      atras.position.z = chickenGroup.position.z;
      derecha.position.z = chickenGroup.position.z + step;
      izquierda.position.z = chickenGroup.position.z - step;
    }
  }
  updateStep();
}

function updateCollisionRiver(){
  for (var i = 0; i < riverColliders.length; i++) {
    if(chickenBox.intersectsBox(riverColliders[i])){
      console.log("Cayo al agua");
      chicken.move = false;
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
        chicken.position.y = 1;
        moverPuntos(3);
        updateScore();
      }
      updateCollisionTree();
    }
    //Down
    else if (keyCode == 83) {
      if(chickenGroup.rotation.y != -Math.PI){
        chickenGroup.rotation.y = - Math.PI;
      }
        if(turnDown){
          chickenGroup.translateX(step);
          chicken.position.y = 1;
          moverPuntos(2);
        }
        updateCollisionTree();
    }
    //izquierda
    else if (keyCode == 65) {
        if(chickenGroup.rotation.y != Math.PI/2){
          chickenGroup.rotation.y = Math.PI/2;
        }
        if(turnLeft){
          chickenGroup.translateX(step);
          chicken.position.y = 1;
          moverPuntos(0);
        }
        updateCollisionTree();
    }
    //derecha
    else if (keyCode == 68) {
        if(chickenGroup.rotation.y != -Math.PI / 2){
          chickenGroup.rotation.y = -Math.PI / 2;
        }
        if(turnRight){
          chickenGroup.translateX(step);
          chicken.position.y = 1;
          moverPuntos(1);
        }
        updateCollisionTree();
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
  game = true;
  chicken.move= true;
  button.style.display = "none";
}

function restartGame() {
  posicionX=-20;
  scene.remove(root);
  root = new THREE.Object3D;
  //Reset counters,targets, score
  treesColliders = [];
  carsColliders = [];
  riverColliders=[];
  troncosColliders=[];
  turnDown = false;
  turnUp = false;
  turnRight = false;
  turnLeft=false;
  fired = false;
  chicken.position.y = 0;
  chickenGroup.position.set(0,0,0);
  derecha.position.set(chickenGroup.position.x,0, chickenGroup.position.z +step);
  atras.position.set(chickenGroup.position.x-step,0, chickenGroup.position.z);
  enfrente.position.set(chickenGroup.position.x+step,0, chickenGroup.position.z);
  izquierda.position.set(chickenGroup.position.x,0, chickenGroup.position.z -step);
  valor = 0;
  maxTiles = 20;
  camera.position.set(-15, 25, 5);
  camera.lookAt(scene.position);
  root.add(ambientLight);
  root.add(chickenGroup);
  landInicial();
  scene.add(root);
  button.style.display = "none";
  valueScore = 0;
  document.getElementById("score").innerHTML = "Score: "+valueScore;
  document.getElementById("time").innerHTML = "";
  chicken.move = true;
}


function loadObj(){
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
            chicken.enTronco = false;
            chicken.scale.set(5,5,5);
            chicken.position.z = 0;
            chicken.position.y = 0;
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
            chickenBox = new THREE.Box3().setFromObject(chicken);
            chicken.collider = chickenBox;
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
              treeModel.scale.set(step,8,step);
              treeModel.position.x=posicionX;
              treeModel.position.z=-10;
              treeBox = new THREE.Box3().setFromObject(treeModel);
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
                grass.scale.set(5,1,5);
                grass.position.x = posicionX;
                grass.position.y = 0;
                grass.rotation.set(Math.PI,Math.PI / 2,Math.PI);
                root.add(grass);
                landInicial();
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
                road.scale.set(5,1,5);
                road.position.x=10;
                road.position.y = 0;
                road.rotation.set(0,Math.PI / 2,Math.PI);
                root.add(road);
              });

              objLoader.load('models/River/river.obj',function(object){
                var texture = new THREE.TextureLoader().load('models/River/river.png');
                object.traverse(function (child)
                {
                    if (child instanceof THREE.Mesh){
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material.map = texture;
                    }
                });
                river = object;
                river.scale.set(5,1,5);
                river.position.x=5;
                river.position.y = 0;
                river.rotation.set(0,Math.PI / 2,Math.PI);
                river.collider = new THREE.Box3().setFromObject(river);
              });

              objLoader.load('models/River/log.obj',function(object){
                var texture = new THREE.TextureLoader().load('models/River/log.png');
                object.traverse(function (child)
                {
                    if (child instanceof THREE.Mesh){
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material.map = texture;
                    }
                });
                troncos = object;
                troncos.scale.set(5,1,5);
                troncos.position.x=5;
                troncos.position.y=1;
                troncos.rotation.set(0,Math.PI / 2,Math.PI);
                troncos.collider = new THREE.Box3().setFromObject(troncos);
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
      generateRoad();
      break;
    case 3:
      generateRiver();
      break;
  }
  posicionX+=step;
}

function landInicial(){
  while (posicionX < 0) {
    var newGrass = grass.clone();
    newGrass.position.x = posicionX;
    var numTrees = zTreesPositions.length;
    for (var i = 0; i < numTrees; i++) {
      var newTree = treeModel.clone();
      newTree.position.x = posicionX;
      newTree.position.z = zTreesPositions[i];
      var treeBoxNew = new THREE.Box3().setFromObject(newTree);
      treesColliders.push(treeBoxNew);
      root.add(newTree);
    }
    root.add(newGrass);
    posicionX += 5;
  }
  if(posicionX == 0){
    var newGrass = grass.clone();
    newGrass.position.x = posicionX;
    var numTrees = 4;
    for (var i = 0; i < numTrees; i++) {
      var newTree = treeModel.clone();
      newTree.position.x = posicionX;
      if(i % 2 == 0)
        newTree.position.z = zTreesPositions[i];
      else
          newTree.position.z = zTreesPositions[zTreesPositions.length-i];
      var treeBoxNew = new THREE.Box3().setFromObject(newTree);
      treesColliders.push(treeBoxNew);
      root.add(newTree);
    }
    root.add(newGrass);
    posicionX+=5;
  }
}

function generateLand(){
  var newGrass = grass.clone();
  newGrass.position.x = posicionX;
  var numTrees = generarRandom(1,5);
  for (var i = 0; i < numTrees; i++) {
    addTree();
  }
  root.add(newGrass);
}

function generateRoad(){
  var newRoad = road.clone();
  newRoad.position.x = posicionX;
  var numCars = generarRandom(1,2);
  var direction = generarRandom(1,2);
  for (var i = 0; i < numCars; i++) {
    addCar(direction);
  }
  root.add(newRoad);
}

function generateRiver(){
  var newRiver = river.clone();
  newRiver.position.x = posicionX;
  newRiver.position.y=0;
  var riverBoxNew = new THREE.Box3().setFromObject(newRiver);
  newRiver.collider = riverBoxNew;
  var numTroncos = generarRandom(1,2);
  var direction = generarRandom(1,2);
  for (var i = 0; i < numTroncos; i++) {
    addTronco(direction);
  }
  riverColliders.push(newRiver.collider);
  root.add(newRiver);
}

function addTree(){
  var newTree = treeModel.clone();
  newTree.position.x = posicionX;
  newTree.position.z = zTreesPositions[generarRandom(0,7)];
  var treeBoxNew = new THREE.Box3().setFromObject(newTree);
  treesColliders.push(treeBoxNew);
  root.add(newTree);
}

function addCar(direction){
  var newCar = carModel.clone();
  newCar.position.x = posicionX;
  newCar.direction = direction;
  var z = generarRandom(1,3);
  if(direction == 2){
    newCar.rotation.y = Math.PI;
    newCar.position.z = z*30;
  }
  else{
    newCar.position.z = -30*z;
  }
  var carBoxNew = new THREE.Box3().setFromObject(newCar);
  carsColliders.push(newCar);
  root.add(newCar);
}

function addTronco(direction){
  var newTronco = troncos.clone();
  newTronco.position.x = posicionX;
  newTronco.position.y= 1;
  newTronco.direction = direction;
  newTronco.hasChicken = false;
  var z = generarRandom(1,3);
  if(direction == 2){
    newTronco.position.z = z*30;
  }
  else{
    newTronco.position.z = -30*z;
  }
  var troncoBoxNew = new THREE.Box3().setFromObject(newTronco);
  newTronco.collider = troncoBoxNew;
  troncosColliders.push(newTronco);
  root.add(newTronco);
}

function animate(){
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    if(chicken && treeModel && carModel){
      if(!chicken.move && !game){
        button.innerHTML = "Start";
        button.style.display = "block";
        return;
      }
      if(!chicken.move){
        document.getElementById("time").innerHTML = "Game Over";
        button.innerHTML = "Restart";
        button.style.display = "block";
        return;
      }

      chickenBox.setFromObject(chicken);
      chickenBoxHelper.update();
      updateCollisionCars(deltat);
      updateCollisionRiver();
      updateCollisionTroncos(deltat);
      if(chicken.move){
        camera.position.x +=(speed * deltat);
        if(maxTiles  > 0){
          generateMap();
          maxTiles--;
        }
        if(maxTiles < 2){
          maxTiles += 20;
        }
      }
      if(camera.position.x - (1.3*deltat) > chickenGroup.position.x || (chickenGroup.position.z > camera.right - 5 && !chicken.enTronco) || (!chicken.enTronco &&chickenGroup.position.z < camera.left + 10)){
        console.log("Muerte por camara");
        chicken.move = false;
      }
      if(camera.position.x + (1.7*deltat) < chickenGroup.position.x){
        speed = 0.03;
      }
      else{
        speed = 0.01;
      }

    }
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
  scene.add(root);
  window.addEventListener( 'resize', onWindowResize);
  document.addEventListener("keydown", onDocumentKeyDown, false);
  document.addEventListener("keyup", onDocumentKeyUp);
  document.getElementById("score").innerHTML = "Score: "+valueScore;
  button = document.getElementById("start");
}
