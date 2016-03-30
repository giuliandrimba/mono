import OBJLoader from "three-obj-loader";
OBJLoader(window.THREE);
const glslify = require('glslify');
import loadObj from "scripts/shared/lib/three/loadObj";
import Distortion from "scripts/shared/lib/three/distortion";

export default class Head {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.loaded = false;
    this.animating = false;
    this.dragging = false;
    this.angle = 0;

    this.material = undefined;
    this.geometry = undefined;
    this.mesh = undefined;

    this.windowHalfX = window.innerWidth / 2;
    this.mouseDownX = 0;
    this.mouseX = 0;
    this.mouseDownAngle = 0;    

    this.speed = 0.3;
    this.clock = new THREE.Clock();

    loadObj('./assets/macaco_medium.OBJ', this.createMesh.bind(this))

    this.triggeredAnimationIn = false;
  }

  animationIn() {
    if(this.loaded) {
      TweenMax.to(this.mesh.position, 2, {y:0, ease:Expo.easeInOut})
    } else {
      this.triggeredAnimationIn = true;
    }
  }

  animationOut() {

  }

  events() {
    document.addEventListener("mousedown", this.onMouseDown.bind(this))
    document.addEventListener("mouseup", this.onMouseUp.bind(this))
  }

  onMouseDown(event) {
    if(this.animating)
      return;

    this.dragging = true;
    TweenMax.killTweensOf(this.distortion);

    this.mouseDownX = ( event.clientX - this.windowHalfX ) / 2;
    this.mouseX = ( event.clientX - this.windowHalfX ) / 2;
    this.mouseDownAngle = this.distortion.angle;
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  onMouseMove(event) {
    this.mouseX = ( event.clientX - this.windowHalfX ) / 2;
  }

  onMouseUp(event) {
    this.dragging = false;
    document.removeEventListener("mousemove", this.onMouseMove.bind(this))
    if(this.animating)
      return

    TweenMax.killTweensOf(this.distortion);

    var time = 1
    TweenMax.to(this.distortion, time, {angle:0, ease:Elastic.easeOut})

  } 

  createMesh(geometry) {
    var self = this;
    this.geometry = geometry;
    self.material = new THREE.ShaderMaterial({
      uniforms : {
        time           : {type: 'f', value: 0},
        ambient        : {type: 'c', value: new THREE.Color(0x000000)},
        specular       : {type: 'f', value: .1},
        color          : {type: 'c', value: new THREE.Color(0x4c4c4c)},
        shininess      : {type: 'f', value: 2.9},
        lightDirection : {type: 'v3', value: new THREE.Vector3(800,1800,5000)},
        distortion     : {type: 'f', value: 10.0}
      },
      vertexShader : glslify('../../../shader/head/vert.glsl'),
      fragmentShader : glslify('../../../shader/head/frag.glsl'),
      shading     : THREE.FlatShading,
      // wireframe   : true, 
      transparent : true
    })
    self.mesh = new THREE.Mesh(this.geometry, self.material);
    self.scene.add(self.mesh);
    self.loaded = true;

    this.mesh.position.y -= 0.32;

    if(this.triggeredAnimationIn) {
      this.animationIn();
      this.events();
    }

    this.distortion = new Distortion(this.mesh);

    this.animDistort()
  }

  update() {
    var delta = 5 * this.clock.getDelta();
    if(this.mesh)
      this.mesh.rotation.y += this.speed * delta;

    if(this.dragging) {
      this.distortion.angle = (this.mouseDownAngle + (this.mouseDownX - this.mouseX) * 0.5) * -1
    }

    if(this.distortion) {
      this.distortion.update();
    }
  }

  resize() {

  }

  animDistort() {
    TweenMax.to(this.mesh.material.uniforms[ 'distortion' ], 0.65, {value:0.0, ease:Expo.easeOut, delay:1.0})
    TweenMax.to(this, 1, {speed:0.01})
    TweenMax.to(this.distortion, 1.1, {angle:45, ease:Expo.easeInOut, delay:0.7})
    TweenMax.to(this.distortion, 0.8, {angle:0, ease:Expo.easeOut, delay:1.3})
  } 
}