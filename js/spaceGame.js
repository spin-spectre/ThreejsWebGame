// import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';

import {OBJLoader2} from '../three.js-r119/examples/jsm/loaders/OBJLoader2.js';
import {MTLLoader} from '../three.js-r119/examples/jsm/loaders/MTLLoader.js';
import {MtlObjBridge} from '../three.js-r119/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';
var conf = {
    fov: 75,
    cameraZ: 75,
    xyCoef: 50,
    zCoef: 10,
    lightIntensity: 0.9,
    ambientColor: 0x000000,
    light1Color: 0x0E09DC,
    light2Color: 0x1CD1E1,
    light3Color: 0x18C02C,
    light4Color: 0xee3bcf };
var music;
var counter=0;
var galaxy, galaxyGeo;
// let renderer, scene, camera;
var width, height, cx, cy, wWidth, wHeight;


var Colors = {black:0x000000,red:0xeb5b34, white:0xfff1ed, pink:0xffa3a3, brown:0x8a4f48, brownDark:0x38211e, blue:0x7ae6e2};
var scene, camera, renderer, container;
var ambientLight, hemisphereLight, shadowLight;
var light1,light2,light3,light4;
var sea, sky, plane;
var stop=1;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock;
var bullets =[];
var crash = false;
// var controls;
var movingCube;
var collideObjects = [];
var obstacles = [];
var rocks=[];
var score = 0;
var scoreText = document.getElementById("distValue");
var id = 0;
var crashId = " ";
var lastCrashId = " ";
const stars = new THREE.Geometry();
var dirs = [];
var movementSpeed = 80;
var objectSize = 10;
var sizeRandomness = 4000;
var totalObjects = 1000;
var parts = [];
// var colors = [0xFF0FFF, 0xCCFF00, 0xFF000F, 0x996600, 0xFFFFFF];
var colors = ['#B0C4DE', '#778899', '#E6E6FA', '#708090','#FFFFFF'];
var Color=[0xB0C4DE, 0x778899, 0xE6E6FA, 0x708090,0xFFFFFF];
var burger=document.getElementById("burger");
burger.onclick=function () {
    stop=1;
}
var StartText  = document.getElementById('Start');
var statusText = document.getElementById('dir');
var gamestateText = document.getElementById('status');
// document.getElementById()
var GameOverText = document.getElementById('GameOver');
var KillsText = document.getElementById('Kills');
var BulletsText  = document.getElementById('Bullets');
// StartText.style.display= 'block';
window.addEventListener('load', init, false);


class Plane {
  constructor() {
    this.mesh = new THREE.Object3D();
    this.mesh.name = "airPlane";

    var geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    var matPropeller = new THREE.MeshPhongMaterial({ color: Colors.white, shading: THREE.FlatShading });
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    this.propeller2 = new THREE.Mesh(geomPropeller, matPropeller);
    this.propeller2.castShadow = true;
    this.propeller2.receiveShadow = true;

    // Make fan blades
    var geomBlade = new THREE.BoxGeometry(1, 80, 10, 1, 1, 1);
    var matBlade = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });
    var blade1 = new THREE.Mesh(geomBlade, matBlade);
    blade1.position.set(0, 0, 0);
    blade1.castShadow = true;
    blade1.receiveShadow = true;
    var blade2 = blade1.clone();
    blade2.rotation.x = Math.PI / 2;
    blade2.castShadow = true;
    blade2.receiveShadow = true;
    var blade3 = blade1.clone();
    blade3.position.set(0, 0, 0);
    blade3.castShadow = true;
    blade3.receiveShadow = true;
    var blade4 = blade1.clone();
    blade4.rotation.x = Math.PI / 2;
    blade4.castShadow = true;
    blade4.receiveShadow = true;

    // Add blades to propeller
    this.propeller.add(blade1);
    this.propeller.add(blade2);
    this.propeller.position.set(20, -20, -80);//15

    // this.mesh.add(this.propeller);
    this.propeller2.add(blade3);
    this.propeller2.add(blade4);
    this.propeller2.position.set(20, -20, 80);//15
    // this.propeller2.rotation.y = Math.PI/2;

    // this.mesh.add(this.propeller2);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    var bdboxGeo = new THREE.BoxGeometry(300, 40, 80, 1, 1, 1);
    var bdboxMat = new THREE.MeshPhongMaterial({ color: Colors.blue, transparent: true, opacity: 0, shading: THREE.FlatShading });
    this.bdbox = new THREE.Mesh(bdboxGeo, bdboxMat);
    this.bdbox.position.set(30, 0, 0);
    this.bdbox.rotation.y=-Math.PI/2;
    this.bdbox.castShadow = true;
    this.bdbox.receiveShadow = true;
    this.mesh.add(this.bdbox);


    const mtlLoader = new MTLLoader();
    mtlLoader.load('asset/models/Intergalactic_Spaceship-(Wavefront).mtl', (mtlParseResult) => {
      const objLoader = new OBJLoader2();
      const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
      objLoader.addMaterials(materials);
      objLoader.load('asset/models/Intergalactic_Spaceship-(Wavefront).obj', (root) => {
          root.scale.multiplyScalar(20);//50
          root.rotation.y = Math.PI/2;
          this.mesh.add(root);
      });
    });

  }
}

class Sky {
  constructor() {
    this.mesh = new THREE.Object3D();
    this.nClouds = 20;
    this.clouds = [];
    var stepAngle = Math.PI * 2 / this.nClouds;
    for (var i = 0; i < this.nClouds; i++) {
      var c = new Cloud();
      this.clouds.push(c);
      var a = stepAngle * i;
      var h = 750 + Math.random() * 150;//650
      c.mesh.position.y = Math.sin(a) * h;
      c.mesh.position.z = Math.cos(a) * h;
      c.mesh.position.x = -400 + Math.random() * 800;
      // c.mesh.rotation.z = a + Math.PI / 2;
      var s = 1 + Math.random() * 2;
      c.mesh.scale.set(s, s, s);
      this.mesh.add(c.mesh);
    }
  }
}

class Cloud {
  constructor()
  {
    this.mesh = new THREE.Object3D();
    this.mesh.name = "cloud";
    var geom = new THREE.CubeGeometry(50, 50, 50);//20
    //   var geom = new THREE. SphereGeometry(20,20,20);
    var mat = new THREE.MeshPhongMaterial({
      color: Colors.white,transparent: true,
        opacity: .3
    });

    var nBlocs = 2 + Math.floor(Math.random() * 2);

    for (var i = 0; i < nBlocs; i++) {
      var m = new THREE.Mesh(geom.clone(), mat);
      m.position.x = i * 10;//10
      m.position.y = Math.random();//10
      m.position.z = Math.random() * 20;//10
      m.rotation.z = Math.random() * Math.PI * 4;
      m.rotation.y = Math.random() * Math.PI * 4;//2
      var s = .1 + Math.random() * .9;
      m.scale.set(s, s, s);
      m.castShadow = true;
      m.receiveShadow = true;
      this.mesh.add(m);
    }
  }
}

function createScene() {
    scene = new THREE.Scene();
    // scene.fog = new THREE.Fog(Colors.black, 0,0);
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight,1,10000);
    camera.position.set(0, 170, 400);
    camera.lookAt(scene.position)
    scene.add(camera);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    // container = document.getElementById('world');
    container = document.createElement('div');
    document.body.appendChild( container );

    container.appendChild(renderer.domElement);
    parts.push(new AnimateBoom(0, 0,0));
    // controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function createLights() {
    const r = 30;
    const y = 10;
    const lightDistance = 50;
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);//0xaaaaaa灰色
    ambientLight = new THREE.AmbientLight(0xdc8874, .5);//0xdc8874桃子的颜色
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    shadowLight.position.set(150, 350, 350);
    shadowLight.castShadow = true;
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;
    scene.add(hemisphereLight);
    scene.add(shadowLight);
    scene.add(ambientLight);
}

function createPlane(){
  plane = new Plane();
  plane.mesh.position.set(0,25,-20);
  scene.add(plane.mesh);
  plane.mesh.rotation.y=Math.PI/2;
  var cubeGeometry = new THREE.CubeGeometry(300, 80, 80, 5, 5, 5);
  var wireMaterial = new THREE.MeshPhongMaterial({ color: Colors.blue, transparent: true, opacity: 0, shading: THREE.FlatShading });
  movingCube = new THREE.Mesh(cubeGeometry, wireMaterial);
  movingCube.position.set(0, 40, -20);
  scene.add(movingCube);
}

function createSky() {
  sky = new Sky();
  sky.mesh.position.set(0,-800,0);
  scene.add(sky.mesh);
}

function createObstacles() {
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    var b = getRandomInt(1, 3) * 50;
    var size = getRandomInt(20,40);
    var geometry = new THREE.TetrahedronGeometry(2*size, 0);
    var mat = new THREE.MeshPhongMaterial({color:0x009999, shininess:0, specular:0xffffff, shading:THREE.FlatShading});
    var box = new THREE.Mesh(geometry, mat);
    counter+=1;var num =counter%4;
    box.material.color.setHex( Color[num]);

    box.position.x = getRandomArbitrary(-600, 600);//-250 250Math.random() * (600 - (-600)) + (-600);
    box.position.y = 1 + b / 2;
    box.position.z = getRandomArbitrary(-800, -1200);
    box.rotation.x=getRandomArbitrary(0,4);
    obstacles.push(box);
    box.name = "box_" + id;id++;
    collideObjects.push(box);
    scene.add(box);
}

function createRocks() {
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    var b = getRandomInt(1, 3) * 50;
    var size = getRandomInt(20,40);
    // var geometry = new THREE.TetrahedronGeometry(2*size, 0);
    // var mat = new THREE.MeshPhongMaterial({color:0x009999, shininess:0, specular:0xffffff, shading:THREE.FlatShading});
    // var box = new THREE.Mesh(geometry, mat);
    var cl =new Cloud();
    var box = cl.mesh;
    counter+=1;var num =counter%4;
    // box.material.color.setHex( Color[num]);

    box.position.x = getRandomArbitrary(-600, 600);//-250 250Math.random() * (600 - (-600)) + (-600);
    box.position.y = 1 + b / 2;
    box.position.z = getRandomArbitrary(-800, -1200);
    box.rotation.x=getRandomArbitrary(0,4);
    rocks.push(box);
    box.name = "box_" + id;id++;
    // collideObjects.push(box);
    scene.add(box);
}

function detectKeys() {
    if(stop){
        // if(gamestateText.style.display === "block" && keyboard.pressed("space")){
        //     window.location.href="spaceGame.html";
        // }
        if(keyboard.pressed("x")||keyboard.pressed("left")||keyboard.pressed("right")||keyboard.pressed("up")
        ||keyboard.pressed("down")||keyboard.pressed("space")){
            stop=0;
            // GameOverText.style.display= 'block';
            // gamestateText.style.display= 'block';
            // gamestateText.style.display = "none";
            // StartText.style.display= "none";
        }
    }
    if(keyboard.pressed("1")){
        document.getElementById('background_music').play()
    }
    if(!stop) {

        if (keyboard.pressed("P")) {
            stop = 1;
            // StartText.style.display= "block";
        }
        // stars.rotateX(.001);
        var delta = clock.getDelta();
        var moveDistance = 200 * delta;
        if (keyboard.pressed("left") || keyboard.pressed("A")) {
            if (plane.mesh.position.x > -270) {
                plane.mesh.position.x -= moveDistance;
                movingCube.position.x -= moveDistance;
            }
        }
        if (keyboard.pressed("right") || keyboard.pressed("D")) {
            if (plane.mesh.position.x < 370) {
                plane.mesh.position.x += moveDistance;
                movingCube.position.x += moveDistance;
            }
        }
        if (keyboard.pressed("up") || keyboard.pressed("W")) {
            plane.mesh.position.y += moveDistance;
            movingCube.position.y += moveDistance;
        }
        if (keyboard.pressed("down") || keyboard.pressed("S")) {
            plane.mesh.position.y -= moveDistance;
            movingCube.position.y -= moveDistance;
        }
        if (!(keyboard.pressed("left") || keyboard.pressed("right") ||
            keyboard.pressed("A") || keyboard.pressed("D"))) {
            delta = camera.rotation.z;
            camera.rotation.z -= delta / 10;
        }
        // sky.mesh.rotation.x += .01;
        // plane.propeller.rotation.x += 0.3;
        // plane.propeller2.rotation.x += 0.3;
        updateObstacles();
        updateRocks();
        detectCrash();
        updateScores();
    }
}

function detectCrash(){
    for (var index = 0; index < bullets.length; index++) {
        if (bullets[index] === undefined) continue;
        if (bullets[index].alive === false) {
            bullets.splice(index, 1);
            continue;
        }
        bullets[index].position.add(bullets[index].velocity);
    }
    var boom = [];
    if (keyboard.pressed("x")) {

        var bullet = new THREE.Mesh(
            new THREE.SphereGeometry(5, 8, 8),//0.05
            new THREE.MeshBasicMaterial({color: 0xffffff})
        );

        bullet.position.set(
            plane.mesh.position.x, plane.mesh.position.y, plane.mesh.position.z
        );
        var pp = plane.mesh.position.clone();
        var razer = new THREE.Raycaster(pp, new THREE.Vector3(0, 0, -1));
        boom = razer.intersectObjects(collideObjects);
        bullet.velocity = new THREE.Vector3(0, 0, -100);
        // 子弹的消失
        bullet.alive = true;
        setTimeout(function () {
            bullet.alive = false;
            scene.remove(bullet);
        }, 1000);
        // 将子弹加入到场景中
        bullets.push(bullet);
        scene.add(bullet);
    }
    if (boom.length > 0) {
        parts.push(new AnimateBoom(boom[0].object.position.x, boom[0].object.position.y, boom[0].object.position.z));
        boom[0].object.position.z = 1000;
        scene.remove(boom[0].object);//要remove object
        boom.splice(0, boom.length);
        score += 300;
        document.getElementById('mingzhong_sound').play()
    }
    var originPoint = plane.mesh.position.clone();
    for (var vertexIndex = 0; vertexIndex < movingCube.geometry.vertices.length; vertexIndex++) {
        // 顶点原始坐标
        var localVertex = movingCube.geometry.vertices[vertexIndex].clone();
        // 顶点经过变换后的坐标
        var globalVertex = localVertex.applyMatrix4(movingCube.matrix);
        var directionVector = globalVertex.sub(movingCube.position);

        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(collideObjects);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            crash = true;
            crashId = collisionResults[0].object.name;
            break;
        }
        crash = false;
    }
    if (crash) {
        // console.log("Crash");
        if (crashId !== lastCrashId) {
            score -= 100;
            lastCrashId = crashId;
        }
        document.getElementById('collide_sound').play()
        // document.getElementById('collide_sound').play()
    }
    if (Math.random() < 0.03 && obstacles.length < 30) {
        createObstacles();
    }
    if (Math.random() < 0.03 && rocks.length < 30) {
        createRocks();
    }
}
function updateObstacles() {
    for (var i = 0; i < obstacles.length; i++) {
        if (obstacles[i].position.z > camera.position.z) {
            // alert(typeof cubes[i]);
            scene.remove(obstacles[i]);
            obstacles.splice(i, 1);
            collideObjects.splice(i, 1);
        } else {
            obstacles[i].position.z += 10;
        }
    }
    for(let i=0;i<obstacles.length;i++){
        obstacles[i].rotation.x+=.05;
        obstacles[i].rotation.y+=.05;
    }
}
function updateRocks() {
    for (var i = 0; i < rocks.length; i++) {
        if (rocks[i].position.z > camera.position.z) {
            // alert(typeof cubes[i]);
            scene.remove(rocks[i]);
            rocks.splice(i, 1);
        } else {
            rocks[i].position.z += 10;
        }
    }
    // for(let i=0;i<rocks.length;i++){
    //     rocks[i].rotation.x+=.05;
    //     rocks[i].rotation.y+=.05;
    // }
}

function updateScores() {
    score += 0.1;
    if(score>1000){
        window.location.href="congratulate.html";
    }
    if(score<-200){
        window.location.href="fail.html";
    }
    scoreText.innerText =  Math.floor(score);
}
function AnimateBoom(x,y,z) {
    // count++;
    var boomGeometry = new THREE.Geometry();

    for (let i = 0; i < totalObjects; i ++)
    {
        var vertex = new THREE.Vector3();
        vertex.x = x;
        vertex.y = y;
        vertex.z = z;

        boomGeometry.vertices.push( vertex );
        dirs.push({x:(Math.random() * movementSpeed)-(movementSpeed/2),y:(Math.random() * movementSpeed)-(movementSpeed/2),z:(Math.random() * movementSpeed)-(movementSpeed/2)});
    }
    var material = new THREE.ParticleBasicMaterial( { size: objectSize,  color: colors[Math.round(Math.random() * colors.length)]});


    this.object  = new THREE.ParticleSystem( boomGeometry, material );
    this.status = true;

    this.xDir = (Math.random() * movementSpeed)-(movementSpeed/2);
    this.yDir = (Math.random() * movementSpeed)-(movementSpeed/2);
    this.zDir = (Math.random() * movementSpeed)-(movementSpeed/2);

    scene.add( this.object  );

    this.update = function(){
        if (this.status === true){
            var pCount = totalObjects;
            while(pCount--) {
                var particle =  this.object.geometry.vertices[pCount]
                particle.y += dirs[pCount].y;
                particle.x += dirs[pCount].x;
                particle.z += dirs[pCount].z;
            }
            this.object.geometry.verticesNeedUpdate = true;
        }
    }
}
function animateBullet(){
    var pCount = parts.length;
    while(pCount--) {
        parts[pCount].update();
    }
}
function createGalaxy() {
    galaxyGeo = new THREE.Geometry();
    for(let i=0;i<6000;i++) {
        var planet = new THREE.Vector3(
            Math.random() * 1000 - 300,//600 300
            Math.random() * 1000 - 300,
            Math.random() * 1000 - 300
        );
        planet.velocity = 0;
        planet.acceleration = 0.02;//2
        galaxyGeo.vertices.push(planet);
    }

    let sprite = new THREE.TextureLoader().load( './asset/images/star.png' );
    let starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.7,
        map: sprite
    });

    galaxy = new THREE.Points(galaxyGeo,starMaterial);
    scene.add(galaxy);
    galaxy.position.y=160;
    galaxy.position.z=300;
    galaxy.rotation.x=-Math.PI/2;

}
function updateGalaxy() {
    galaxyGeo.vertices.forEach(p => {
        p.velocity += p.acceleration
        p.y -= p.velocity;

        if (p.y < -200) {
            p.y = 200;
            p.velocity = 0;
        }
    });
    galaxyGeo.verticesNeedUpdate = true;
    galaxy.rotation.y +=0.002;
}
function updateSize() {
    width = window.innerWidth;cx = width / 2;
    height = window.innerHeight;cy = height / 2;
    if (renderer && camera) {
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        const wsize = getRendererSize();
        wWidth = wsize[0];
        wHeight = wsize[1];
    }
}
function getRendererSize() {
    const cam = new THREE.PerspectiveCamera(camera.fov, camera.aspect);
    const vFOV = cam.fov * Math.PI / 180;
    const height = 2 * Math.tan(vFOV / 2) * Math.abs(conf.cameraZ);
    const width = height * cam.aspect;
    return [width, height];
}


function update() {
    detectKeys();
    updateGalaxy();
    animateBullet();
    renderer.render(scene, camera);
    requestAnimationFrame(update);
}

function init(event) {
    window.addEventListener('resize', updateSize, false);
    createScene();
    createLights();
    createPlane();
    // createSky();
    createGalaxy();
    // while(1){
    //     if(keyboard.pressed("space")){
    //         break;
    //     }
    // }
    update();

}
