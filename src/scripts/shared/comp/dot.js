const glslify = require('glslify');
import happens from "happens";
import "scripts/shared/lib/three/ExplodeModifier";
import * as sounds from "scripts/shared/audio";
import * as _ from "lodash";

export default class Dot {
  constructor(scene, camera, renderer) {

    happens(this);
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.material = undefined;
    this.geometry = undefined;
    this.mesh = undefined;
    this.frame = 0;
    this.total_frames = 60 * 4;
    this.finished = false;
    this.time = performance.now();
    this.now = performance.now()
    this.distance = 0;

    this.clock = new THREE.Clock();
    Dot.scope = this;

    this.icosahedronGeometry = new THREE.IcosahedronGeometry(1, 6);
    var explodeModifier = new THREE.ExplodeModifier();
    explodeModifier.modify( this.icosahedronGeometry );

    this.createMesh()
  } 

  animationIn() {

  }

  createMesh() {

    var numFaces = this.icosahedronGeometry.faces.length;
    var numVertices = this.icosahedronGeometry.vertices.length

    this.geometry = new THREE.BufferGeometry().fromGeometry( this.icosahedronGeometry );
    var center = new THREE.Vector3(0,0,0);

    var displacement = new Float32Array( numFaces * 3 * 3 );
    var initPos = new Float32Array( numFaces * 3 * 3 );
    var springs = new Float32Array( numFaces * 3 * 3 );

    for ( var f = 0; f < numVertices; f ++ ) {
      var index = 3 * f;
      initPos[ index ] = this.icosahedronGeometry.vertices[ f ].x;
      initPos[ index + 1 ] = this.icosahedronGeometry.vertices[ f ].y;
      initPos[ index + 2 ] = this.icosahedronGeometry.vertices[ f ].z;


      if(f % 3 === 0) {
        var rnd = 0.9 + (((this.icosahedronGeometry.vertices[ f ].y / 2) + (this.icosahedronGeometry.vertices[ f ].x / 2 * -1)) * -1);
      }

      if(f % 3 === 0) {
        var d = (50 * Math.random());
      }

      displacement[ index      ] = d;
      displacement[ index  + 1 ] = d;
      displacement[ index  + 2 ] = d;
      
      springs[ index     ] = 0.8 + rnd;
      springs[ index + 1 ] = 0.8 + rnd;
      springs[ index + 2 ] = 0.8 + rnd;
    }

    // console.log(geometry.vertices[0].distanceTo(new THREE.Vector3(0,0,0)))

    this.geometry.addAttribute( 'displacement', new THREE.BufferAttribute( displacement, 3 ) );
    this.geometry.addAttribute( 'springs', new THREE.BufferAttribute( springs, 3 ) );
    this.geometry.addAttribute( 'initPos', new THREE.BufferAttribute( initPos, 3 ) );

    this.material = new THREE.ShaderMaterial({
      uniforms : {
        total_frames : {type: 'f', value: this.total_frames},
        v_frame      :{type: 'f', value: 0.0},
        opacity      : {type: 'f', value: 0.0},
        animType      : {type: 'f', value: 0.0}
      },
      vertexShader : glslify('../../../shader/dot/vert.glsl'),
      fragmentShader : glslify('../../../shader/dot/frag.glsl'),
      transparent : true
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);  
    this.mesh.visible = false;
    this.mesh.name = "dot";
  }

  implode() {

    this.completed = false;
    this.mesh.visible = true;
    TweenMax.killTweensOf(this.mesh.material.uniforms[ 'opacity' ]);
    this.canCountFrames = false;
    this.frame = 0;
    this.mesh.rotation.y = 0;
    // this.mesh.rotation.y = 3.8
    this.mesh.material.uniforms[ 'opacity' ].value = 0.0;
    this.mesh.material.uniforms['v_frame'].value = this.frame;
    this.mesh.material.uniforms['animType'].value = 1;
    TweenMax.to(this.mesh.material.uniforms[ 'opacity' ], 3, {value:1.0, ease:Expo.easeOut})
    window.clearTimeout(this.timeout);
    this.timeout = setTimeout(()=>{
      this.canCountFrames = true;
    }, 0)

    this.animType++;
    if(this.animType > 2)
      this.animType = 0

    _.delay(function(){
      sounds.playRed()
    }, 1500)
  }

  hide() {
    this.mesh.material.uniforms[ 'opacity' ].value = 0.0;
    this.mesh.visible = false;
  }

  update() {

    this.now = performance.now();
    this.distance = this.now - this.time;
    this.time = this.now;

    if(this.mesh.visible) {
        
      if(this.frame / this.total_frames <= 1) {
        this.frame += this.distance / 20;
        this.mesh.material.uniforms['v_frame'].value = this.frame;

        var count = this.frame / this.total_frames;

        if(this.frame / this.total_frames > 0.5 && !this.completed) {
          this.emit("implode:end", count)
          this.completed = true;
        }
      }

      if(this.mesh.rotation.y < 3.8)
        this.mesh.rotation.y += 0.02;
      
    }
  }
}