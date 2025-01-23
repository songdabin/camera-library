import { Extrinsic, ICSPoint, Intrinsic } from "../types/type";
import { Line3, Matrix4, Quaternion, Vector3, Vector4 } from "three";
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

  public getTransformMatrix(): Matrix4 {
    const { qw, qx, qy, qz, tx, ty, tz } = this.vcsExtrinsic;

    const quaternion = new Quaternion(qx, qy, qz, qw);

    const rotationMatrix = new Matrix4().makeRotationFromQuaternion(quaternion);
    const transformMatrix = rotationMatrix.setPosition(tx, ty, tz).transpose();

    return transformMatrix;
  }

  public projectVcsToCcs(vec3: Vector3): Vector3 {
    const homoVcsPoint = new Vector4(vec3.x, vec3.y, vec3.z);

    const ccsPoint = this.multiplyMatrix4(
      homoVcsPoint,
      this.getTransformMatrix()
    );

    return ccsPoint;
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

  // prettier-ignore
  private multiplyMatrix4(vec4: Vector4, translationMatrix: Matrix4): Vector3 {
    const b = translationMatrix.toArray();
    
    const x = vec4.x, y = vec4.y, z = vec4.z, w = vec4.w;

    return new Vector3(
      x * b[0] + y * b[4] + z * b[8] + w * b[12],
      x * b[1] + y * b[5] + z * b[9] + w * b[13],
      x * b[2] + y * b[6] + z * b[10] + w * b[14],
    );
  }
}
