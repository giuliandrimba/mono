import parseHTML from "scripts/shared/lib/parseHTML";
import svgPath from "scripts/shared/lib/svgPath";
import Vivus from "vivus";
import Snap from "snapsvg";
import Ease from "d3-ease"
import _ from "lodash";


export default class logo {
  constructor() {
    this.SVG = undefined;
    this.WIDTH = 524;
    this.HEIGHT = 524;
    this.CENTER_X = window.innerWidth / 2;
    this.CENTER_Y = window.innerHeight / 2;
    this.INIT_X = this.CENTER_X - this.WIDTH / 2
    this.INIT_Y = this.CENTER_Y - this.HEIGHT / 2

    this.vivus = undefined;
  }

  render(parent) {

    this.SVG = new Snap(this.WIDTH, this.HEIGHT)
    this.SVG.node.id = "logo-svg";
    this.SVG.node.setAttribute("viewBox",`0 0 524 524`)
    parent.appendChild(this.SVG.node);

    this.path01 = this._createPath();
    this.SVG.append(this.path01);
    this.path02 = this._createPath02();
    this.SVG.append(this.path02);
    this.path03 = this._createPath03();
    this.SVG.append(this.path03);
    this.path04 = this._createPath04();
    this.SVG.append(this.path04);
    this.resize()
    this.events();
  }

  events() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  animationIn() {
    this.vivus = new Vivus('logo-svg', {
        duration: 150,
        animTimingFunction: Ease.easeExpOut
      })
  }

  animationOut(done) {
    this.vivus.animTimingFunction = Ease.easeExpInOut;
    this.vivus.play(-1.3);
    _.delay(done, 2000);
  }

  resize() {

    this.CENTER_X = window.innerWidth / 2;
    this.CENTER_Y = window.innerHeight / 2;

    this.INIT_X = this.CENTER_X - this.WIDTH / 2
    this.INIT_Y = this.CENTER_Y - this.HEIGHT / 2

    if(this.SVG) {
      let width = (window.innerWidth * 524) / 1920
      this.SVG.node.setAttribute("width",`${width}px`)
      this.SVG.node.setAttribute("height",`${width}px`)
    }
  }

  _createPath() {
    let path = svgPath()

    let initX = 80;
    let initY = 80;

    path.moveTo(initX, initY);
    path.lineTo(initX + 363, initY);
    path.lineTo(initX + 363, initY + 88);
    path.lineTo(initX, initY + 88);
    path.lineTo(initX, initY - 6);

    path.moveTo(initX, initY);

    let face = this.SVG.path(path.getPath())
    face.attr({
      id: "logoSVG",
      stroke: "#85734c",
      strokeWidth: "12" ,
      fill: "none"
    })

    return face;
  }

  _createPath02() {
    let path = svgPath()

    let initX = 80;
    let initY = 80;

    path.moveTo(initX + 368, initY + 134);
    path.lineTo(initX, initY + 134);
    path.lineTo(initX, initY + 360);
    path.lineTo(initX + 367, initY + 360);

    let face = this.SVG.path(path.getPath())
    face.attr({
      id: "logoSVG",
      stroke: "#85734c",
      strokeWidth: "12" ,
      fill: "none"
    })

    return face;
  }

  _createPath03() {
    let path = svgPath()

    let initX = 80 + 136;
    let initY = 80 + 192;

    path.moveTo(initX, initY);
    path.lineTo(initX + 226, initY);
    path.lineTo(initX + 226, initY + 56);
    path.lineTo(initX, initY + 56);
    path.lineTo(initX, initY + 112);
    path.lineTo(initX + 231, initY + 112);

    let face = this.SVG.path(path.getPath())
    face.attr({
      id: "logoSVG",
      stroke: "#85734c",
      strokeWidth: "12" ,
      fill: "none"
    })

    return face;
  }

  _createPath04() {
    let path = svgPath()

    let initX = 80 + 87;
    let initY = 80 + 133;

    path.moveTo(initX, initY);
    path.lineTo(initX, initY + 229);

    let face = this.SVG.path(path.getPath())
    face.attr({
      id: "logoSVG",
      stroke: "#85734c",
      strokeWidth: "12" ,
      fill: "none"
    })

    return face;
  }
}

