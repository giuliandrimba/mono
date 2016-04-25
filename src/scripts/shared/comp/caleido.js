import moment from "moment";
window.moment = moment;

import RedCaleido from "scripts/shared/comp/redCaleido";
import GoldCaleido from "scripts/shared/comp/goldCaleido";

export default class Caleido {
  constructor() {
    this.el = new PIXI.Container();
    this.redCaleido = new RedCaleido(moment().date())
    this.goldCaleido = new GoldCaleido(moment().date())
    this.theme = this.redCaleido;
    this.el.addChild(this.redCaleido.el);
    this.el.addChild(this.goldCaleido.el);

    Caleido.scope = this;

    document.body.addEventListener("mousedown", this.onClick)
  }

  onClick() {
    Caleido.scope.toggleTheme()
  }

  show() {
    this.theme.show()
  }

  hide() {
    this.theme.hide()
  }

  reset() {
    this.theme.reset()
  }

  resize() {
    this.theme.resize()
  }

  dispose() {
    document.body.removeEventListener("mousedown", this.onClick)
  }

  toggleTheme(){
    this.theme.hide()
    if(this.theme === this.redCaleido)
      this.theme = this.goldCaleido
    else
      this.theme = this.redCaleido

    this.theme.show()
  }
}