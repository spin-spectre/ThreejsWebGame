
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
var width, height, wWidth, wHeight;
var waveplane;
var scene, camera, renderer, container;
var ambientLight, hemisphereLight, shadowLight;
var sea, sky, plane;
var stop=1;var cnt=0;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock;
var bullets =[];
var crash = false;
// var controls;
var movingCube;
var collideMeshList = [];
var cubes = [];
var score = 0;
var scoreText = document.getElementById("score");
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
var colors = ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C','#FFFFFF'];
var Color=[0xFF1461, 0x18FF92, 0x5A87FF, 0xFBF38C,0xFFFFFF];
var Colors = {black:0x000000,red:0xeb5b34, white:0xfff1ed, pink:0xffa3a3, brown:0x8a4f48, brownDark:0x38211e, blue:0x7ae6e2};
var StartText  = document.getElementById('Start');
// var statusText = document.getElementById('dir');
var gamestateText = document.getElementById('status');
// var GameOverText = document.getElementById('GameOver');
// var KillsText = document.getElementById('Kills');
// var BulletsText  = document.getElementById('Bullets');
StartText.style.display= 'block';

class Plane {
  constructor() {
    this.mesh = new THREE.Object3D();
    this.mesh.name = "airPlane";

    var geoLuoxuan = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    var matLuoxuan = new THREE.MeshPhongMaterial({ color: Colors.white, shading: THREE.FlatShading });
    this.luoxuan = new THREE.Mesh(geoLuoxuan, matLuoxuan);
    this.luoxuan.castShadow = true;
    this.luoxuan.receiveShadow = true;

    this.luoxuan2 = new THREE.Mesh(geoLuoxuan, matLuoxuan);
    this.luoxuan2.castShadow = true;
    this.luoxuan2.receiveShadow = true;

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

    this.luoxuan.add(blade1);
    this.luoxuan.add(blade2);
    this.luoxuan.position.set(20, -20, -80);//15

    this.mesh.add(this.luoxuan);
    this.luoxuan2.add(blade3);
    this.luoxuan2.add(blade4);
    this.luoxuan2.position.set(20, -20, 80);//15

    this.mesh.add(this.luoxuan2);
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
    mtlLoader.load('asset/models/jetanima.mtl', (mtlParseResult) => {
      const objLoader = new OBJLoader2();
      const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
      objLoader.addMaterials(materials);
      objLoader.load('asset/models/jetanima.obj', (root) => {
          root.scale.multiplyScalar(50);//50
          root.rotation.y = Math.PI/2;
          this.mesh.add(root);
      });
    });

  }
}

class Sky {
  constructor()
  {
    this.mesh = new THREE.Object3D();
    this.nClouds = 20;
    this.clouds = [];
    var stepAngle = Math.PI * 2 / this.nClouds;

    for (var i = 0; i < this.nClouds; i++)
    {
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
    var geom = new THREE.CubeGeometry(20, 20, 20);
    //   var geom = new THREE. SphereGeometry(20,20,20);
    var mat = new THREE.MeshPhongMaterial({
      color: Colors.white,transparent: true,
        opacity: .5,
    });

    var nBlocs = 3 + Math.floor(Math.random() * 3);

    for (var i = 0; i < nBlocs; i++) {
      var m = new THREE.Mesh(geom.clone(), mat);
      m.position.x = i * 10;//10
      m.position.y = Math.random();//10
      m.position.z = Math.random() * 10;
      m.rotation.z = Math.random() * Math.PI * 2;
      m.rotation.y = Math.random() * Math.PI * 2;
      var s = .1 + Math.random() * .9;
      m.scale.set(s, s, s);
      m.castShadow = true;
      m.receiveShadow = true;
      this.mesh.add(m);
    }
  }
}

class Sea {
  constructor() {
    var geom = new THREE.CylinderGeometry(600, 600, 2400, 40, 10);//600,600,2400,40
    //   var geom =  new THREE.CubeGeometry(300, 8000, 8000, 5, 5, 5);
    var mat = new THREE.MeshPhongMaterial({
      color: '#095484',
      transparent: true,
      opacity: 1,
      shading: THREE.FlatShading
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.receiveShadow = true;
    this.mesh.rotation.z = Math.PI / 2;

    this.waves = [];
    var l = geom.vertices.length;
    for (var i = 0; i < l; i++) {
      var v = geom.vertices[i];
      this.waves.push({
        y: v.y,
        x: v.x,
        z: v.z,
        ang: Math.random() * Math.PI * 2,
        amp: 5 + Math.random() * 50,//15
        speed: 0.016 + Math.random() * 0.032
      });
    }
  }

  moveWaves()
  {
    var verts = this.mesh.geometry.vertices;//所有小三角形的顶点
    var l = verts.length;

    for (var i = 0; i < l; i++)
    {
      var v = verts[i];
      var vprops = this.waves[i];
      v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
      v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;
      v.z = vprops.z + Math.sin(vprops.ang) * vprops.amp;
      vprops.ang += vprops.speed;
    }
    this.mesh.geometry.verticesNeedUpdate = true;
    // sea.mesh.rotation.x += .005;
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
    parts.push(new ExplodeAnimation(0, 0,0));
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
    // light1 = new THREE.PointLight(conf.light1Color, conf.lightIntensity, lightDistance);
    // light1.position.set(0, y, r);
    // scene.add(light1);
    // light2 = new THREE.PointLight(conf.light2Color, conf.lightIntensity, lightDistance);
    // light2.position.set(0, -y, -r);
    // scene.add(light2);
    // light3 = new THREE.PointLight(conf.light3Color, conf.lightIntensity, lightDistance);
    // light3.position.set(r, y, 0);
    // scene.add(light3);
    // light4 = new THREE.PointLight(conf.light4Color, conf.lightIntensity, lightDistance);
    // light4.position.set(-r, y, 0);
    // scene.add(light4);
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

function createSea() {
 sea= new Sea();
 sea.mesh.position.set(0,-800,0);
 scene.add(sea.mesh);
}

function createStar() {
    for (let i = 0; i < 10000; i++) {
        const star = new THREE.Vector3();
        star.x = THREE.Math.randFloatSpread(5000);//2000
        star.y = THREE.Math.randFloatSpread(2000);
        star.z = THREE.Math.randFloatSpread(2000);
        stars.vertices.push(star)
    }
    const material = new THREE.PointsMaterial({
        color: 0xffffff
    });
    const starField = new THREE.Points(stars, material);
    scene.add(starField);
}

function getKey() {


    if(stop){
        if(gamestateText.style.display === "block" && keyboard.pressed("space")){
            window.location.href="index.html";
        }
        if(gamestateText.style.display !== "block" && keyboard.pressed("space")){
            stop=0;
            // GameOverText.style.display= 'block';
            // gamestateText.style.display= 'block';
            gamestateText.style.display = "none";
            StartText.style.display= "none";
        }

    }if(keyboard.pressed("1")){
        document.getElementById('background_music').play()
    }
    if(keyboard.pressed("m")){
        window.location.href="spaceGame.html";
    }
    if(!stop) {

        for (var index = 0; index < bullets.length; index++) {
            if (bullets[index] === undefined) continue;
            if (bullets[index].alive === false) {
                bullets.splice(index, 1);
                continue;
            }
            bullets[index].position.add(bullets[index].velocity);
        }
        stars.rotateX(.001);
        var delta = clock.getDelta();
        var moveDistance = 200 * delta;
        if (keyboard.pressed("left") || keyboard.pressed("A")) {
            if (plane.mesh.position.x > -270) {
                plane.mesh.position.x -= moveDistance;
                movingCube.position.x -= moveDistance;
            }
            if (camera.position.x > -150) {
                camera.position.x -= moveDistance * 0.6;
                if (camera.rotation.z > -5 * Math.PI / 180) {
                    camera.rotation.z -= 0.2 * Math.PI / 180;
                }
            }
        }
        if (keyboard.pressed("right") || keyboard.pressed("D")) {
            if (plane.mesh.position.x < 370) {
                plane.mesh.position.x += moveDistance;
                movingCube.position.x += moveDistance;
            }

            if (camera.position.x < 250) {
                camera.position.x += moveDistance * 0.6;
                if (camera.rotation.z < 5 * Math.PI / 180) {
                    camera.rotation.z += 0.2 * Math.PI / 180;
                }
            }
        }
        if (keyboard.pressed("up") || keyboard.pressed("W")) {
            plane.mesh.position.y += moveDistance;
            movingCube.position.y += moveDistance;
        }
        if (keyboard.pressed("down") || keyboard.pressed("S")) {
            console.log(plane.mesh.position.y );
            if(plane.mesh.position.y>-120){
                plane.mesh.position.y -= moveDistance;
                movingCube.position.y -= moveDistance;
            }
        }
        if (!(keyboard.pressed("left") || keyboard.pressed("right") ||
            keyboard.pressed("A") || keyboard.pressed("D"))) {
            delta = camera.rotation.z;
            camera.rotation.z -= delta / 10;
        }
        if (keyboard.pressed("P")) {
            stop = 1;
            StartText.style.display= "block";
        }
        var boom = [];
        if (keyboard.pressed("x")) {

            var bullet = new THREE.Mesh(
                new THREE.SphereGeometry(5, 8, 8),//0.05
                new THREE.MeshBasicMaterial({color: 0xff0000})
            );

            bullet.position.set(
                plane.mesh.position.x, plane.mesh.position.y, plane.mesh.position.z
            );
            var pp = plane.mesh.position.clone();
            var razer = new THREE.Raycaster(pp, new THREE.Vector3(0, 0, -1));
            boom = razer.intersectObjects(collideMeshList);
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
            parts.push(new ExplodeAnimation(boom[0].object.position.x, boom[0].object.position.y, boom[0].object.position.z));
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
            var collisionResults = ray.intersectObjects(collideMeshList);
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
        if (Math.random() < 0.03 && cubes.length < 30) {
            makeRandomCube();
        }
        for (var i = 0; i < cubes.length; i++) {
            if (cubes[i].position.z > camera.position.z) {
                // alert(typeof cubes[i]);
                scene.remove(cubes[i]);
                cubes.splice(i, 1);
                collideMeshList.splice(i, 1);
            } else {
                cubes[i].position.z += 10;
            }
        }
        score += 0.1;
        sky.mesh.rotation.x += .01;
        plane.luoxuan.rotation.x += 0.3;
        plane.luoxuan2.rotation.x += 0.3;
    }
}

function update() {
    // scene.fog.
    // scene.fog.near
    updateSize();

    // animateSea();
    if(score>1000){
        window.location.href="congratulate.html";
    }
    if(score<-200){
        stop=1;
        gamestateText.style.display = "block";
    }
    getKey();
    scoreText.innerText = "Score:" + Math.floor(score);

    sea.moveWaves();

    sea.mesh.rotation.x+= .001;
    // controls.update();
    for(let i=0;i<cubes.length;i++){
        cubes[i].rotation.x+=.05;
        cubes[i].rotation.y+=.05;
    }

    var pCount = parts.length;
    while(pCount--) {
        parts[pCount].update();
    }
}


function makeRandomCube() {
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
    // 返回一个介于min和max之间的整型随机数
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    var b = getRandomInt(1, 3) * 50;
    // var geometry = new THREE.BoxGeometry(50,50,50, 1, 1, 1);
    var size = getRandomInt(20,40);

    var geometry = new THREE.TetrahedronGeometry(2*size, 0);
    var mat = new THREE.MeshPhongMaterial({color:0x009999, shininess:0, specular:0xffffff, shading:THREE.FlatShading});
    var box = new THREE.Mesh(geometry, mat);
    cnt+=1;
    var num =cnt%4;
    box.material.color.setHex( Color[num]);

    box.position.x = getRandomArbitrary(-600, 600);//-250 250Math.random() * (600 - (-600)) + (-600);
    box.position.y = 1 + b / 2;
    box.position.z = getRandomArbitrary(-800, -1200);
    box.rotation.x=getRandomArbitrary(0,4);
    cubes.push(box);
    box.name = "box_" + id;
    id++;
    collideMeshList.push(box);

    scene.add(box);
}
function ExplodeAnimation(x,y,z) {
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

function loop() {
    // alert(wWidth);
    update();

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}

function init(event) {
    updateSize();
    window.addEventListener('resize', updateSize, false);
    if(keyboard.pressed("space")){
        music=document.createElement("audio");
        var sourceMusic=document.createElement("source");
        sourceMusic.src="ImperialMarch.mp3";
        music.loop=true;
        music.preload=true;
        music.autoplay=true;
        music.appendChild(sourceMusic);
        music.play();
    }
    createScene();
    createLights();
    createPlane();
    createSky();
    createSea();
    createStar();
// alert(wWidth);
    let wavemat = new THREE.MeshLambertMaterial({ color: 0x095484, side: THREE.DoubleSide });
    let wavegeo = new THREE.PlaneBufferGeometry(230, 115, 230 / 2, 115 / 2);
    waveplane = new THREE.Mesh(wavegeo, wavemat);
    // scene.add(waveplane);

    waveplane.rotation.x = -Math.PI / 2 - 0.2;
    waveplane.position.y = -25;
    waveplane.position.y+=100;
    waveplane.position.z+=340;
    // alert((waveplane.position.y));

    loop();

}



function updateSize() {
    width = window.innerWidth;
    height = window.innerHeight;
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

window.addEventListener('load', init, false);
