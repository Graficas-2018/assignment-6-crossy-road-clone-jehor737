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
chickenBoxHelper = null, treeBoxHelper = null, chickenBox = null, treeBox = null, newTree=null, car1=null,
carBoxHelper = null, carBox= null;
var xSpeed = 0.0001;
var ySpeed = 0.0001;
var trigger = false, turnDown = false, turnUp = true, turnRight = false, turnLeft=false, fired = false;
function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentKeyUp(event){
  fired=false;
}

function onDocumentKeyDown(event) {
  if (!fired && chicken.move) {
    var keyCode = event.which;
    fired = true;
    //Up
    if (keyCode == 87) {
      if(turnUp && !chickenBox.intersectsBox(treeBox)){
        chicken.translateZ(1);
      }
      else if (turnUp && chickenBox.intersectsBox(treeBox)) {
        chicken.translateZ(0);
      }
      else{
        turnUp = true;
        turnDown = false;
        turnRight = false;
        turnLeft = false;
        chicken.rotation.y = Math.PI-Math.PI/4;
        chicken.translateZ(2);
      }
    }
    //Down
    else if (keyCode == 83) {
        if(turnDown && !chickenBox.intersectsBox(treeBox)){
          chicken.translateZ(1);
        }
        else if (turnDown && chickenBox.intersectsBox(treeBox)) {
          chicken.translateZ(0);
        }
        else{
          turnDown = true;
          turnUp = false;
          turnRight = false;
          turnLeft = false;
          chicken.rotation.y = -(Math.PI+Math.PI/4)+Math.PI;
          chicken.translateZ(2);
        }
    }
    //Left
    else if (keyCode == 65) {
        if(turnLeft && !chickenBox.intersectsBox(treeBox)){
          chicken.translateZ(1);
        }
        else if (turnLeft && chickenBox.intersectsBox(treeBox)) {
          chicken.translateZ(0);
        }
        else{
          turnUp = false;
          turnRight = false;
          turnDown = false;
          turnLeft = true;
          chicken.rotation.y = Math.PI+Math.PI/4;
          chicken.translateZ(2);
        }
    }
    //Right
    else if (keyCode == 68) {
        if(turnRight && !chickenBox.intersectsBox(treeBox)){
          chicken.translateZ(1);
        }
        else if (turnRight && chickenBox.intersectsBox(treeBox)) {
          chicken.translateZ(0);
        }
        else{
          turnUp = false;
          turnDown = false;
          turnRight = true;
          turnLeft = false;
          chicken.rotation.y = 2*Math.PI+Math.PI/4;
          chicken.translateZ(2);
        }
      }
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
            chicken.move = true;
            chicken.scale.set(3,3,3);
            chicken.position.z = 0;
            chicken.position.x = 0;
            chicken.rotation.y = Math.PI-Math.PI/4;
            chickenBoxHelper = new THREE.BoxHelper();
            chickenBoxHelper.setFromObject(chicken,0x00ff00);
            chickenBoxHelper.update();
            chickenBoxHelper.visible=true;
            root.add(chickenBoxHelper);
            root.add(chicken);

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
              tree1.scale.set(5,5,5);
              tree1.position.x=0;
              tree1.position.z=-10;
              treeBoxHelper = new THREE.BoxHelper();
              treeBoxHelper.setFromObject(tree1, 0x00ff00);
              treeBoxHelper.update();
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
                car1.position.x=0;
                car1.position.z=-20;
                carBoxHelper = new THREE.BoxHelper();
                carBoxHelper.setFromObject(car1, 0x00ff00);
                carBoxHelper.update();
                root.add(carBoxHelper);
                root.add(car1);
              });
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

function animate(){
  if(chicken && tree1 && car1){
    chickenBoxHelper.update();
    chickenBox = new THREE.Box3().setFromObject(chicken);

  //}
  //if(tree1){
    treeBoxHelper.update();
    treeBox = new THREE.Box3().setFromObject(tree1);
    carBoxHelper.update();
    carBox = new THREE.Box3().setFromObject(car1);
    if(chickenBox.intersectsBox(carBox)){
      console.log("choco");
      chicken.move = false;
    }
  //}
  //if(chicken && tree1){
    /*if(){
      chickenBox
      console.log("hi");
    }*/
  }

}

function run() {
  requestAnimationFrame(function() { run(); });
  // Render the scene
  renderer.render(scene, camera);
  // Spin the cube for next frame
  orbitControls.update();
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
  camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
  camera.position.set(0, 30, 30);
  camera.rotation.set(0,180,0);
  orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
  scene.add(camera);

  // Create a group to hold all the objects
  root = new THREE.Object3D;
  ambientLight = new THREE.AmbientLight ( 0xffffff );
  root.add(ambientLight);
  loadObj();
  group = new THREE.Object3D;
  root.add(group);
  scene.add(root);

  window.addEventListener( 'resize', onWindowResize);
  document.addEventListener("keydown", onDocumentKeyDown, false);
  document.addEventListener("keyup", onDocumentKeyUp);
}
