import tmpl from "templates/views/monkey.html";
import parseHTML from "scripts/shared/lib/parseHTML";
import OBJLoader from "three-obj-loader";
import Head from "scripts/shared/comp/head";
import Dot from "scripts/shared/comp/dot";
import * as layout from "scripts/views/layout";
import _ from "lodash";

var el = undefined;
var scene = undefined;
var camera = undefined;
var renderer = undefined;
var head = undefined;
var dot = undefined;
var title = undefined;

export function intro(req, done) {
  render();
  done()
}

export function outro(req, done) {
  done()
}

function animationin() {
  // dot.implode()
  head.animationIn();
  _.delay(layout.showMenu, 1000)
  _.delay(()=> {
    title.classList.add("show");
  }, 4000)
}

function events() {
  window.addEventListener("resize", resize);
  head.on("drag", onDrag)
  head.on("drag:start", onDragStart)
  head.on("drag:end", onDragEnd)
  head.on("explode:start", onExplodeStart)
  head.on("explode:end", onExplodeEnd)
}

function onDrag(percentage) {
  layout.plane.showProgress(percentage);
  layout.menu.showProgress(percentage);
}

function onDragStart() {
  title.classList.remove("show");
}

function onDragEnd() {
  title.classList.add("show");
}

function onExplodeStart() {
  layout.plane.hide()
}

function onExplodeEnd() {
  title.classList.add("show");
  layout.plane.show()
  dot.implode()
  // layout.menu.showProgress(0);
}

function render() {

  el = parseHTML(tmpl);
  document.getElementById("pages").appendChild(el);

  title = document.querySelector(".title");

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  renderer = new THREE.WebGLRenderer({alpha: true, antialias : true, transparent: false})

  camera.position.set(0, 0, 4)
  scene.fog = new THREE.Fog(0x222222, 20, -20);

  addLights();

  dot = new Dot(scene, camera, renderer);
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
  dot.update()
  camera.lookAt( scene.position )
  renderer.render(scene, camera);
}