import { Extrinsic, ICSPoint, Intrinsic } from "../types/type";
import { Line3, Vector3, Vector4 } from "three";
import {
  createCuboidLines,
  Cuboid,
  vcsCuboidToVcsPoints,
} from "../types/Cuboid";
import { CuboidPointCount } from "../types/schema";
import { getTransformMatrix, multiplyMatrix4 } from "./math_utils";

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

  public vcsToCcsPoint(vec3: Vector3): Vector3 {
    const homoVcsPoint = new Vector4(vec3.x, vec3.y, vec3.z);

    const ccsPoint = multiplyMatrix4(
      homoVcsPoint,
      getTransformMatrix(this.vcsExtrinsic)
    );

    return ccsPoint;
  }

  abstract ccsToIcsPoint(vec3: Vector3): ICSPoint;

  abstract vcsCuboidToIcsCuboidLines(
    vcsCuboid: Cuboid,
    order: "zyx"
  ): Array<Line3 | null>;

  public getCcsLinesFromCuboid(cuboid: Cuboid, order: "zyx"): Line3[] {
    const vcsPoints = vcsCuboidToVcsPoints(cuboid, order);

    const ccsPointArray = [];
    for (let i = 0; i < CuboidPointCount; i++) {
      ccsPointArray.push(this.vcsToCcsPoint(vcsPoints[i]));
    }

    return createCuboidLines(ccsPointArray);
  }
}
