import tmpl from "templates/views/layout.html";
import _ from "lodash";
import parseHTML from "scripts/shared/lib/parseHTML";
import Plane from "scripts/shared/comp/plane";
import Menu from "scripts/shared/comp/menu";
import WebFont from 'webfontloader';

var el = undefined;
var plane = undefined;
var SVG = undefined;
var menu = undefined;
var introDone = undefined;
var background = undefined;

export function intro(req, done) {
  introDone = done;
  WebFont.load({
    custom: {
      families:['HelveticaBold','JingLi'],
      urls: ['/app.css']
    },
    active:loaded
  })

  render();
  TweenMax.to(background, .5, {y:-(window.innerHeight / 2), ease:Expo.easeOut})
}

function loaded() {
  TweenMax.to(background, .5, {y:0, ease:Expo.easeOut})
  plane = new Plane();
  plane.render(el)

  menu = new Menu()
  _.defer(animationIn.bind(this, introDone), 0);
}

export function outro(req, done) {
	done();
}


function animationIn(done) {
  plane.animationIn(done);
}

function render() {
  el = parseHTML(tmpl);
  document.getElementById("main").appendChild(el);
  background = document.querySelector(".background")
}

export function showMenu() {
  menu.render(el);
  menu.animationIn();
}

export function lockMenu() {
  menu.lock()
}

export function unlockMenu() {
  menu.unlock()
}

export var plane = plane;
export var menu = menu;
