import svgPath from "scripts/shared/lib/svgPath";
import Ease from "d3-ease";
import Vivus from "vivus";
import Snap from "snapsvg";
import Segment from "segment-js";

export default class Menu {
  constructor() {
    this.SVG = undefined;
    this.SIZE = 114;
    this.vivus = undefined;
    this.borderPath = undefined;
  }

  render(parent) {
    this.SVG = new Snap(this.SIZE, this.SIZE);
    this.SVG.node.id = "menu";
    this.SVG.node.setAttribute("viewBox",`0 0 ${this.SIZE} ${this.SIZE}`);

    this.borderPath = this._createBorderPath();
    this.segmentBorderPath = new Segment(this.borderPath.node);
    
    this.innerPath = this._createInnerPath();
    this.segmentInnerPath = new Segment(this.innerPath.node);

    this.circle = this._createCircle();

    this.SVG.append(this.borderPath);
    this.SVG.append(this.innerPath);
    this.SVG.append(this.circle);

    parent.appendChild(this.SVG.node);
  }

  beforeAnimationIn() {
    TweenMax.set(this.borderPath.node, { css:{strokeDasharray: this.segmentBorderPath.strokeDasharray(0, 0) } });
    TweenMax.set(this.innerPath.node, { css:{strokeDasharray: this.segmentInnerPath.strokeDasharray(0, 0) } });
  }

  animationIn() {
    this.beforeAnimationIn();

    TweenMax.to(this.borderPath.node, 0.75, {strokeDasharray: this.segmentBorderPath.strokeDasharray("0%", "100%"), delay:0.25, ease:Expo.easeIn });
    TweenMax.to(this.innerPath.node, 1.5, {strokeDasharray: this.segmentInnerPath.strokeDasharray("0%", "100%"), delay:1, ease:Expo.easeOut });
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
      stroke: "#85734c",
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
      stroke: "#85734c",
      strokeWidth: "0.5" ,
      fill: "none"
    })

    return face;
  }
}