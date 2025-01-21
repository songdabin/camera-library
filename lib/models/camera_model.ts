import { Extrinsic, ICSPoint, Intrinsic, Vector3Like } from "../types/type";
import { Line3, Matrix4, Quaternion, Vector3 } from "three";
import { multiplyMatrix4, toHomogeneous } from "../types/LtMatrix4";
import {
  createCuboidLines,
  Cuboid,
  CuboidPoints,
  VcsCuboidToCcsPointsArgs,
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

  public projectVcsToCcs(vec3: Vector3): Vector3 {
    const homoVcsPoint = toHomogeneous(vec3.toArray());

    const { qw, qx, qy, qz, tx, ty, tz } = this.vcsExtrinsic;
    const quaternion = new Quaternion(qx, qy, qz, qw);

    const rotationMatrix = new Matrix4()
      .makeRotationFromQuaternion(quaternion)
      .setPosition(tx, ty, tz);

    const ccsPoint = multiplyMatrix4(
      homoVcsPoint,
      rotationMatrix.transpose().toArray()
    );

    return new Vector3(ccsPoint[0], ccsPoint[1], ccsPoint[2]);
  }

  abstract projectCcsToIcs(vec3: Vector3Like): ICSPoint;

  abstract vcsCuboidToIcsCuboidLines(vcsCuboid: Cuboid, order: "zyx"): Line3[];

  public getCcsLinesFromCuboid(cuboid: Cuboid, order: "zyx"): Line3[] {
    const vcsPoints = vcsCuboidToVcsPoints(cuboid, order);

    const ccsPointArray = [];
    for (let i = 0; i < 24; i += 3) {
      const vcsPointVector = new Vector3(
        vcsPoints[i],
        vcsPoints[i + 1],
        vcsPoints[i + 2]
      );
      ccsPointArray.push(this.projectVcsToCcs(vcsPointVector));
    }

    return createCuboidLines(ccsPointArray);
  }
}
