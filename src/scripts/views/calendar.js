import tmpl from "templates/views/monkey.html";
import parseHTML from "scripts/shared/lib/parseHTML";
import TweenMax from "gsap";
import moment from "moment";
import Grid from "scripts/shared/comp/grid";
import _ from "lodash";

var el = undefined;
var renderer = undefined;
var stage = undefined;
var grid = undefined;
var gridsContainer = undefined;
var numGrids = 12;
var numGrids = 12;
var grids = [];


export function intro(req, done) {
	render();
  done();
}

export function outro(req, done) {
  done();
}

function render() {
  el = parseHTML(tmpl);
  document.getElementById("pages").appendChild(el);

  renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, {antialias: true});
  renderer.view.id = "calendar";
  el.appendChild(renderer.view);

  stage = new PIXI.Container();
  gridsContainer = new PIXI.Container;

  for(var i = 0; i < numGrids; i++) {
    let grid = new Grid(gridsContainer, i)
    grid.el.y = window.innerHeight * i;
    grids.push(grid);
  }

  window.addEventListener("resize", resize)

  stage.addChild(gridsContainer);

  resize();
  animationIn();
  loop()
}

function resize() {
  renderer.resize(window.innerWidth, window.innerHeight);

  for(var i = 0; i < numGrids; i++) {
    grids[i].resize();
  }
}

function animationIn() {
  gridsContainer.y = window.innerHeight
  let _y = window.innerHeight * moment().month();
  TweenMax.to(gridsContainer, 3, {y:- _y, ease:Quart.easeInOut});
  for(var i = 0; i < numGrids; i++) {
    grids[i].animate();
  }
}

function loop() {
  window.requestAnimationFrame(loop);

  renderer.render(stage);
}
