import tmpl from "templates/views/monkey.html";
import parseHTML from "scripts/shared/lib/parseHTML";
import OBJLoader from "three-obj-loader";
import Head from "scripts/shared/comp/head";

var el = undefined;
var scene = undefined;
var camera = undefined;
var renderer = undefined;
var head = undefined;

export function intro(req, done) {
  render();
  done()
}

export function outro(req, done) {
  done()
}

function animationin() {
  head.animationIn();
}

function events() {
  window.addEventListener("resize", resize);
}

function render() {
  el = parseHTML(tmpl);
  document.getElementById("pages").appendChild(el);

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  renderer = new THREE.WebGLRenderer({alpha: true, antialias : false, transparent: false})

  camera.position.set(0, 0, 4)
  scene.fog = new THREE.Fog(0x222222, 20, -20);

  addLights();

  head = new Head(scene, camera, renderer);

  el.appendChild(renderer.domElement);

  animationin();
  resize()
  events()
  loop()
}

function addLights() {
  var lights = [];
  lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
  lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
  lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );

  lights[1].position.set( 100, 200, 100 );
  lights[2].position.set( -100, -200, -100 );

  scene.add( lights[0] );
  scene.add( lights[1] );
  scene.add( lights[2] );
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  head.resize();
  renderer.setSize(window.innerWidth,  window.innerHeight);
}

function loop() {
  requestAnimationFrame( loop );
  head.update()
  camera.lookAt( scene.position )
  renderer.render(scene, camera);
}