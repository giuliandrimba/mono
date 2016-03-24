import tmpl from "templates/views/intro";
import parseHTML from "scripts/shared/lib/parseHTML";
import Logo from "scripts/shared/comp/logo"
import * as layout from "scripts/views/layout";

var el = undefined;
var logo = undefined;

export function intro(req, done) {
	render();
}

export function outro(req, done) {
	
}

function animationin() {
  logo.animationIn()
}

function render() {
  el = parseHTML(tmpl);
  document.getElementById("pages").appendChild(el);

  logo = new Logo(layout.SVG)
  logo.render(el);

  animationin();
}

function resize() {

}