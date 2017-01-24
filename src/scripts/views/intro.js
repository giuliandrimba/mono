import tmpl from "templates/views/intro";
import parseHTML from "scripts/shared/lib/parseHTML";
import Logo from "scripts/shared/comp/logo"
import * as layout from "scripts/views/layout";
import ways from "ways";
import _ from "lodash";

var el = undefined;
var logo = undefined;
var title = undefined;

export function intro(req, done) {
	render();
  done();
}

export function outro(req, done) {
  title.classList.remove("show");
  logo.animationOut(()=>{
    dispose();
    done();
  });
}

function animationin() {
  logo.animationIn()

  _.delay(()=> {
    title.classList.add("show")
    layout.audio.startLoop()
  }, 1000)

  _.delay(()=>{ 
    ways.go("/monkey");
  }, 4500)
}

function render() {
  el = parseHTML(tmpl);
  document.getElementById("pages").appendChild(el);

  logo = new Logo(layout.SVG)
  logo.render(el);
  
  title = document.querySelector(".title");

  animationin();
}

function resize() {

}

function dispose() {
  el.remove()
}