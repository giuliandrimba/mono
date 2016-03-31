export default function() {
  var path = {toSVG:""}

  path.moveTo = function(x, y) {
    this.toSVG += `M ${x} ${y}`
  }

  path.lineTo = function(x, y) {
    this.toSVG += ` L ${x} ${y}`
  }

  path.getPath = function() {
    var svg = this.toSVG.split("")
    return svg.join("")
  }

  return path;
}





