import * as THREE from "three";

const quaternion = new THREE.Quaternion();
quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

const vector = new THREE.Vector3(1, 0, 0);

vector.applyQuaternion(quaternion);

console.log(vector);
