#pragma glslify: snoise = require(glsl-noise/simplex/3d)
#pragma glslify: ease = require(glsl-easings/exponential-in-out)

uniform float v_frame;
uniform float total_frames;
attribute vec3 displacement;
attribute vec3 springs;
attribute vec3 initPos;

void main() {
    float motionInPercent = ((v_frame * springs.x) / total_frames);
    float easingPercent = 0.0;
    if(motionInPercent < 1.0) {
      easingPercent = ease(1.0 - motionInPercent);
    }
    vec3 pos = position + normal * displacement * easingPercent;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}