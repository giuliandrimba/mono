varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vLight;

uniform sampler2D tDiffuse;
uniform vec3 color;
uniform vec3 ambient;
uniform vec3 lightDirection;
uniform float specular;
uniform float shininess;
uniform float time;
uniform float opacity;

float lambert(vec3 n, vec3 d)
{
    return dot(n, d);
}

float phong(vec3 light, vec3 normal, vec3 eyeDirection, float shininess)
{
    return pow(max(dot(reflect(light, normal), eyeDirection), 0.0), shininess);
}

vec3 faceNormals(vec3 pos) {
  vec3 fdx = dFdx(pos);
  vec3 fdy = dFdy(pos);
  return normalize(cross(fdx, fdy));
}

void main()
{
    vec3 normal = vNormal;
    normal = faceNormals(vPosition);

    vec2 uv = vUv;

    vec3 diffuse = color;

    vec3 eyeDirection = normalize(vPosition);
    vec3 light = ambient + 
            diffuse * lambert(normal, vLight) + 
            specular * phong( 
                vLight, 
                normal, 
                eyeDirection, 
                shininess 
            );
   
    gl_FragColor = vec4(light, opacity);
}
