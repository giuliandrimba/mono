import tmpl from "templates/comp/plane";
import parseHTML from "scripts/shared/lib/parseHTML";
import * as TweenMax from "gsap";
import Segment from "segment-js";
import Easing from "d3-ease";
import svgPath from "scripts/shared/lib/svgPath";
import _ from "lodash";

export default class Plane {

  constructor() {
    this.SVG_WIDTH = 600;
    this.WIDTH = 524;
    this.HEIGHT = 524;

    this.CENTER_X = this.SVG_WIDTH / 2;
    this.CENTER_Y = this.SVG_WIDTH / 2;

    this.INIT_X = this.CENTER_X - this.WIDTH / 2
    this.INIT_Y = this.CENTER_Y - this.HEIGHT / 2
  }

  outro() {

  }

  render(parent) {

    this.SVG = new Snap(600, 600);
    this.SVG.node.opacity = 0;
    this.SVG.node.id = "plane";
    this.SVG.node.setAttribute("viewBox",`0 0 600 600`)

    this.face01 = this._createFace01()
    this.segmentFace01 = new Segment(this.face01.node);

    this.face02 = this._createFace02()
    this.segmentFace02 = new Segment(this.face02.node);

    this.dragProgress01 = this._createDragProgress01()
    this.segmentDragProgress01 = new Segment(this.dragProgress01.node);

    this.dragProgress02 = this._createDragProgress02()
    this.segmentDragProgress02 = new Segment(this.dragProgress02.node);

    parent.appendChild(this.SVG.node);

    this.resize()
    this.events();
  }

  showProgress(percentage) {
    let per = percentage * 100;
    TweenMax.to(this.dragProgress01.node, 0.2, {strokeDasharray: this.segmentDragProgress01.strokeDasharray("0%", `${per}%`) });
    TweenMax.to(this.dragProgress02.node, 0.2, {strokeDasharray: this.segmentDragProgress02.strokeDasharray("0%", `${per}%`) });
  }

  events() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  beforeAnimation() {
    TweenMax.set(this.face01.node, { css:{strokeDasharray: this.segmentFace01.strokeDasharray(0, 0) } });
    TweenMax.set(this.face02.node, { css:{strokeDasharray: this.segmentFace02.strokeDasharray(0, 0) } });
    TweenMax.set(this.dragProgress01.node, { css:{strokeDasharray: this.segmentDragProgress01.strokeDasharray("0%", "0%") } });
    TweenMax.set(this.dragProgress02.node, { css:{strokeDasharray: this.segmentDragProgress02.strokeDasharray("0%", "0%") } });
    this.SVG.node.style.opacity = 1;
  }

  animationIn(done) {
    this.beforeAnimation();
    TweenMax.to(this.face01.node, 0.75, {strokeDasharray: this.segmentFace01.strokeDasharray("0%", "100%"), delay:0.25, ease:Expo.easeIn });
    TweenMax.to(this.face02.node, 1.5, {strokeDasharray: this.segmentFace02.strokeDasharray("0%", "100%"), delay:1, ease:Expo.easeOut });

    if(done)
      _.delay(done, 1000);
  }

  show() {
    this.animationIn()
  }

  hide() {
    TweenMax.set(this.face01.node, { css:{strokeDasharray: this.segmentFace01.strokeDasharray(0, 0) } });
    TweenMax.set(this.face02.node, { css:{strokeDasharray: this.segmentFace02.strokeDasharray(0, 0) } });
    this.showProgress(0)
  }

  _createFace01() {

    let path = svgPath()

    path.moveTo(this.INIT_X, this.INIT_Y + this.HEIGHT);
    path.lineTo(this.INIT_X, this.INIT_Y);
    path.lineTo(this.INIT_X + this.WIDTH, this.INIT_Y);

    let face = this.SVG.path(path.getPath())

    face.attr({
      id: "face01",
      stroke: "#ffffff",
      opacity:0.2,
      strokeWidth: "1" ,
      fill: "none"
    })

    return face;
  }

  _createFace02() {

    let path = svgPath()
    path.moveTo(this.INIT_X + this.WIDTH, this.INIT_Y);
    path.lineTo(this.INIT_X, this.INIT_Y + this.HEIGHT);
    path.lineTo(this.INIT_X + this.WIDTH, this.INIT_Y + this.HEIGHT);
    path.lineTo(this.INIT_X + this.WIDTH, this.INIT_Y);

    let face = this.SVG.path(path.getPath())

    face.attr({
      id: "face02",
      stroke: "#ffffff",
      opacity:0.2,
      strokeWidth: "1" ,
      fill: "none"
    })

    return face;
  }

  _createDragProgress01() {
     let path = svgPath()

     path.moveTo(this.INIT_X + this.WIDTH, this.INIT_Y + this.HEIGHT);
     path.lineTo(this.INIT_X + this.WIDTH, this.INIT_Y);
     path.lineTo(this.INIT_X + this.WIDTH / 2, this.INIT_Y + this.HEIGHT / 2);

     let face = this.SVG.path(path.getPath())

     face.attr({
      id: "dragprogress01",
      stroke: "#ff0000",
      strokeWidth: "1" ,
      fill: "none"
    })

    return face;
  }

  _createDragProgress02() {
     let path = svgPath()

     path.moveTo(this.INIT_X + this.WIDTH, this.INIT_Y + this.HEIGHT);
     path.lineTo(this.INIT_X, this.INIT_Y + this.HEIGHT);
     path.lineTo(this.INIT_X + this.WIDTH / 2, this.INIT_Y + this.HEIGHT / 2);

     let face = this.SVG.path(path.getPath())

     face.attr({
      id: "dragprogress01",
      stroke: "#ff0000",
      strokeWidth: "1" ,
      fill: "none"
    })

    return face;
  }

  resize() {
    this.SVG_WIDTH = window.innerWidth * 600 / 1920;
    this.WIDTH = window.innerWidth * 524 / 1920;
    this.HEIGHT = this.WIDTH;

    this.CENTER_X = this.SVG_WIDTH / 2;
    this.CENTER_Y = this.SVG_WIDTH / 2;

    this.INIT_X = this.CENTER_X - this.WIDTH / 2
    this.INIT_Y = this.CENTER_Y - this.HEIGHT / 2

    if(this.SVG) {
      this.SVG.node.setAttribute("width",`${this.SVG_WIDTH}px`)
      this.SVG.node.setAttribute("height",`${this.SVG_WIDTH}px`)
    }
  }

}