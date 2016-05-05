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

  explode(done) {
    if(Math.abs(this.angle) < 180)
      return;

    // TweenMax.to(this.mesh.material.uniforms[ 'explosion' ], 1, {value:3.0,ease:Expo.easeOut})
    TweenMax.to(this, 0.5, {angle:0, ease:Expo.easeOut})

    this.twist.explode(done)
  }

  reset() {
    this.mesh.material.uniforms[ 'opacity' ].value = 1;
    this.angle = 270;
    this.twist.reset()
  }
}
export default Distortion;