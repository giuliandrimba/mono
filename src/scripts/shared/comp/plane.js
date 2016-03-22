import tmpl from "templates/comp/plane";
import parseHTML from "scripts/shared/lib/parseHTML";

export default class Plane {
  intro() {
    this.el = undefined;
  }

  outro() {

  }

  render(parent) {
    this.el = parseHTML(tmpl);
    parent.appendChild(this.el);
  }
}