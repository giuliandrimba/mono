import tmpl from "templates/views/layout";
import _ from "lodash";
import parseHTML from "scripts/shared/lib/parseHTML";
import Plane from "scripts/shared/comp/plane";
import Snap from "snapsvg";

var el = undefined;
var plane = undefined;
var SVG = undefined;

export function intro(req, done) {
  render();

  plane = new Plane(SVG);
  plane.render()
  _.defer(()=> { animationIn(done)}, 0);
}

export function outro(req, done) {
	
}

function animationIn(done) {
  el.classList.add("animation-in")
  plane.animationIn(done);
}

function render() {
  el = parseHTML(tmpl());
  document.getElementById("main").appendChild(el);

  SVG = new Snap("#svg");
  SVG.node.style.width = window.innerWidth;
  SVG.node.style.height = window.innerHeight;
}

export var SVG = SVG;
