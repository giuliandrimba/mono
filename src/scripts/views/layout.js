import tmpl from "templates/views/layout.html";
import _ from "lodash";
import parseHTML from "scripts/shared/lib/parseHTML";
import Plane from "scripts/shared/comp/plane";

var el = undefined;
var plane = undefined;
var SVG = undefined;

export function intro(req, done) {
  render();

  plane = new Plane();
  plane.render(el)
  _.defer(()=> { animationIn(done)}, 0);
}

export function outro(req, done) {
	
}

function animationIn(done) {
  el.classList.add("animation-in")
  plane.animationIn(done);
}

function render() {
  el = parseHTML(tmpl);
  document.getElementById("main").appendChild(el);
}
