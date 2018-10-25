var camera = null,
renderer = null,
scene = null,
root = null,
group = null,
game = true,
ambientLight = null,
objLoader = null,
chicken=null,tree1 = null,
orbitControls = null,
chickenBoxHelper = null, treeBoxHelper = null, chickenBox = null, treeBox = null, newTree=null, car1=null,currentTime,
carBoxHelper = null, carBox= null, valueScore = 0, speed = 0.01, dotGeo = null, enfrente = null, izquierda =null, derecha=null, atras=null,
step = 5, chickenGroup=null, treesColliders = [], carsColliders = [];
var map = "", mapUrl="";
var trigger = false, turnDown = false, turnUp = false, turnRight = false, turnLeft=false, fired = false,load = false;
var materials = {
    shadow: new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.5
    }),
    solid: new THREE.MeshNormalMaterial({}),
    colliding: new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5
    }),
    dot: new THREE.MeshBasicMaterial({
        color: 0x0000ff
    })
};
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

function loadObj()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();

    objLoader.load('models/Chicken/chicken.obj',function(object){
            var texture = new THREE.TextureLoader().load('models/Chicken/chicken.png');
            object.traverse( function (child)
            {
                if (child instanceof THREE.Mesh)
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                }
            } );

            chicken = object;
            chickenGroup = new THREE.Object3D;
            chicken.move = true;
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
              tree1 = object;
              tree1.scale.set(7,7,7);
              tree1.position.x=0;
              tree1.position.z=-10;
              treeBoxHelper = new THREE.BoxHelper();
              treeBoxHelper.setFromObject(tree1, 0x00ff00);
              treeBoxHelper.position = tree1.position;
              treeBoxHelper.update();
              treeBox = new THREE.Box3().setFromObject(treeBoxHelper);
              treesColliders.push(treeBox);
              root.add(treeBoxHelper);
              root.add(tree1);
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
                car1 = object;
                car1.scale.set(5,5,5);
                car1.position.x=10;
                car1.position.z=-50 - Math.random() * 50;
                carBoxHelper = new THREE.BoxHelper();
                carBoxHelper.setFromObject(car1, 0x00ff00);
                carBoxHelper.update();

                root.add(carBoxHelper);
                root.add(car1);
              });
              load = true;
              //addTree();
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
  var newTree = tree1.clone();
  newTree.position.x = 5;
  newTree.position.z = -15;
  root.add(newTree);
  console.log("new tree");
}


function addCar(){
  var newTree = tree1.clone();
  newTree.position.x = 5;
  newTree.position.z = -15;
  root.add(newTree);
  console.log("new tree");
}

function animate(){
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    if(chicken && tree1 && car1){
      chickenBoxHelper.update();
      chickenBox = new THREE.Box3().setFromObject(chicken);
      treeBoxHelper.update();
      carBoxHelper.update();
      carBox = new THREE.Box3().setFromObject(car1);
      if(chickenBox.intersectsBox(carBox)){
        console.log("choco");
        chicken.move = false;
        car1.position.z = car1.position.z;
      }
      if(chicken.move){
        camera.position.x +=(speed * deltat);
        car1.position.z += 0.03 * deltat;
        if(car1.position.z > 40)
          car1.position.z = -70 - Math.random() * 50;
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
}

function run() {
  requestAnimationFrame(function() { run(); });
  renderer.render(scene, camera);
  animate();
}

function createScene(canvas) {
  var mapUrl = "images/grasslush.png";
  var normalMapUrl =  "images/grassnormalmap.png";
  var aspect = window.innerWidth / window.innerHeight, size = 1000;
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
  loadObj();
  group = new THREE.Object3D;
  var map = new THREE.TextureLoader().load(mapUrl);
  var mapN = new THREE.TextureLoader().load(normalMapUrl);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);
  mapN.wrapS = mapN.wrapT = THREE.RepeatWrapping;
  mapN.repeat.set(8, 8);
  var color = 0xffffff;
  geometry = new THREE.PlaneGeometry(200, 200, 100, 100);
  var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map,normalMap:mapN, side:THREE.DoubleSide}));
  mesh.rotation.x = Math.PI /2;
  // Add the mesh to our group
  group.add(mesh);
  root.add(group);
  scene.add(root);

  window.addEventListener( 'resize', onWindowResize);
  document.addEventListener("keydown", onDocumentKeyDown, false);
  document.addEventListener("keyup", onDocumentKeyUp);
  document.getElementById("score").innerHTML = "Score: "+valueScore;
}
