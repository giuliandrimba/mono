import tmpl from "templates/views/monkey.html";
import parseHTML from "scripts/shared/lib/parseHTML";

var el = undefined;

export function intro(req, done) {
  render();
  done()
}

export function outro(req, done) {
  done()
}

function animationin() {
}

function render() {
  el = parseHTML(tmpl);
  document.getElementById("pages").appendChild(el);

  animationin();
}

function resize() {

}