import OBJLoader from "three-obj-loader";
OBJLoader(window.THREE);

export default class Head {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.loader = new THREE.OBJLoader();
    this.loaded = false;
    this.animating = false;
    this.angle = 0;

    this.rotationY = 0

    this.material = undefined;
    this.geometry = undefined;
    this.mesh = undefined;

    this.clock = new THREE.Clock();
    this.loadOBJ(this.createMesh.bind(this));

    this.triggeredAnimationIn = false;
  }

  animationIn() {
    if(this.loaded) {
      TweenMax.to(this, 2, {rotationY:0, ease:Expo.easeOut, onUpdate:()=> {
        let rot = this.rotationY * Math.PI / 180;
        let transformation = new THREE.Matrix4().makeRotationY(rot);
        this.mesh.geometry.applyMatrix(transformation);
        this.mesh.geometry.verticesNeedUpdate = true;

      }})
      TweenMax.to(this.mesh.position, 1, {y:0, ease:Expo.easeInOut})
    } else {
      this.triggeredAnimationIn = true;
    }
  }

  animationOut() {

  }

  createMesh() {
    this.material = new THREE.MeshPhongMaterial({color:0x4c4c4c, wireframe:false, transparent:true, shading: THREE.FlatShading, emissive:0x000000, specular:0x000000})
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    // this.mesh.matrixAutoUpdate = false;
    this.mesh.updateMatrix();
    this.scene.add(this.mesh);
    this.loaded = true;

    this.rotationY = 90;
    this.mesh.position.y -= 5
    let transformation = new THREE.Matrix4().makeRotationY(this.rotationY * Math.PI / 180);
    this.mesh.geometry.applyMatrix(transformation);
    this.mesh.geometry.verticesNeedUpdate = true;

    if(this.triggeredAnimationIn) {
      this.animationIn();
    }

  }

  update() {
    // let delta = 5 * clock.getDelta();
    // this.mesh.rotation.y -= 0.015 * delta;
  }

  loadOBJ(done) {
    let path = './assets/macaco_medium.OBJ';
    let self = this;

    this.loader.load(path, function(object) {
      object.traverse(function(child) {
        if( child instanceof THREE.Mesh) {
          self.geometry = new THREE.Geometry().fromBufferGeometry( child.geometry );
          done()
        }
      })
    })
  }
}