export default class RedCaleido {
  constructor(date) {
    this.date = date;
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
  }

  buildPattern(total) {
    var fontSize = Math.round(120 * window.innerWidth / 1920);
    this.pattern = new PIXI.Container();
    this.text = new PIXI.Text(this.date,{font : `${fontSize}px HelveticaBold`, fill : 0x000000});
    this.text.alpha = 0;
    this.text.x = -this.text.width / 2;
    this.text.y = -this.text.width / 2;
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
    this.RADIUS = Math.round(109 * window.innerWidth / 1920);
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
    var g = new PIXI.Graphics();
    g.beginFill(0xFF0000)
    g.drawCircle(0,0,this.RADIUS);
    g.endFill()

    return g;
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

    if(position === "top") {
      b1circle.y = b1circle._y2 = (b1circle.height) + 2;
      b1circle.x = b1circle._x2 = (b1circle.width / 2);

      b1circle._y = (b1circle.height / 2);
      b1circle._x = (b1circle.width / 2);
    }

    if(position === "right") {
      b1circle.y = b1circle._y2 = (b1circle.height / 2);
      b1circle.x = b1circle._x2 = (-b1circle.width / 2) - 2;

      b1circle._y = (b1circle.height / 2);
      b1circle._x = (-b1circle.width / 2) + _width;
    }

    if(position === "bottom") {
      b1circle.y = b1circle._y2 = (-b1circle.width / 2) - 2
      b1circle.x = b1circle._x2 = (b1circle.width / 2);

      b1circle._y = (-b1circle.width / 2) + _height
      b1circle._x = (b1circle.width / 2);
    }

    if(position === "left") {
      b1circle.y = b1circle._y2 = (b1circle.height / 2) + 2;
      b1circle.x = b1circle._x2 = (b1circle.width);

      b1circle._y = (b1circle.height / 2);
      b1circle._x = (b1circle.width / 2);
    }

    if(position === "top-right") {
      b1circle.y = b1circle._y2 = (b1circle.height) + 2;
      b1circle.x = b1circle._x2 = (-b1circle.width / 2) - 2;

      b1circle._y = (b1circle.height / 2);
      b1circle._x = (-b1circle.width / 2) + _width;
    }

    if(position === "bottom-right") {
      b1circle.y = b1circle._y2 = (-b1circle.height / 2) - 2;
      b1circle.x = b1circle._x2 = (-b1circle.width / 2) - 2;

      b1circle._y = (-b1circle.height / 2) + _height;
      b1circle._x = (-b1circle.width / 2) + _width;
    }

    if(position === "bottom-left") {
      b1circle.y = b1circle._y2 = (-b1circle.height / 2) - 2;
      b1circle.x = b1circle._x2 =(b1circle.width) + 2;

      b1circle._y = (-b1circle.height / 2) + _height;
      b1circle._x = (b1circle.width / 2);
    }

    if(position === "top-left") {
      b1circle.y = b1circle._y2 = (b1circle.height) + 2;
      b1circle.x = b1circle._x2 = (b1circle.width) + 2;

      b1circle._y = (b1circle.height / 2);
      b1circle._x = (b1circle.width / 2);
    }

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

   buildFirstBorder(width, height) {
    var b1 = this.buildBorder(218, 109, "top");
    b1.x = (- this.circle.width / 2);
    b1.y = (-this.circle.height) - 2
    this.pattern.addChild(b1);
    this.firstBorders.push(b1);

    var b2 = this.buildBorder(109, 218,"right");
    b2.x = (this.circle.width / 2) + 2;
    b2.y = (-this.circle.height / 2);
    this.pattern.addChild(b2);
    this.firstBorders.push(b2);

    var b3 = this.buildBorder(218, 109,"bottom");
    b3.x = (-this.circle.width / 2);
    b3.y = (this.circle.height / 2) + 2;
    this.pattern.addChild(b3);
    this.firstBorders.push(b3);

    var b4 = this.buildBorder(109, 218,"left");
    b4.x = (-this.circle.width) - 2;
    b4.y = (-this.circle.height / 2);
    this.pattern.addChild(b4);
    this.firstBorders.push(b4);
  }

  buildSecondBorder() {
    var b1 = this.buildBorder(218, 86, "top");
    b1.x = (-this.circle.width / 2);
    b1.y = (-this.circle.height) - b1._height - 5
    this.pattern.addChild(b1);
    this.secondBorders.push(b1);

    var b2 = this.buildBorder(109, 109, "top-right");
    b2.x = (this.circle.width / 2) + 2;
    b2.y = (-this.circle.height) - 2
    this.pattern.addChild(b2);
    this.secondBorders.push(b2);

    var b3 = this.buildBorder(86, 218, "right");
    b3.x = (this.circle.width) + 5
    b3.y = (-this.circle.height / 2)
    this.pattern.addChild(b3);
    this.secondBorders.push(b3);

    var b4 = this.buildBorder(109, 109, "bottom-right");
    b4.x = (this.circle.width / 2) + 2;
    b4.y = (this.circle.height / 2) + 2
    this.pattern.addChild(b4);
    this.secondBorders.push(b4);

    var b5 = this.buildBorder(218, 86, "bottom");
    b5.x = (- this.circle.width / 2);
    b5.y = (this.circle.height) + 5
    this.pattern.addChild(b5);
    this.secondBorders.push(b5);

    var b6 = this.buildBorder(109, 109, "bottom-left");
    b6.x = -(this.circle.width) - 2;
    b6.y = (this.circle.height / 2) + 2
    this.pattern.addChild(b6);
    this.secondBorders.push(b6);

    var b7 = this.buildBorder(86, 218, "left");
    b7.x = -(this.circle.width) - b7._width - 5;
    b7.y = (-this.circle.height / 2)
    this.pattern.addChild(b7);
    this.secondBorders.push(b7);

    var b8 = this.buildBorder(109, 109, "top-left");
    b8.x = (-this.circle.width / 2) - b8._width - 2
    b8.y = (-this.circle.height) - 2 
    this.pattern.addChild(b8);
    this.secondBorders.push(b8);
  }

  buildThirdBorder() {

    var b1 = this.buildBorder(218, 43, "top");
    b1.x = (- this.circle.width / 2);
    b1.y = (-this.circle.height) - this.secondBorders[0]._height - b1._height - 11
    this.pattern.addChild(b1);
    this.thirdBorders.push(b1);

    var b2 = this.buildBorder(109, 86, "top-right");
    b2.x = (this.circle.width / 2) + 2
    b2.y = (-this.circle.height) - this.secondBorders[0]._height - 5
    this.pattern.addChild(b2);
    this.thirdBorders.push(b2);

    var b3 = this.buildBorder(86, 109, "top-right");
    b3.x = (this.circle.width / 2) + this.secondBorders[1]._width + 5
    b3.y = (-this.circle.height) - 2
    this.pattern.addChild(b3);
    this.thirdBorders.push(b3);

    var b4 = this.buildBorder(43, 218, "right");
    b4.x = (this.circle.width) + this.secondBorders[2]._width + 11
    b4.y = (-this.circle.height / 2)
    this.pattern.addChild(b4);
    this.thirdBorders.push(b4);

    var b5 = this.buildBorder(86, 109, "bottom-right");
    b5.x = (this.circle.width) + 5
    b5.y = (this.circle.height / 2) + 2
    this.pattern.addChild(b5);
    this.thirdBorders.push(b5);

    var b6 = this.buildBorder(109, 86, "bottom-right");
    b6.x = (this.circle.width / 2) + 2
    b6.y = (this.circle.height) + 5
    this.pattern.addChild(b6);
    this.thirdBorders.push(b6);

    var b7 = this.buildBorder(218, 43, "bottom");
    b7.x = (- this.circle.width / 2);
    b7.y = (this.circle.height) + this.secondBorders[0]._height + 11
    this.pattern.addChild(b7);
    this.thirdBorders.push(b7);

    var b8 = this.buildBorder(109, 86, "bottom-left");
    b8.x = (-this.circle.width) - 2
    b8.y = (this.circle.height) + 5
    this.pattern.addChild(b8);
    this.thirdBorders.push(b8);

    var b9 = this.buildBorder(86, 109, "bottom-left");
    b9.x = -(this.circle.width) - b9._width - 5
    b9.y = (this.circle.height / 2) + 2
    this.pattern.addChild(b9);
    this.thirdBorders.push(b9);

    var b10 = this.buildBorder(43, 218, "left");
    b10.x = -(this.circle.width) - this.secondBorders[2]._width - b10._width - 11
    b10.y = (-this.circle.height / 2)
    this.pattern.addChild(b10);
    this.thirdBorders.push(b10);

    var b11 = this.buildBorder(86, 109, "top-left");
    b11.x = -(this.circle.width) - b11._width - 5
    b11.y = (-this.circle.height) - 2
    this.pattern.addChild(b11);
    this.thirdBorders.push(b11);

    var b12 = this.buildBorder(109, 86, "top-left");
    b12.x = -(this.circle.width) - 2
    b12.y = (-this.circle.height) - this.secondBorders[0]._height - 5
    this.pattern.addChild(b12);
    this.thirdBorders.push(b12);
  }
}