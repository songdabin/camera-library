import {
  CCSPoint,
  Extrinsic,
  ICSPoint,
  Intrinsic,
  Vector3Like,
} from "../types/type";
import * as THREE from "three";

export abstract class CameraModel {
  channel: string;
  sensor: string;
  distortionModel: string;
  hfov: number;
  height: number;
  width: number;
  intrinsic: Intrinsic;
  vcsExtrinsic: Extrinsic;
  lcsExtrinsic: Extrinsic;
  mvcsExtrinsic: Extrinsic;

  constructor(
    channel: string,
    sensor: string,
    distortionModel: string,
    hfov: number,
    height: number,
    width: number,
    intrinsic: Intrinsic,
    vcsExtrinsic: Extrinsic,
    lcsExtrinsic: Extrinsic,
    mvcsExtrinsic: Extrinsic
  ) {
    const updatedIntrinsic = {
      ...intrinsic,
      k5: intrinsic.k5 ?? 0,
      k6: intrinsic.k6 ?? 0,
    };
    this.channel = channel;
    this.sensor = sensor;
    this.distortionModel = distortionModel;
    this.hfov = hfov;
    this.height = height;
    this.width = width;
    this.intrinsic = updatedIntrinsic;
    this.vcsExtrinsic = vcsExtrinsic;
    this.lcsExtrinsic = lcsExtrinsic;
    this.mvcsExtrinsic = mvcsExtrinsic;
  }

  public projectVcsToCcs(vec3: THREE.Vector3): THREE.Vector3 {
    const { qw, qx, qy, qz } = this.vcsExtrinsic;
    const quaternion = new THREE.Quaternion(qx, qy, qz, qw);

    const rotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(
      quaternion
    );

    const rotatedVcsPoint = vec3.clone().applyMatrix4(rotationMatrix);

    const { tx, ty, tz } = this.vcsExtrinsic;
    const translationVector = new THREE.Vector3(tx, ty, tz);

    return rotatedVcsPoint.add(translationVector);
  }

  abstract projectCcsToIcs(vec3: Vector3Like): ICSPoint;
}
