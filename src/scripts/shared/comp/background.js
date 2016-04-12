export default class Background {
  constructor(scene, camera, renderer) {

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.material = undefined;
    this.geometry = undefined;
    this.mesh = undefined;

    this.createMesh()
  } 

  createMesh() {

    this.geometry = new THREE.PlaneGeometry(10,10,2,2)
    this.material = new THREE.MeshBasicMaterial({color:0xee1f1f, transparent:true, opacity:0})

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0,0,0);
    this.scene.add(this.mesh);
  }

  show(done) {
    TweenMax.set(this.mesh.material, {opacity:1})
    TweenMax.to(this.mesh.material, 2.5, {opacity:0})
    setTimeout(done, 3250);
  }

  update() {
     
  }
}