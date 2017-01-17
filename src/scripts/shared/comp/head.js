import OBJLoader from "three-obj-loader";
OBJLoader(window.THREE);
const glslify = require('glslify');
import loadObj from "scripts/shared/lib/three/loadObj";
import Distortion from "scripts/shared/lib/three/distortion";
import happens from "happens";
import _ from "lodash";
import * as sounds from "scripts/shared/audio";
import Animation from "./animation";

export default class Head {
  constructor(scene, camera, renderer) {
    happens(this);

    this.scene = scene;
    this.loaded = false;
    this.animating = false;
    this.dragging = false;
    this.angle = 0;
    this.drag_percent = 0;
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

    loadObj('./assets/macaco_medium.OBJ', this.createMesh.bind(this))

    this.triggeredAnimationIn = false;
  }

  animationIn(done) {
    
    if(this.loaded) {
      this.reset();
      TweenMax.to(this.mesh.position, 2, {y:0, ease:Expo.easeInOut, onComplete:done})
      this.animDistort()
    } else {
      this.triggeredAnimationIn = true;
    }
  }

  animationOut(done) {
    Head.scope.animating = true;
    this.animDistortOut(done)
  }

  enableDrag() {
    console.log("enableDrag")
    Head.scope.canDrag = true;
  }

  disableDrag() {
    console.log("disableDrag")
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
    // Head.scope.mouseDownAngle = Head.scope.distortion.angle;

    document.addEventListener("mousemove", Head.scope.onMouseMove);
  }

  reset() {
    this.clock = new THREE.Clock();
    this.mouseDownX = 0;
    this.mouseX = 0;
    this.mouseDownAngle = 0; 
    this.mesh.visible = true;
    this.mesh.position.y = -0.32;
    // this.mesh.material.uniforms[ 'distortion' ].value = 10.0
    // this.mesh.material.uniforms[ 'explosion' ].value = 0.0
    // this.distortion.reset();
    this.mesh.rotation.y = 0;
    this.speed = 0.3;
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
      Head.scope.explode()
      return;
    }

    var time = 1
    TweenMax.to(Head.scope.distortion, time, {angle:0, ease:Elastic.easeOut, onComplete:()=>{Head.scope.animating = false}})
    Head.scope.emit("drag", 0);
    Head.scope.emit("drag:end")
  } 

  explode() {
    Head.scope.animating = true;
    Head.scope.emit("explode:start")
    _.delay(function(){
      sounds.playBell()
    }, 1650)
    Head.scope.distortion.explode(()=> {
      Head.scope.emit("explode:end")
      _.delay(()=>{
        Head.scope.animating = false;
      }, 2000)
    })
    TweenMax.to(Head.scope.mesh.material.uniforms['opacity'], 1, {value:0.0, ease:Expo.easeOut, delay:2.5, onComplete:()=>{
      Head.scope.mesh.visible = false;
    }})
    Head.scope.resetAngle()
  }

  resetAngle() {
    var rotationAngle = 0
    var rot = Head.scope.mesh.rotation.y

    var rotationAngle = ((rot - (rot % Math.PI)))
    rotationAngle -= Math.PI * 4;
    TweenMax.to(Head.scope.mesh.rotation, 1.75, {y:rotationAngle, ease:Expo.easeOut})

  }

  implode() {
    this.mesh.visible = true;
    Head.scope.distortion.implode()
  }

  createMesh(geometry) {
    var self = this;
    this.geometry = geometry;
    this.mesh = new Animation(this.geometry)
    // this.mesh.animate(6)
    // self.material = new THREE.ShaderMaterial({
    //   uniforms : {
    //     time           : {type: 'f', value: 0},
    //     ambient        : {type: 'c', value: new THREE.Color(0x000000)},
    //     specular       : {type: 'f', value: .1},
    //     color          : {type: 'c', value: new THREE.Color(0x4c4c4c)},
    //     shininess      : {type: 'f', value: 2.9},
    //     lightDirection : {type: 'v3', value: new THREE.Vector3(800,1800,5000)},
    //     distortion     : {type: 'f', value: 10.0},
    //     explosion     : {type: 'f', value: 0.0},
    //     opacity     : {type: 'f', value: 1.0}
    //   },
    //   vertexShader : glslify('../../../shader/head/vert.glsl'),
    //   fragmentShader : glslify('../../../shader/head/frag.glsl'),
    //   shading     : THREE.FlatShading,
    //   // wireframe   : true, 
    //   transparent : true
    // })
    // self.mesh = new THREE.Mesh(this.geometry, self.material);
    // self.mesh.name = "head";
    // this.distortion = new Distortion(this.mesh);

    console.log(this.mesh)

    self.reset();
    self.scene.add(self.mesh);
    self.loaded = true;


    if(this.triggeredAnimationIn) {
      this.animationIn();
    }
    this.events();
  }

  update() {

    if(!this.loaded || !this.mesh.visible)
      return

    var delta = 5 * this.clock.getDelta();

    if(this.mesh)
      this.mesh.rotation.y += this.speed * delta;

    if(this.dragging) {
      var angle = (this.mouseDownAngle + (this.mouseDownX - this.mouseX) * 2) * -1
      // this.distortion.angle = angle / this.windowHalfX * 360
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
    // TweenMax.to(this.mesh.material.uniforms[ 'distortion' ], 0.65, {value:0.0, ease:Expo.easeOut, delay:1.0})
    TweenMax.to(this, 1, {speed:0.01})
    // TweenMax.to(this.distortion, 1.1, {angle:45, ease:Expo.easeInOut, delay:0.7})
    // TweenMax.to(this.distortion, 0.8, {angle:0, ease:Expo.easeOut, delay:1.3, onComplete:()=>{Head.scope.animating = false;}})
  } 

  animDistortOut(done) {
    TweenMax.to(this.mesh.position, 1, {y:1, ease:Expo.easeInOut})
    // TweenMax.to(this.mesh.material.uniforms[ 'distortion' ], 1, {value:10.0, ease:Expo.easeInOut})
    TweenMax.to(this.mesh.position, 3, {y:4, ease:Expo.easeOut, delay:0.5})
    // TweenMax.to(this.mesh.material.uniforms[ 'distortion' ], 2, {value:0.0, ease:Expo.easeOut, delay:0.5})
    // TweenMax.to(this.distortion, 1.1, {angle:270, ease:Expo.easeInOut})
    TweenMax.to(this, 1, {speed:0.3})
    _.delay(done, 1200);
  } 
}