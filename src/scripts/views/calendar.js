import TweenMax from "gsap";
import moment from "moment";
import Grid from "scripts/shared/comp/grid";
import _ from "lodash";

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
  renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, {antialias: true});
  renderer.view.id = "calendar";
  document.getElementById("pages").appendChild(renderer.view);

  stage = new PIXI.Container();
  gridsContainer = new PIXI.Container;

  for(var i = 0; i < numGrids; i++) {
    let grid = new Grid(gridsContainer, i)
    grid.el.y = window.innerHeight * i;
    grids.push(grid);
  }

  document.body.addEventListener("mousedown", animationIn)
  window.addEventListener("resize", resize)

  stage.addChild(gridsContainer);

  animationIn();
  resize();
  loop()
}

function resize() {
  renderer.resize(window.innerWidth, window.innerHeight);

  for(var i = 0; i < numGrids; i++) {
    grids[i].resize();
  }
}

function animationIn() {
  gridsContainer.y = 0;
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
