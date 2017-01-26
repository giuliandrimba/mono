import moment from "moment";
window.moment = moment;
import _ from "lodash";

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
  }

  show() {
    this.theme.show()
    // _.delay(function(){
    //   sounds.playRed();
    // }, 500)
  }

  hide() {
    this.theme.hide()
  }

  reset() {
    this.redCaleido.reset()
    this.goldCaleido.reset()
    this.theme = this.redCaleido;
  }

  resize() {
    this.theme.resize()
  }

  dispose() {
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