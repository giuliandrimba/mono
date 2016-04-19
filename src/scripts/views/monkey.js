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
var showTitleTimeout = undefined;

export function intro(req, done) {
  render();
  done()
}

export function outro(req, done) {
  layout.plane.hide(true)
  head.animationOut(done)
  hideTitle()
}

function animationIn() {
  head.animationIn();
  head.disableDrag()
  _.delay(layout.showMenu, 1000);
  showTitleTimeout = _.delay(showTitle, 4000);
}

function events() {
  window.addEventListener("resize", resize);
  head.on("drag:start", onDragStart)
  head.on("drag", onDrag)
  head.on("drag:end", onDragEnd)
  head.on("explode:start", onExplodeStart)
  head.on("explode:end", onExplodeEnd)
}

function onDrag(percentage) {
  layout.plane.showProgress(percentage);
  layout.menu.showProgress(percentage);
}

function onDragStart() {
  hideTitle()
}

function onDragEnd() {
  showTitle()
  layout.plane.showProgress(0);
}

function onExplodeStart() {
  hideTitle()
  head.disableDrag()
  layout.menu.lock()
  layout.plane.hide()
}

function onExplodeEnd() {
  dot.implode()
}

function onImplodeEnd() {
  layout.plane.show()
  _.delay(showBackground, 1750);
}

function showBackground() {
  dot.hide()
  background.show(()=> { onBackgroundShow() })
}

function onBackgroundShow() {
  head.animationIn(()=>{
    layout.menu.showProgress(0);
    head.enableDrag()
  })
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

function showTitle() {
  title.classList.add("show");
  head.enableDrag()
}

function hideTitle() {
  window.clearTimeout(showTitleTimeout);
  title.classList.remove("show");
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