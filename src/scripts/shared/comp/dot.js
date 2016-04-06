const glslify = require('glslify');
import happens from "happens";
import "scripts/shared/lib/three/ExplodeModifier";

export default class Dot {
  constructor(scene, camera, renderer) {

    happens(this);
    this.scene = scene;
    this.material = undefined;
    this.geometry = undefined;
    this.mesh = undefined;
    this.time = 1.0;

    this.start = Date.now()
    Dot.scope = this;

    this.createMesh()
    // this.explode()
  } 

  animationIn() {

  }

  createMesh() {
    var geometry = new THREE.IcosahedronGeometry(1, 6);

    var explodeModifier = new THREE.ExplodeModifier();
    explodeModifier.modify( geometry );

    var numFaces = geometry.faces.length;

    this.geometry = new THREE.BufferGeometry().fromGeometry( geometry );

    var displacement = new Float32Array( numFaces * 3 * 3 );

    for ( var f = 0; f < numFaces; f ++ ) {
        var index = 9 * f;
        var d = 4 * ( 1.1 - Math.random() );
        for ( var i = 0; i < 3; i ++ ) {
          displacement[ index + ( 3 * i )     ] = d;
          displacement[ index + ( 3 * i ) + 1 ] = d;
          displacement[ index + ( 3 * i ) + 2 ] = d;
        }
      }

    this.geometry.addAttribute( 'displacement', new THREE.BufferAttribute( displacement, 3 ) );

    // this.material = new THREE.MeshBasicMaterial({color:0xFF0000})
    this.material = new THREE.ShaderMaterial({
      uniforms : {
        time        : {type: 'f', value: this.time},
        opacity     : {type: 'f', value: 0.0},
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
    this.mesh.material.uniforms.amplitude.value = 1.0;
  }

  explode() {
    let total = this.mesh.geometry.vertices.length;
    for(var i = 0; i < total; i++) {
      let vec = this.mesh.geometry.vertices[i].multiplyScalar(Math.random())
       this.mesh.geometry.vertices[i].originalVec = this.mesh.geometry.vertices[i]
      this.mesh.geometry.vertices[i].add(vec);
    }
  }

  impplode() {
    this.mesh.visible = true;
    TweenMax.to(this.mesh.material.uniforms[ 'amplitude' ], 3, {value:0.0, ease:Expo.easeInOut})
    TweenMax.to(this.mesh.material.uniforms[ 'opacity' ], 1, {value:1.0, ease:Expo.easeInOut})
  }

  update() {

    this.mesh.rotation.y += 0.005;

    // var time = Date.now() * 0.001;
    // this.time -= .00025 * ( Date.now() - this.start );
    // if(this.time > 0)
      // this.mesh.material.uniforms.time.value = this.time;
    // TweenMax.to(this.mesh.material.uniforms[ 'time' ], 2.5, {value:Math.random(), ease:Expo.easeInOut, delay:2})
  }
}