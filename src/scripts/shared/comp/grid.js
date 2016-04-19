import moment from "moment";
window.moment = moment;
import Caleido from "./caleido";
import _ from "lodash";

export default class Grid {
  constructor(parent, month) {
    this.parent = parent;
    this.month = month;
    this.ORIGINAL_WIDTH = 1920;
    this.ORIGINAL_HEIGHT = 1080;
    this.TOTAL_DAYS = 15;
    this.days = [];
    this.texts = []
    this.textsContainer = undefined;
    this.mask = undefined;
    this.caleido = undefined;

    this.el = undefined;
    this.buildDays()
    this.render()
    if(moment().month() === this.month) {
      this.addCaleido(false)
    }
  }

  render() {
    this.el = new PIXI.Container()
    this.mask = this.buildMask()
    this.textsContainer = this.buildTexts()
    this.el.addChild(this.textsContainer);
    this.el.addChild(this.mask);
    this.textsContainer.mask = this.mask;
    this.parent.addChild(this.el);
  }

  animate() {
    if(moment().month() === this.month){
      for(var i = 0; i < this.texts.length; i++) {
        this.texts[i].y = this.texts[i]._y2
        TweenMax.to(this.texts[i], 3, {y:this.texts[i]._y, ease:Quart.easeInOut, delay:this.texts[i]._delay * 0.1})
      }

      _.delay(this.showCaleido.bind(this), 2000)
    }
  }

  showCaleido() {
    this.caleido.reset();
    this.caleido.show();
  }

  addCaleido(reset) {
    this.caleido = new Caleido(moment().date(), reset);
    this.textsContainer.addChild(this.caleido.el);
    this.caleido.el.x = this.texts[7].x + (this.texts[7].width / 2)
    this.caleido.el.y = this.texts[7].y + (this.texts[7].height / 2)
  }

  buildTexts() {
    var marginLeft = Math.round(200 * window.innerWidth / this.ORIGINAL_WIDTH);
    var marginBottom = Math.round(200 * window.innerHeight / this.ORIGINAL_HEIGHT);
    var fontSize = Math.round(120 * window.innerWidth / this.ORIGINAL_WIDTH);

    var col = 0;
    var row = 0;

    var container = new PIXI.Container()

    for(var i = 0; i <= this.TOTAL_DAYS; i++) {

      let num = this.days[i];

      if(parseInt(num) < 10) {
        num = `0${num}`
      }

      let text = new PIXI.Text(num,{font : `${fontSize}px HelveticaBold`, fill : 0xFFFFFF});
      text.alpha = 0.06;
      text.x = col * (marginLeft + text.width);
      if(moment().month() === this.month){
        text._y = row * (marginBottom + text.height);
        text._y2 = text._y + (marginBottom * row * 2)
        text._delay = row;
        text.y = text._y
      } else {
        text.y = row * (marginBottom + text.height);
      }

      col++;
      if(col > 4) {
        col = 0;
        row++;
      }

      container.y = window.innerHeight / 2 - container.height / 2
      container.x = window.innerWidth / 2 - container.width / 2
      container.addChild(text);
      this.texts.push(text);
    }

    return container;
  }

  buildDays() {

    var diff = moment().month() - this.month;
    var date = moment().subtract(14 * diff, 'days')

    this.days[7] = date.date()

    for(var i = 6; i > -1; i--) {
      var a = date.clone();
      this.days[i] = a.subtract(7 - i, 'days').date()
    }

    for(var i = 8; i < this.TOTAL_DAYS; i++) {
      var a = date.clone();
      this.days[i] = a.add(i - 7, 'days').date()
    }
  }

  buildMask() {
    var mask = new PIXI.Graphics()
    mask.beginFill(0xFF0000)
    mask.drawRect(0,0,window.innerWidth, window.innerHeight)
    mask.endFill()
    return mask;
  }

  resize() {
    this.texts = [];
    this.el.removeChildren()
    this.textsContainer = this.buildTexts()
    this.el.addChild(this.textsContainer);
    if(this.caleido) {
      this.caleido.resize()
      this.textsContainer.addChild(this.caleido.el);
      this.caleido.el.x = this.texts[7].x + (this.texts[7].width / 2)
      this.caleido.el.y = this.texts[7].y + (this.texts[7].height / 2)
    }
  }
}