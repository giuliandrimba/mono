import tmpl from "templates/views/layout";
import _ from "lodash";
import parseHTML from "scripts/shared/lib/parseHTML";
import Plane from "scripts/shared/comp/plane";

var el = undefined;
var plane = undefined;

export function intro(req, done) {
  render();

  plane = new Plane;
  plane.render(el)

  _.defer(animationIn, 0);
}

export function outro(req, done) {
	
}

function animationIn() {
  el.classList.add("animation-in")
}

function render() {
  el = parseHTML(tmpl());
  document.getElementById("main").appendChild(el);
}
