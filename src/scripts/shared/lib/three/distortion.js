require("scripts/shared/lib/three/mod3.distort");

class Distortion {
  constructor(mesh) {
    this.mesh = mesh;
    this.angle = 270;
    this.mod3 = new MOD3.ModifierStack( MOD3.LibraryThree, this.mesh );
    this.twist = new window.MOD3.Distort( this.angle * Math.PI / 180 );
    this.mod3.addModifier( this.twist );
  }

  update() {
    this.twist.angle = this.angle * Math.PI / 180;
    this.mod3.apply();
    this.mesh.geometry.verticesNeedUpdate = true;
  }
}
export default Distortion;