import parseHTML from "scripts/shared/lib/parseHTML";
import svgPath from "scripts/shared/lib/svgPath";
import Vivus from "vivus";
import Snap from "snapsvg";
import Ease from "d3-ease"

export default class logo {
  constructor(SVG) {
    this.el = undefined;
    this.SVG = SVG;
    this.svg = undefined;
    this.WIDTH = 524;
    this.HEIGHT = 524;
    this.vivus = undefined;
  }

  render(parent) {

    this.CENTER_X = window.innerWidth / 2;
    this.CENTER_Y = window.innerHeight / 2;

    this.INIT_X = this.CENTER_X - this.WIDTH / 2
    this.INIT_Y = this.CENTER_Y - this.HEIGHT / 2

    this.svg = new Snap(this.WIDTH, this.HEIGHT)
    this.svg.node.id = "logo-svg";
    this.svg.node.setAttribute("viewBox",`0 0 524 524`)
    parent.appendChild(this.svg.node);

    this.path01 = this._createPath();
    this.svg.append(this.path01);
    this.path02 = this._createPath02();
    this.svg.append(this.path02);
    this.path03 = this._createPath03();
    this.svg.append(this.path03);
    this.path04 = this._createPath04();
    this.svg.append(this.path04);
    this.resize()
  }

  animationIn() {
    console.log(Ease);
    this.vivus = new Vivus('logo-svg', {
        duration: 150,
        animTimingFunction: Ease.easeExpOut
      }, ()=>{})
  }

  resize() {

    // this.WIDTH = window.innerWidth * 363 / 1920;
    // this.HEIGHT = this.WIDTH;

    this.CENTER_X = window.innerWidth / 2;
    this.CENTER_Y = window.innerHeight / 2;

    this.INIT_X = this.CENTER_X - this.WIDTH / 2
    this.INIT_Y = this.CENTER_Y - this.HEIGHT / 2

    if(this.svg) {
      let width = (window.innerWidth * 524) / 1920
      this.svg.node.setAttribute("width",`${width}px`)
      this.svg.node.setAttribute("height",`${width}px`)
    }
  }

  _createPath() {
    let path = svgPath()

    let initX = 80;
    let initY = 80;

    path.moveTo(initX, initY);
    path.lineTo(initX + 363, initY);
    path.lineTo(initX + 363, initY + 99);
    path.lineTo(initX, initY + 99);
    path.lineTo(initX, initY - 3);

    path.moveTo(initX, initY);

    let face = this.SVG.path(path.getPath())
    face.attr({
      id: "logoSVG",
      stroke: "#85734c",
      strokeWidth: "6" ,
      fill: "none"
    })

    return face;
  }

  _createPath02() {
    let path = svgPath()

    let initX = 80;
    let initY = 80;

    path.moveTo(initX + 363, initY + 130);
    path.lineTo(initX, initY + 130);
    path.lineTo(initX, initY + 360);
    path.lineTo(initX + 363, initY + 360);

    let face = this.SVG.path(path.getPath())
    face.attr({
      id: "logoSVG",
      stroke: "#85734c",
      strokeWidth: "6" ,
      fill: "none"
    })

    return face;
  }

  _createPath03() {
    let path = svgPath()

    let initX = 80 + 136;
    let initY = 80 + 199;

    path.moveTo(initX, initY);
    path.lineTo(initX + 228, initY);
    path.lineTo(initX + 228, initY + 56);
    path.lineTo(initX, initY + 56);
    path.lineTo(initX, initY + 112);
    path.lineTo(initX + 228, initY + 112);

    let face = this.SVG.path(path.getPath())
    face.attr({
      id: "logoSVG",
      stroke: "#85734c",
      strokeWidth: "6" ,
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
      strokeWidth: "6" ,
      fill: "none"
    })

    return face;
  }
}

