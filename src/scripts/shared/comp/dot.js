const glslify = require('glslify');
import happens from "happens";
import "scripts/shared/lib/three/ExplodeModifier";

export default class Dot {
  constructor(scene, camera, renderer) {

    happens(this);
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.material = undefined;
    this.geometry = undefined;
    this.mesh = undefined;
    this.time = 1.0;
    this.frame = 0;
    this.total_frames = 60 * 4;

    this.start = Date.now()
    Dot.scope = this;

    this.createMesh()
  } 

  animationIn() {

  }

  createMesh() {
    var geometry = new THREE.IcosahedronGeometry(1, 6);

    var explodeModifier = new THREE.ExplodeModifier();
    explodeModifier.modify( geometry );

    var numFaces = geometry.faces.length;
    var numVertices = geometry.vertices.length

    this.geometry = new THREE.BufferGeometry().fromGeometry( geometry );

    var displacement = new Float32Array( numFaces * 3 * 3 );
    var initPos = new Float32Array( numFaces * 3 * 3 );
    var springs = new Float32Array( numFaces * 3 * 3 );

    for ( var f = 0; f < numFaces; f ++ ) {
        var index = 9 * f;
        // console.log(vindex)
        var spring = 1.0 + Math.random()
        var d = 9 * ( 1.1 - Math.random() );
        for ( var i = 0; i < 3; i ++ ) {

          displacement[ index + ( 3 * i )     ] = d;
          displacement[ index + ( 3 * i ) + 1 ] = d;
          displacement[ index + ( 3 * i ) + 2 ] = d;
        }
      }

    for ( var f = 0; f < geometry.vertices.length; f ++ ) {
      var index = 3 * f;
      initPos[ index ] = geometry.vertices[ f ].x;
      initPos[ index + 1 ] = geometry.vertices[ f ].y;
      initPos[ index + 2 ] = geometry.vertices[ f ].z;

      if(f % 9 === 0)
        var rnd = Math.random() * 0.2;
      var vindex = index / numVertices;
      
      springs[ index     ] = 0.8 + rnd;
      springs[ index + 1 ] = 0.8 + rnd;
      springs[ index + 2 ] = 0.8 + rnd;
    }

    this.geometry.addAttribute( 'displacement', new THREE.BufferAttribute( displacement, 3 ) );
    this.geometry.addAttribute( 'springs', new THREE.BufferAttribute( springs, 3 ) );
    this.geometry.addAttribute( 'initPos', new THREE.BufferAttribute( initPos, 3 ) );

    // this.material = new THREE.MeshBasicMaterial({color:0xFF0000})
    this.material = new THREE.ShaderMaterial({
      uniforms : {
        amplitude : {type: 'f', value: 0.9},
        total_frames : {type: 'f', value: this.total_frames},
        v_frame      :{type: 'f', value: 0.0},
        opacity      : {type: 'f', value: 0.0},
        amplitude: { type: "f", value: 0.1 }
      },
      vertexShader : glslify('../../../shader/dot/vert.glsl'),
      fragmentShader : glslify('../../../shader/dot/frag.glsl'),
      shading     : THREE.FlatShading,
      // wireframe   : true, 
      transparent : true
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);  
    this.mesh.visible = false;

    var time = Date.now() * 0.001;
    // this.mesh.material.uniforms.amplitude.value = 1.0;
  }

  implode() {
    this.mesh.visible = true;
    TweenMax.to(this.mesh.material.uniforms[ 'amplitude' ], 4, {value:1.0, ease:Expo.easeInOut, onComplete:this.onImplode})
    TweenMax.to(this.mesh.material.uniforms[ 'opacity' ], 4, {value:1.0, ease:Expo.easeInOut})
  }

  onImplode() {
    // Dot.scope.renderer.setClearColor( 0xf21a0d, 1 );
  }

  update() {
    this.frame++;
    this.mesh.material.uniforms['v_frame'].value = this.frame;

    if(this.mesh.visible) {
      var amp = this.mesh.material.uniforms[ 'amplitude' ].value
      // this.mesh.scale.set(amp,amp,amp)
      this.mesh.rotation.y += 0.01;
      
    }
  }
}