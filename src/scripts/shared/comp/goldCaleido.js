import moment from "moment";
import chineseLunar from "chinese-lunar";
import * as calendar from "scripts/models/calendar";
import * as sounds from "scripts/shared/audio";

export default class GoldCaleido {
  constructor(date) {
    var m = moment()
    var l = chineseLunar.solarToLunar(new Date(m.year(), m.month(), m.date()))
    this.date = calendar.season(moment().month())
    this.ORIGINAL_WIDTH = window.innerWidth
    this.el = new PIXI.Container();
    this.firstBorders = [];
    this.secondBorders = [];
    this.thirdBorders = [];
    this.text = undefined;
    this.resize();
    this.build();
  }

  build() {
    this.day = new PIXI.Container();
    this.buildPattern(4)
    this.day.addChild(this.pattern);

    this.el.addChild(this.day);

    this.el.buttonMode = true;
  }

  buildPattern(total) {
    var fontSize = Math.round(80 * window.innerWidth / 1920);
    this.pattern = new PIXI.Container();
    this.text = new PIXI.Text(this.date,{font : `${fontSize}px JingLi`, fill : 0x000000});
    this.text.alpha = 0;
    this.text.x = -this.text.width / 2;
    this.text.y = -this.text.height / 2;
    this.circle = this.buildCircle();

    this.pattern.addChild(this.circle);
    this.buildFirstBorder()
    this.buildSecondBorder()
    this.buildThirdBorder()
    this.circle.scale.x = this.circle.scale.y = 0
    this.pattern.addChild(this.text)

    return this.pattern;
  }

  reset() {
    this.circle.scale.x = this.circle.scale.y = 0
  }

  resize() {
    this.RADIUS = Math.round(108 * window.innerWidth / 1920);
    this.el.scale.x = this.el.scale.y = window.innerWidth / this.ORIGINAL_WIDTH;
  }

  show() {
    TweenMax.to(this.circle.scale, 2,{x:1,y:1, ease:Expo.easeInOut});
    TweenMax.to(this.text, 1,{alpha:1, ease:Expo.easeInOut, delay:0.5});

    for(var f = 0; f < this.firstBorders.length; f++) {
      let border = this.firstBorders[f];
      TweenMax.to(border.circle, 1.7, {x:border.circle._x, y:border.circle._y, ease:Expo.easeInOut, delay:0.5})
    }

    for(var s = 0; s < this.secondBorders.length; s++) {
      let border = this.secondBorders[s];
      TweenMax.to(border.circle, 1.9, {x:border.circle._x, y:border.circle._y, ease:Expo.easeInOut, delay:0.6})
    }

    for(var t = 0; t < this.thirdBorders.length; t++) {
      let border = this.thirdBorders[t];
      TweenMax.to(border.circle, 2.3, {x:border.circle._x, y:border.circle._y, ease:Expo.easeInOut, delay:0.65})
    }

    _.delay(function(){
      sounds.playRed();
    }, 500)
  }

  hide() {
  
    for(var t = 0; t < this.thirdBorders.length; t++) {
      let border = this.thirdBorders[t];
      TweenMax.to(border.circle, 1, {x:border.circle._x2, y:border.circle._y2, ease:Expo.easeInOut})
    }

    for(var s = 0; s < this.secondBorders.length; s++) {
      let border = this.secondBorders[s];
      TweenMax.to(border.circle, 0.9, {x:border.circle._x2, y:border.circle._y2, ease:Expo.easeInOut, delay:0.2})
    }

    for(var f = 0; f < this.firstBorders.length; f++) {
      let border = this.firstBorders[f];
      TweenMax.to(border.circle, 0.7, {x:border.circle._x2, y:border.circle._y2, ease:Expo.easeInOut, delay:0.3})
    }

    TweenMax.to(this.circle.scale, 1,{x:0,y:0, ease:Expo.easeInOut, delay:0.4});
    TweenMax.to(this.text, 0.5,{alpha:0, ease:Expo.easeInOut, delay:0.5});
  }

  buildCircle() {
    var c = new PIXI.Container();
    var g = new PIXI.Graphics();
    var i = new Image();
    var t = undefined;
    var s = undefined;


    g.beginFill(0xFF0000)
    g.drawCircle(0,0,this.RADIUS);
    g.endFill()

    var loader = new PIXI.loaders.Loader();
    loader.add('gold','images/gold-texture.jpg');
    loader.once('complete',function(loader, resource) {
      s = new PIXI.Sprite(resource.gold.texture);
      s.mask = g;
      s.x = -400
      s.y = -142
      c.addChild(s)
    });
    loader.load();

    c.addChild(g)

    c.circle = g;
    return c;
  }

  buildBorder(width, height, position) {
    var _width = Math.round(width * window.innerWidth / 1920);
    var _height = Math.round(height * window.innerWidth / 1920);
    var b1 = new PIXI.Container();
    var b1mask = this.buildMask(_width,_height);
    var b1circle = this.buildCircle()
    b1.circle = b1circle;
    b1.addChild(b1mask);
    b1.addChild(b1circle);
    b1circle.mask = b1mask;

    b1mask.x = -(_width/2)
    b1mask.y = -(_height)

    b1circle.y = b1circle._y2 = (b1circle.height) + 2 -(_height)
    b1circle.x = b1circle._x2 = (b1circle.width / 2) -(_width/2)

    b1circle._y = (b1circle.height / 2)-(_height)
    b1circle._x = (b1circle.width / 2)-(_width/2)

    b1._width = _width
    b1._height = _height

    return b1;
  }

  buildMask(width, height) {
    var mask = new PIXI.Graphics()
    mask.beginFill(0xFF0000)
    mask.drawRect(0,0,width, height)
    return mask;
  }

   buildFirstBorder() {

    var angle = 0;
    var step = 360 / 8;

    for(var i = 0; i < 8; i++) {
      var b1 = this.buildBorder(216, 108);
      var rad = angle * Math.PI / 180

      b1.x = Math.cos(rad) * (this.RADIUS + 4);
      b1.y = Math.sin(rad) * (this.RADIUS + 4);
      b1.rotation = rad + (Math.PI / 2);
      angle += step;
      this.pattern.addChild(b1);
      this.firstBorders.push(b1);
    }
  }

  buildSecondBorder() {
    var angle = 0;
    var step = 360 / 8;
    var radius = Math.round(113 * window.innerWidth / 1920);

    for(var i = 0; i < 8; i++) {
      var b1 = this.buildBorder(216, 76);
      var rad = angle * Math.PI / 180

      b1.x = Math.cos(rad) * (this.RADIUS + radius + 4);
      b1.y = Math.sin(rad) * (this.RADIUS + radius + 4);
      b1.rotation = rad + (Math.PI / 2);
      angle += step;
      this.pattern.addChild(b1);
      this.secondBorders.push(b1);
    }
  }

  buildThirdBorder() {

    var angle = 0;
    var step = 360 / 8;
    var radius = Math.round(192 * window.innerWidth / 1920);

    for(var i = 0; i < 8; i++) {
      var b1 = this.buildBorder(216, 38);
      var rad = angle * Math.PI / 180

      b1.x = Math.cos(rad) * (this.RADIUS + radius + 10);
      b1.y = Math.sin(rad) * (this.RADIUS + radius + 10);
      b1.rotation = rad + (Math.PI / 2);
      angle += step;
      this.pattern.addChild(b1);
      this.thirdBorders.push(b1);
    }
  }
}