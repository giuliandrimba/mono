import OBJLoader from "three-obj-loader";
OBJLoader(window.THREE);

var loader = undefined;

export default function(path, done) {
  loader = new THREE.OBJLoader()
  loader.load(path, function(object) {
      object.traverse(function(child) {
        if( child instanceof THREE.Mesh) {
          let geometry = new THREE.Geometry().fromBufferGeometry( child.geometry );
          done(geometry)
        }
      })
    })
}