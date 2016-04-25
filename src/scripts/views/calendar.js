import tmpl from "templates/views/calendar.html";
import parseHTML from "scripts/shared/lib/parseHTML";
import TweenMax from "gsap";
import * as layout from "scripts/views/layout";
import moment from "moment";
import Grid from "scripts/shared/comp/grid";
import _ from "lodash";
import chineseLunar from "chinese-lunar";

var rendered = false;
var el = undefined;
var date = undefined;
var monthDay = undefined;
var renderer = undefined;
var stage = undefined;
var grid = undefined;
var gridsContainer = undefined;
var numGrids = 12;
var numGrids = 12;
var grids = [];
var rAF = undefined;
var active = false;
var changingTheme = true;
var theme = "gregorian";


export function intro(req, done) {
  active = true;
  if(!rendered) {
    render(); 
  } else {
    init();
  }
  document.getElementById("pages").addEventListener("mousedown", onClick)
  done();
}

export function outro(req, done) {
  layout.lockMenu()
  document.getElementById("pages").removeEventListener("mousedown", onClick)
  animationOut(done)
}

function render() {
  rendered = true;
  el = parseHTML(tmpl);
  document.getElementById("pages").appendChild(el);

  renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, {antialias: true});
  renderer.view.id = "calendar";
  el.appendChild(renderer.view);

  stage = new PIXI.Container();
  gridsContainer = new PIXI.Container;
  date = el.querySelector(".date");
  monthDay = el.querySelector(".month-year");


  for(var i = 0; i < numGrids; i++) {
    let grid = new Grid(gridsContainer, i)
    grid.el.y = window.innerHeight * i;
    grids.push(grid);
  }

  window.addEventListener("resize", resize)

  stage.addChild(gridsContainer);
  init();
}

function onClick() {
  if(changingTheme)
    return

  changingTheme = true;
  for(var i = 0; i < grids.length; i++) {
    grids[i].toggleTheme();
  }
  changeDate();

  _.delay(()=>{
    changingTheme = false;
  }, 3000);
}

function changeDate(){
  date.classList.remove("tween");

  _.delay(()=>{

    if(theme === "gregorian") {
      theme = "chinese";
      var l = chineseLunar.solarToLunar(new Date())
      var year = chineseLunar.format(l, "Y")
      var month = chineseLunar.format(l, "M")

      document.getElementById("weekday").innerText = year;
      document.getElementById("month").innerText = month;
      document.getElementById("year").innerText = "";
    } else {
      theme = "gregorian";

      document.getElementById("weekday").innerText = moment().format("dddd");
      document.getElementById("month").innerText = moment().format("MMMM");
      document.getElementById("year").innerText = moment().format("YYYY");
    }

    date.classList.add("tween");
  }, 500)
}

function init() {
  resize();
  animationIn();
  loop()
}

function resize() {
  date.style.left = 160 * window.innerWidth / 1920;
  monthDay.style.left = 280 * window.innerWidth / 1920;
  renderer.resize(window.innerWidth, window.innerHeight);

  for(var i = 0; i < numGrids; i++) {
    grids[i].resize();
  }
}

function animationIn() {
  gridsContainer.y = window.innerHeight
  let _y = window.innerHeight * moment().month();
  TweenMax.to(gridsContainer, 3, {y:- _y, ease:Quart.easeInOut});

  _.delay(()=>{
    date.classList.add("tween");
    changingTheme = false;
    layout.unlockMenu()
  }, 4000)

  for(var i = 0; i < numGrids; i++) {
    grids[i].animate();
  }
}

function animationOut(done) {
  date.classList.remove("tween");
  for(var i = 0; i < numGrids; i++) {
    grids[i].animateOut();
  }
  TweenMax.to(gridsContainer, 2, {y:-window.innerHeight * numGrids, ease:Expo.easeInOut, delay:1.3, onComplete:()=>{active = false}});
  _.delay(done, 2000);
}

function loop() {
  rAF = window.requestAnimationFrame(loop);
  if(active){
    renderer.render(stage);
  }
}
