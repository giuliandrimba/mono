import tmpl from "templates/views/intro";
import parseHTML from "scripts/shared/lib/parseHTML";
import Logo from "scripts/shared/comp/logo"
import * as layout from "scripts/views/layout";
import ways from "ways";
import _ from "lodash";

var el = undefined;
var logo = undefined;

export function intro(req, done) {
	render();
  done();
  console.log("intro done")
}

export function outro(req, done) {
  console.log("intro outro");
	logo.animationOut(()=>{
    dispose();
    done();
  });
}

function animationin() {
  logo.animationIn()
  _.delay(()=>{ 
    ways.go("/monkey");
  }, 3000)
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

function dispose() {
  el.remove()
}