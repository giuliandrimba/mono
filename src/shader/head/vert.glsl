varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vLight;

uniform vec3 lightDirection;
uniform float time;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position , 1.0 );

    vNormal = normal * normalMatrix;
    vPosition = mvPosition.xyz;
    vLight = normalize(lightDirection - vPosition);

    gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position,1.0);
}