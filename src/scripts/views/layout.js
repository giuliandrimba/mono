import tmpl from "templates/views/layout.html";
import _ from "lodash";
import parseHTML from "scripts/shared/lib/parseHTML";
import Plane from "scripts/shared/comp/plane";
import Menu from "scripts/shared/comp/menu";

var el = undefined;
var plane = undefined;
var SVG = undefined;
var menu = undefined;

export function intro(req, done) {
  render();

  plane = new Plane();
  plane.render(el)

  menu = new Menu()
  _.defer(animationIn.bind(this, done), 0);
}

export function outro(req, done) {
	done();
}


function animationIn(done) {
  el.classList.add("animation-in")
  plane.animationIn(done);
}

function render() {
  el = parseHTML(tmpl);
  document.getElementById("main").appendChild(el);
}

export function showMenu() {
  menu.render(el);
  menu.animationIn();
}

export var plane = plane;
export var menu = menu;
