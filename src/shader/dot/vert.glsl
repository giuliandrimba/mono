#pragma glslify: snoise = require(glsl-noise/simplex/3d)
#pragma glslify: ease = require(glsl-easings/quintic-in-out)


uniform float v_frame;
uniform float amplitude;
uniform float total_frames;
attribute vec3 displacement;
attribute vec3 springs;
attribute vec3 initPos;

vec3 snoiseVec3( vec3 x ){
  float s  = snoise(vec3( x ));
  float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
  float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
  vec3 c = vec3( s , s1 , s2 );
  return c;
}

void main() {

    float motionInPercent = ((v_frame * springs.x) / total_frames);
    float easingPercent = 0.0;
    if(motionInPercent < 1.0) {
      easingPercent = ease(1.0 - motionInPercent);
    }

    vec3 pos = position + normal * displacement * easingPercent;

    vec3 rnd = snoiseVec3(pos - initPos);
    pos += rnd * easingPercent;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}