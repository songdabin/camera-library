import { Extrinsic, ICSPoint, Intrinsic } from "../types/type";
import { Line3, Matrix4, Quaternion, Vector3 } from "three";
import { multiplyMatrix4, toHomogeneous } from "../types/LtMatrix4";
import {
  createCuboidLines,
  Cuboid,
  vcsCuboidToVcsPoints,
} from "../types/Cuboid";

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

  public getRotationMatrix(): Matrix4 {
    const { qw, qx, qy, qz } = this.vcsExtrinsic;

    const quaternion = new Quaternion(qx, qy, qz, qw);

    const rotationMatrix = new Matrix4().makeRotationFromQuaternion(quaternion);
    return rotationMatrix;
  }

  public projectVcsToCcs(vec3: Vector3): Vector3 {
    const homoVcsPoint = toHomogeneous(vec3.toArray());

    const { tx, ty, tz } = this.vcsExtrinsic;

    const ccsPoint = multiplyMatrix4(
      homoVcsPoint,
      this.getRotationMatrix().setPosition(tx, ty, tz).transpose().toArray()
    );

    return new Vector3(ccsPoint[0], ccsPoint[1], ccsPoint[2]);
  }

  abstract projectCcsToIcs(vec3: Vector3): ICSPoint;

  abstract vcsCuboidToIcsCuboidLines(vcsCuboid: Cuboid, order: "zyx"): Line3[];

  public getCcsLinesFromCuboid(cuboid: Cuboid, order: "zyx"): Line3[] {
    const vcsPoints = vcsCuboidToVcsPoints(cuboid, order);

    const ccsPointArray = [];
    for (let i = 0; i < 8; i++) {
      ccsPointArray.push(this.projectVcsToCcs(vcsPoints[i]));
    }

    return createCuboidLines(ccsPointArray);
  }
}
