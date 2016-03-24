import tmpl from "templates/comp/plane";
import parseHTML from "scripts/shared/lib/parseHTML";
import * as TweenMax from "gsap";
import Segment from "segment-js";
import Easing from "d3-ease";
import svgPath from "scripts/shared/lib/svgPath";
import _ from "lodash";

export default class Plane {

  constructor(SVG) {
    this.SVG = SVG;
  }

  outro() {

  }

  render() {

    this.resize()

    this.face01 = this._createFace01()
    this.SVG.append(this.face01)
    this.segmentFace01 = new Segment(this.face01.node);

    this.face02 = this._createFace02()
    this.SVG.append(this.face02)
    this.segmentFace02 = new Segment(this.face02.node);
  }

  beforeAnimation() {
    TweenMax.set(this.face01.node, { css:{strokeDasharray: this.segmentFace01.strokeDasharray(0, 0) } });
    TweenMax.set(this.face02.node, { css:{strokeDasharray: this.segmentFace02.strokeDasharray(0, 0) } });
  }

  animationIn(done) {
    this.beforeAnimation();
    TweenMax.to(this.face01.node, 0.75, {strokeDasharray: this.segmentFace01.strokeDasharray("0%", "100%"), delay:0.25, ease:Expo.easeIn });
    TweenMax.to(this.face02.node, 1.5, {strokeDasharray: this.segmentFace02.strokeDasharray("0%", "100%"), delay:1, ease:Expo.easeOut });
    TweenMax.to(this.face02.node, 1, {stroke: 0x333333, delay:2.5, ease:Expo.easeOut });

    _.delay(done, 1000);
  }

  _createFace01() {

    let path = svgPath()

    path.moveTo(this.INIT_X, this.INIT_Y + this.HEIGHT);
    path.lineTo(this.INIT_X, this.INIT_Y);
    path.lineTo(this.INIT_X + this.WIDTH, this.INIT_Y);

    let face = this.SVG.path(path.getPath())

    face.attr({
      id: "face01",
      // stroke: "#ffffff",
      stroke: "#333333",
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
      // stroke: "#857446",
      stroke: "#333333",
      strokeWidth: "1" ,
      fill: "none"
    })

    return face;
  }

  resize() {
    this.WIDTH = window.innerWidth * 525 / 1920;
    this.HEIGHT = this.WIDTH;

    this.CENTER_X = window.innerWidth / 2;
    this.CENTER_Y = window.innerHeight / 2;

    this.INIT_X = this.CENTER_X - this.WIDTH / 2
    this.INIT_Y = this.CENTER_Y - this.HEIGHT / 2
  }
}