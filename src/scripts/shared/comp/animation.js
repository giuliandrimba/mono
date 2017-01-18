require("../lib/three/three.bas")

function Animation(model) {
  // create a geometry that will be used by THREE.BAS.ModelBufferGeometry

  model.computeBoundingBox();
  model.computeVertexNormals();
  THREE.BAS.Utils.separateFaces(model);

  var geometry = new THREE.BAS.ModelBufferGeometry(model, {
    localizeFaces: true,
    computeCentroids: true
  });

  var normal = geometry.createAttribute('normal', 3);

  for (var i = 0; i < model.faces.length; i++) {
    var face = model.faces[i];

    var ia = face.a * 3;
    normal.array[ia    ] = face.vertexNormals[0].x;
    normal.array[ia + 1] = face.vertexNormals[0].y;
    normal.array[ia + 2] = face.vertexNormals[0].z;

    var ib = face.b * 3;
    normal.array[ib    ] = face.vertexNormals[1].x;
    normal.array[ib + 1] = face.vertexNormals[1].y;
    normal.array[ib + 2] = face.vertexNormals[1].z;

    var ic = face.c * 3;
    normal.array[ic    ] = face.vertexNormals[2].x;
    normal.array[ic + 1] = face.vertexNormals[2].y;
    normal.array[ic + 2] = face.vertexNormals[2].z;
  }

  var maxDelayX = 0.5;
  var maxDelayY = 1.0;
  var minDuration = 0.5;
  var maxDuration = 1.0;
  var bounds = model.boundingBox;

  this.totalDuration = maxDelayX + maxDelayY + maxDuration;
  var aDelayDuration = geometry.createAttribute('aDelayDuration', 2);
  var offset = 0;

  for (i = 0; i < geometry.faceCount; i++) {
    var c = geometry.centroids[i];
    var delayX = mapEase(Power2.easeOut, Math.abs(c.x), 0, bounds.max.x, 0.0, maxDelayX);
    var delayY = mapEase(Power2.easeOut, c.y, bounds.max.y, bounds.min.y, 0.0, maxDelayY);

    var delay = (delayX + delayY) * THREE.Math.randFloat(0.9, 1.0);
    var duration = THREE.Math.randFloat(minDuration, maxDuration);

    for (var j = 0; j < 3; j++) {
      aDelayDuration.array[offset++] = delay + j * 0.015;
      aDelayDuration.array[offset++] = duration;
    }
  }

  var aStartPosition = geometry.createAttribute('aStartPosition', 3, function(data, i) {
    var c = geometry.centroids[i];

    data[0] = c.x - THREE.Math.randFloat(-4, 4);
    data[1] = 0;
    data[2] = c.z - THREE.Math.randFloat(-4, 4);
  });

  var aEndPosition = geometry.createAttribute('aEndPosition', 3, function(data, i) {
    geometry.centroids[i].toArray(data);
  });

  var aPivot = geometry.createAttribute('aPivot', 3, function(data, i) {
    var c = geometry.centroids[i];
    var l = THREE.Math.randFloat(0.5, 4.0);

    data[0] = 0;
    data[1] = c.y * l;
    data[2] = 0;
  });

  var axis = new THREE.Vector3();
  var aAxisAngle = geometry.createAttribute('aAxisAngle', 4, function(data, i) {
    axis.copy(geometry.centroids[i]).normalize().toArray(data);
    data[3] = Math.PI;
  });

  var material = new THREE.BAS.StandardAnimationMaterial({
    shading: THREE.SmoothShading,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: {value: this.totalDuration},
      uDistortion     : {type: 'f', value: 0.0}
      // specular       : {value: 0.1}
      // diffuse          : {value: new THREE.Color(0x4c4c4c)},
      // shininess      : {type: 'f', value: 2.9},
      // lightDirection : {type: 'v3', value: new THREE.Vector3(800,1800,5000)},
      // opacity     : {type: 'f', value: 1.0}
    },
    uniformValues: {
      diffuse: new THREE.Color(0x4c4c4c),
      metalness: 0.0,
      roughness: 0.25,
      shininess: 2.9
    },
    vertexFunctions: [
      THREE.BAS.ShaderChunk.cubic_bezier,
      THREE.BAS.ShaderChunk.quaternion_rotation,
      THREE.BAS.ShaderChunk.ease_back_out,
      THREE.BAS.ShaderChunk.ease_circ_in_out
    ],
    vertexParameters: [
      'uniform float uTime;',
      'uniform float uDistortion;',

      'attribute vec2 aDelayDuration;',

      'attribute vec3 aStartPosition;',
      'attribute vec3 aEndPosition;',

      'attribute vec4 aAxisAngle;',
      'attribute vec3 aPivot;'
    ],
    varyingParameters: [
      'varying float vProgress;'
    ],
    vertexInit: [
      'float progress = clamp(uTime - aDelayDuration.x, 0.0, aDelayDuration.y) / aDelayDuration.y;',
      'float eased = easeCircInOut(progress);',

      'vec4 quat = quatFromAxisAngle(aAxisAngle.xyz, aAxisAngle.w * (1.0 - eased));',

      'vProgress = eased;'
    ],
    vertexNormal: [
      'objectNormal = rotateVector(quat, objectNormal);'
    ],
    vertexPosition: [
      'transformed *= progress;',
    
      'transformed += aPivot;',
      'transformed = rotateVector(quat, transformed);',
      'transformed -= aPivot;',


      'transformed += mix(aStartPosition, aEndPosition, easeBackOut(progress, 4.0));',
      'transformed.y += transformed.y * uDistortion - uDistortion;',

    ],
    fragmentInit: [
      'if (vProgress == 0.0) discard;'
    ]
  });

  THREE.Mesh.call(this, geometry, material);

  this.frustumCulled = false;

}
Animation.prototype = Object.create(THREE.Mesh.prototype);
Animation.prototype.constructor = Animation;

Object.defineProperty(Animation.prototype, 'time', {
  get: function () {
    return this.material.uniforms['uTime'].value;
  },
  set: function (v) {
    this.material.uniforms['uTime'].value = v;
  }
});

Animation.prototype.animate = function (duration, options) {
  options = options || {};
  options.time = 0.0;

  // var timeline = new TimelineMax({repeat:-1, yoyo:true})
  TweenMax.fromTo(this, duration, {time: this.totalDuration * 0.9}, options)
  // timeline.add(TweenMax.fromTo(this, duration, {time: this.totalDuration}, options))
};

function ease(e, t, b, c, d) {
  return b + e.getRatio(t / d) * c;
}

function mapEase(e, v, a1, a2, b1, b2) {
  var t = v - a1;
  var b = b1;
  var c = b2 - b1;
  var d = a2 - a1;

  return ease(e, t, b, c, d);
}

export default Animation;