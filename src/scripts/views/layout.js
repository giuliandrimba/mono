import tmpl from "templates/views/layout";
import _ from "lodash";

var el = undefined;

export function intro(req, done) {
  render();
  _.defer(animationIn, 0);
}

export function outro(req, done) {
	
}

function animationIn() {
  el.classList.add("animation-in")
}

function render() {
  document.getElementById("main").innerHTML = tmpl();
  el = document.getElementById("layout");
}
