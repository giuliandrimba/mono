import OBJLoader from "three-obj-loader";
OBJLoader(window.THREE);
const glslify = require('glslify');
import loadObj from "scripts/shared/lib/three/loadObj";
import Distortion from "scripts/shared/lib/three/distortion";
import happens from "happens";

export default class Head {
  constructor(scene, camera, renderer) {
    happens(this);

    this.scene = scene;
    this.loaded = false;
    this.animating = false;
    this.dragging = false;
    this.angle = 0;
    this.drag_percent = 0;
    this.animating = false;
    this.canDrag = true;

    this.material = undefined;
    this.geometry = undefined;
    this.mesh = undefined;

    this.windowHalfX = window.innerWidth / 2;
    this.mouseDownX = 0;
    this.mouseX = 0;
    this.mouseDownAngle = 0; 

    this.speed = 0.3;
    this.clock = new THREE.Clock();

    Head.scope = this;

    document.body.classList.add("grab");

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

  enableDrag() {
    Head.scope.canDrag = true;
  }

  disableDrag() {
    Head.scope.canDrag = false;
  }

  events() {
    document.querySelector(".monkey").addEventListener("mousedown", this.onMouseDown)
    document.addEventListener("mouseup", this.onMouseUp)
  }

  onMouseDown(event) {
    if(Head.scope.animating || !Head.scope.canDrag || !Head.scope.mesh.visible)
      return;

    Head.scope.emit("drag:start")

    document.body.classList.add("grabbing");
    Head.scope.dragging = true;
    TweenMax.killTweensOf(Head.scope.distortion);

    Head.scope.mouseDownX = ( event.clientX - Head.scope.windowHalfX ) / 2;
    Head.scope.mouseX = ( event.clientX - Head.scope.windowHalfX ) / 2;
    Head.scope.mouseDownAngle = Head.scope.distortion.angle;

    document.addEventListener("mousemove", Head.scope.onMouseMove);
  }

  onMouseMove(event) {
    if(!Head.scope.canDrag || !Head.scope.mesh.visible || Head.scope.animating)
      return
    Head.scope.mouseX = ( event.clientX - Head.scope.windowHalfX ) / 2;
    Head.scope.emit("drag", Head.scope.drag_percent);
  }

  onMouseUp(event) {
    if(!Head.scope.canDrag || !Head.scope.mesh.visible || Head.scope.animating)
      return

    Head.scope.dragging = false;
    document.body.classList.remove("grabbing");
    document.removeEventListener("mousemove", Head.scope.onMouseMove) 

    TweenMax.killTweensOf(Head.scope.distortion);

    if(Math.abs(Head.scope.distortion.angle) > 270) {

      Head.scope.animating = true;
      Head.scope.emit("explode:start")
      Head.scope.distortion.explode(()=> {
      Head.scope.emit("explode:end")
      Head.scope.mesh.visible = false;
        _.delay(()=>{
          Head.scope.animating = false;
        }, 2000)
      })

      var rotationAngle = 0
      var rot = Head.scope.mesh.rotation.y * 180 / Math.PI
      if(rot > 360) {
        var rotationAngle = (rot - (rot % 360)) * Math.PI / 180
      }

      TweenMax.to(Head.scope.mesh.rotation, 1, {y:rotationAngle, ease:Expo.easeout})

      return;
    }

    var time = 1
    TweenMax.to(Head.scope.distortion, time, {angle:0, ease:Elastic.easeOut, onComplete:()=>{Head.scope.animating = false}})
    Head.scope.emit("drag", 0);
    Head.scope.emit("drag:end")
  } 

  implode() {
    this.mesh.visible = true;
    Head.scope.distortion.implode()
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
        distortion     : {type: 'f', value: 10.0},
        explosion     : {type: 'f', value: 0.0},
        opacity     : {type: 'f', value: 1.0}
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
      // this.distortion.angle = (this.mouseDownAngle + (this.mouseDownX - this.mouseX) * 0.5) * -1
      var angle = (this.mouseDownAngle + (this.mouseDownX - this.mouseX) * 2) * -1
      this.distortion.angle = angle / this.windowHalfX * 360
    }

    if(this.distortion) {
      this.distortion.update();
      this.drag_percent = Math.abs(this.distortion.angle / 270);
      if(this.drag_percent > 1)
        this.drag_percent = 1
    }
    
  }

  resize() {
    this.windowHalfX = window.innerWidth / 2;
  }

  animDistort() {
    TweenMax.to(this.mesh.material.uniforms[ 'distortion' ], 0.65, {value:0.0, ease:Expo.easeOut, delay:1.0})
    TweenMax.to(this, 1, {speed:0.01})
    TweenMax.to(this.distortion, 1.1, {angle:45, ease:Expo.easeInOut, delay:0.7})
    TweenMax.to(this.distortion, 0.8, {angle:0, ease:Expo.easeOut, delay:1.3})
  } 
}