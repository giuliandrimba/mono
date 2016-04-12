import tmpl from "templates/views/monkey.html";
import parseHTML from "scripts/shared/lib/parseHTML";
import OBJLoader from "three-obj-loader";
import Head from "scripts/shared/comp/head";
import Dot from "scripts/shared/comp/dot";
import Background from "scripts/shared/comp/background";
import * as layout from "scripts/views/layout";
import _ from "lodash";

var el = undefined;
var scene = undefined;
var camera = undefined;
var renderer = undefined;
var head = undefined;
var dot = undefined;
var background = undefined;
var background = undefined;
var title = undefined;

export function intro(req, done) {
  render();
  done()
}

export function outro(req, done) {
  done()
}

function animationIn() {
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
  layout.plane.showProgress(0);
}

function onExplodeStart() {
  title.classList.remove("show");
  head.disableDrag()
  layout.menu.lock()
  layout.plane.hide()
  layout.plane.showProgress(0);
}

function onExplodeEnd() {
  dot.implode()
}

function onImplodeEnd() {
  // title.classList.add("show");
  // background.show(()=>{
    // head.implode()
  // })
  // layout.plane.show()
}

function render() {

  el = parseHTML(tmpl);
  document.getElementById("pages").appendChild(el);

  title = document.querySelector(".title");

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  renderer = new THREE.WebGLRenderer({alpha: true, antialias : true, transparent: false})

  camera.position.set(0, 0, 4)

  head = new Head(scene, camera, renderer);
  background = new Background(scene, camera, renderer);

  _.defer(()=>{
    dot = new Dot(scene, camera, renderer);
    dot.on("implode:end", onImplodeEnd)
  }, 0);

  el.appendChild(renderer.domElement);

  animationIn();
  resize()
  events()
  loop()
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
  if(dot) dot.update()
  camera.lookAt( scene.position )
  renderer.render(scene, camera);
}