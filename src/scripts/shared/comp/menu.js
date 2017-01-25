import svgPath from "scripts/shared/lib/svgPath";
import Ease from "d3-ease";
import Vivus from "vivus";
import Snap from "snapsvg";
import Segment from "segment-js";
import _ from "lodash";
import ways from "ways";
import * as sounds from "scripts/shared/audio";

export default class Menu {
  constructor() {
    this.el = undefined;
    this.SVG = undefined;
    this.SIZE = 122;
    this.vivus = undefined;
    this.borderPath = undefined;
    this.locked = false;
    this.bigCircleDelay = undefined;
    this.smallCircleDelay = undefined;
    this.overState = false;
    this.animating = false;
    this.calendarState = false;
    this.enableClick = false;
  }

  render(parent) {
    this.el = document.createElement("div");
    this.el.id = "menu-area"
    this.SVG = new Snap(this.SIZE, this.SIZE);
    this.SVG.node.id = "menu";
    this.SVG.node.setAttribute("viewBox",`0 0 ${this.SIZE} ${this.SIZE}`);

    this.borderPath = this._createBorderPath();
    this.segmentBorderPath = new Segment(this.borderPath.node);
    
    this.innerPath = this._createInnerPath();
    this.segmentInnerPath = new Segment(this.innerPath.node);

    this.overPath = this._createOverPath();
    this.segmentOverPath = new Segment(this.overPath.node);

    this.smallCircle = this._createSmallCircle();
    this.smallCircleRed = this._createSmallCircleRed();
    this.bigCircle = this._createBigCircle();

    this.el.appendChild(this.SVG.node)
    parent.appendChild(this.el);
    this.events();
    this.resize();
  }

  events() {
    this.el.addEventListener("mouseover", this.onMouseOver.bind(this))
    this.el.addEventListener("mouseout", this.onMouseOut.bind(this))
    this.el.addEventListener("mousedown", this.onMouseDown.bind(this))
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    let proportion = window.innerWidth / 1920

    if(proportion < 0.5) {
      proportion = 0.5
    }

    this.el.style.left = Math.round(160 * proportion);
    this.el.style.width = Math.ceil(117 * proportion)
    this.el.style.height = Math.ceil(117 * proportion)

    var _w = Math.ceil(122 * proportion)

    if(this.SVG) {
      this.SVG.node.setAttribute("width",`${_w}px`)
      this.SVG.node.setAttribute("height",`${_w}px`)
    }
  }

  showProgress(progress) {

    if(this.overState)
      return

    let pos = progress * (this.SIZE + 13);

    if(progress === 0) {
      this.locked = false;
    } else {
      this.locked = true;
    }

    this.smallCircle.stop();
    this.smallCircle.animate({cy: 30 + pos}, 200, Ease.easeExpOut)

    if(progress > 0.8) {
      this.smallCircleRed.stop();
      this.smallCircleRed.animate({cy: -41 + pos}, 500, Ease.easeExpOut)
    } else {
      this.smallCircleRed.stop();
      this.smallCircleRed.animate({cy: -41}, 500, Ease.easeExpOut)
    }
  }

  enableCalendarState() {
    this.onMouseOver()
    this.calendarState = true;

    this.borderPath.attr({stroke:"#85734c"})
    this.innerPath.attr({stroke:"#85734c"})
    this.overPath.attr({stroke:"#85734c"})
  }

  disableCalendarState() {
    this.calendarState = false;
    this.borderPath.attr({stroke:"#333333"})
    this.innerPath.attr({stroke:"#333333"})
    this.overPath.attr({stroke:"#333333"})
    this.onMouseOut()
  }

  onMouseDown() {
    console.log(this.enableClick);
    if(this.animating || this.locked || !this.enableClick)
      return
    if(!this.calendarState) {
      this.enableCalendarState()
      ways.go("/calendar");
      // sounds.playRed()
    } else {
      this.disableCalendarState()
      ways.go("/monkey");
    }
  }

  onMouseOver() {
    if(this.locked || this.animating || this.calendarState)
      return;

    this.overState = true;

    TweenMax.to(this.innerPath.node, 0.25, {strokeDasharray: this.segmentInnerPath.strokeDasharray("0%", "0%"), ease:Expo.easeOut });
    TweenMax.to(this.overPath.node, 0.25, {strokeDasharray: this.segmentOverPath.strokeDasharray("0%", "100%"), ease:Expo.easeOut });
    
    window.clearTimeout(this.smallCircleDelay);
    this.smallCircle.stop();
    this.smallCircle.animate({cy:this.SIZE + 13}, 250, Ease.easeExpOut)

    window.clearTimeout(this.bigCircleDelay);
    this.bigCircleDelay = _.delay(()=>{
      this.bigCircle.stop();
      this.bigCircle.animate({cy:this.SIZE / 2}, 500, Ease.easeExpOut)
    }, 100)
  }

  lock() {
    this.enableClick = false;
  }

  unlock() {
    this.enableClick = true;
  }

  onMouseOut() {
    if(this.locked || this.animating || this.calendarState)
      return;

    this.overState = false;

    TweenMax.to(this.overPath.node, 0.5, {strokeDasharray: this.segmentOverPath.strokeDasharray("0%", "0%"), ease:Expo.easeOut });
    TweenMax.to(this.innerPath.node, 0.5, {strokeDasharray: this.segmentInnerPath.strokeDasharray("0%", "100%"), ease:Expo.easeOut });
    window.clearTimeout(this.bigCircleDelay);
    this.bigCircle.stop();
    this.bigCircle.animate({cy:-26}, 350, Ease.easeExpOut)

    window.clearTimeout(this.smallCircleDelay);
    this.smallCircleDelay = _.delay(()=>{
      this.smallCircle.stop();
      this.smallCircle.animate({cy:30}, 500, Ease.easeExpOut)
    }, 100)
  }

  beforeAnimationIn() {
    this.animating = true;
    TweenMax.set(this.borderPath.node, { css:{strokeDasharray: this.segmentBorderPath.strokeDasharray(0, 0) } });
    TweenMax.set(this.innerPath.node, { css:{strokeDasharray: this.segmentInnerPath.strokeDasharray(0, 0) } });
    TweenMax.set(this.overPath.node, { css:{strokeDasharray: this.segmentOverPath.strokeDasharray(0, 0) } });
  }

  animationIn() {
    this.beforeAnimationIn();

    TweenMax.to(this.borderPath.node, 0.75, {strokeDasharray: this.segmentBorderPath.strokeDasharray("0%", "100%"), delay:0.25, ease:Expo.easeIn });
    TweenMax.to(this.innerPath.node, 1.3, {strokeDasharray: this.segmentInnerPath.strokeDasharray("0%", "100%"), delay:1, ease:Expo.easeOut });

    _.delay(()=>{
      this.smallCircle.animate({cy:34}, 750, Ease.easeExpOut)
      TweenMax.to(this.smallCircle.node, 0.75, {cy: 34, ease:Expo.easeIn, onComplete:()=>{this.animating = false} });
    }, 2000)
  }

  // Template
  _createSmallCircle() {
    let circle = this.SVG.circle(92, -13, 13);
    circle.attr({
      id: "menu:circle",
      stroke: "none",
      fill: "#85734c"
    })
    return circle;
  }

  _createSmallCircleRed() {
    let circle = this.SVG.circle(92, -13 - this.SIZE, 13);
    circle.attr({
      id: "menu:circle:red",
      stroke: "none",
      fill: "#ff0000",
      "cy": 30 - this.SIZE
    })
    return circle;
  }

  _createBigCircle() {
    let circle = this.SVG.circle(this.SIZE / 2, -26, 26);
    circle.attr({
      id: "menu:circle:big",
      stroke: "none",
      fill: "#ea232a"
    })
    return circle;
  }

  _createBorderPath() {
    let path = svgPath();
    path.moveTo(4,4);
    path.lineTo(this.SIZE - 4,4);
    path.lineTo(this.SIZE - 4,this.SIZE - 4);
    path.lineTo(4,this.SIZE - 4);
    path.lineTo(4,4);

    let face = this.SVG.path(path.getPath())
    face.attr({
      id: "menu:out",
      stroke: "#333333",
      opacity:1,
      strokeWidth: "1" ,
      fill: "none",
      x:2,
      y:2
    })

    return face;
  }

  _createInnerPath() {
    let path = svgPath();
    path.moveTo(4 + this.SIZE / 2,this.SIZE - 4);
    path.lineTo(4 + this.SIZE / 2,4);
    path.lineTo(4,4 + this.SIZE / 2);
    path.lineTo(4 + this.SIZE / 2,4 + this.SIZE / 2);

    let face = this.SVG.path(path.getPath())
    face.attr({
      id: "menu:inner",
      stroke: "#333333",
      opacity:1,
      strokeWidth: "1" ,
      fill: "none"
    })

    return face;
  }

  _createOverPath() {
    let path = svgPath();
    path.moveTo(this.SIZE - 4,4);
    path.lineTo(4,this.SIZE - 4);

    let face = this.SVG.path(path.getPath())
    face.attr({
      id: "menu:over",
      stroke: "#333333",
      opacity:1,
      strokeWidth: "1" ,
      fill: "none"
    })

    return face;
  }
}