import svgPath from "scripts/shared/lib/svgPath";
import Ease from "d3-ease";
import Vivus from "vivus";
import Snap from "snapsvg";
import Segment from "segment-js";
import _ from "lodash";

export default class Menu {
  constructor() {
    this.SVG = undefined;
    this.SIZE = 114;
    this.vivus = undefined;
    this.borderPath = undefined;

    this.circleOverDelay = undefined;
    this.circleDelay = undefined;
  }

  render(parent) {
    this.SVG = new Snap(this.SIZE, this.SIZE);
    this.SVG.node.id = "menu";
    this.SVG.node.setAttribute("viewBox",`0 0 ${this.SIZE} ${this.SIZE}`);

    this.borderPath = this._createBorderPath();
    this.segmentBorderPath = new Segment(this.borderPath.node);
    
    this.innerPath = this._createInnerPath();
    this.segmentInnerPath = new Segment(this.innerPath.node);

    this.overPath = this._createOverPath();
    this.segmentOverPath = new Segment(this.overPath.node);

    this.circle = this._createCircle();
    this.circleOver = this._createCircleOver();

    this.SVG.append(this.borderPath);
    this.SVG.append(this.innerPath);
    this.SVG.append(this.circle);

    parent.appendChild(this.SVG.node);
    this.events();
  }

  events() {
    this.SVG.node.addEventListener("mouseover", this.onMouseOver.bind(this))
    this.SVG.node.addEventListener("mouseout", this.onMouseOut.bind(this))
  }

  onMouseOver() {
    TweenMax.to(this.innerPath.node, 0.5, {strokeDasharray: this.segmentInnerPath.strokeDasharray("0%", "0%"), ease:Expo.easeOut });
    TweenMax.to(this.overPath.node, 0.5, {strokeDasharray: this.segmentOverPath.strokeDasharray("0%", "100%"), ease:Expo.easeOut });
    
    window.clearTimeout(this.circleDelay);
    this.circle.stop();
    this.circle.animate({cy:this.SIZE + 13}, 700, Ease.easeExpOut)

    window.clearTimeout(this.circleOverDelay);
    this.circleOverDelay = _.delay(()=>{
      this.circleOver.stop();
      this.circleOver.animate({cy:this.SIZE / 2}, 900, Ease.easeExpOut)
    }, 100)
  }

  onMouseOut() {
    TweenMax.to(this.overPath.node, 0.75, {strokeDasharray: this.segmentOverPath.strokeDasharray("0%", "0%"), ease:Expo.easeOut });
    TweenMax.to(this.innerPath.node, 0.75, {strokeDasharray: this.segmentInnerPath.strokeDasharray("0%", "100%"), ease:Expo.easeOut });
    window.clearTimeout(this.circleOverDelay);
    this.circleOver.stop();
    this.circleOver.animate({cy:-26}, 700, Ease.easeExpOut)

    window.clearTimeout(this.circleDelay);
    this.circleDelay = _.delay(()=>{
      this.circle.stop();
      this.circle.animate({cy:30}, 900, Ease.easeExpOut)
    }, 100)
  }

  beforeAnimationIn() {
    TweenMax.set(this.borderPath.node, { css:{strokeDasharray: this.segmentBorderPath.strokeDasharray(0, 0) } });
    TweenMax.set(this.innerPath.node, { css:{strokeDasharray: this.segmentInnerPath.strokeDasharray(0, 0) } });
    TweenMax.set(this.overPath.node, { css:{strokeDasharray: this.segmentOverPath.strokeDasharray(0, 0) } });
  }

  animationIn() {
    this.beforeAnimationIn();

    TweenMax.to(this.borderPath.node, 0.75, {strokeDasharray: this.segmentBorderPath.strokeDasharray("0%", "100%"), delay:0.25, ease:Expo.easeIn });
    TweenMax.to(this.innerPath.node, 1.3, {strokeDasharray: this.segmentInnerPath.strokeDasharray("0%", "100%"), delay:1, ease:Expo.easeOut });

    _.delay(()=>{
      this.circle.animate({cy:30}, 750, Ease.easeExpOut)
      TweenMax.to(this.circle.node, 0.75, {cy: 30, ease:Expo.easeIn });
    }, 2000)
  }

  _createCircle() {
    let circle = this.SVG.circle(86, -13, 13);
    circle.attr({
      id: "menu:circle",
      stroke: "none",
      fill: "#85734c"
    })
    return circle;
  }

  _createCircleOver() {
    let circle = this.SVG.circle(this.SIZE / 2, -26, 26);
    circle.attr({
      id: "menu:circle:over",
      stroke: "none",
      fill: "#ea232a"
    })
    return circle;
  }

  _createBorderPath() {
    let path = svgPath();
    path.moveTo(0,0);
    path.lineTo(this.SIZE,0);
    path.lineTo(this.SIZE,this.SIZE);
    path.lineTo(0,this.SIZE);
    path.lineTo(0,0);

    let face = this.SVG.path(path.getPath())
    face.attr({
      id: "menu:out",
      stroke: "#4d4d4d",
      strokeWidth: "1" ,
      fill: "none"
    })

    return face;
  }

  _createInnerPath() {
    let path = svgPath();
    path.moveTo(this.SIZE / 2,this.SIZE);
    path.lineTo(this.SIZE / 2,0);
    path.lineTo(0,this.SIZE / 2);
    path.lineTo(this.SIZE / 2,this.SIZE / 2);

    let face = this.SVG.path(path.getPath())
    face.attr({
      id: "menu:inner",
      stroke: "#4d4d4d",
      strokeWidth: "0.5" ,
      fill: "none"
    })

    return face;
  }

  _createOverPath() {
    let path = svgPath();
    path.moveTo(this.SIZE,0);
    path.lineTo(0,this.SIZE);

    let face = this.SVG.path(path.getPath())
    face.attr({
      id: "menu:over",
      stroke: "#4d4d4d",
      strokeWidth: "0.5" ,
      fill: "none"
    })

    return face;
  }
}