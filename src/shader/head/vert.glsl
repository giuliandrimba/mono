varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vLight;

uniform vec3 lightDirection;
uniform float time;
uniform float distortion;

void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position , 1.0 );

    vNormal = normal * normalMatrix;
    vPosition = mvPosition.xyz;
    vLight = normalize(lightDirection - vPosition);
    
    mvPosition.y += mvPosition.y * distortion - distortion;

    gl_Position = projectionMatrix * mvPosition;
}