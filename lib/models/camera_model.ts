import {
  Cuboid,
  Extrinsic,
  ICSPoint,
  Intrinsic,
  VcsCuboidToCcsPointsArgs,
  Vector3Like,
} from "../types/type";
import { Line3, Matrix4, Quaternion, Vector3 } from "three";
import {
  getHomogeneousTransformMatrix,
  LtMatrix4,
  matrix4to3,
  multiplyMatrix4,
  toHomogeneous,
} from "../types/LtMatrix4";

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
    const { qw, qx, qy, qz } = this.vcsExtrinsic;
    const quaternion = new Quaternion(qx, qy, qz, qw);

    const rotationMatrix = new Matrix4().makeRotationFromQuaternion(quaternion);

    const rotatedVcsPoint = vec3.clone().applyMatrix4(rotationMatrix);

    const { tx, ty, tz } = this.vcsExtrinsic;
    const translationVector = new Vector3(tx, ty, tz);

    return rotatedVcsPoint.add(translationVector);
  }

  abstract projectCcsToIcs(vec3: Vector3Like): ICSPoint;

  abstract vcsCuboidToIcsCuboidLines(vcsCuboid: Cuboid, order: "zyx"): Line3[];

  public getCcsLinesFromCuboid(cuboid: Cuboid, order: "zyx"): Line3[] {
    const ccsPoints = this.vcsCuboidToCcsPoints({
      vcsCuboid: cuboid,
      order,
    });

    const flb: Vector3 = ccsPoints[0]; // front left bottom
    const frb: Vector3 = ccsPoints[1]; // front right bottom
    const frt: Vector3 = ccsPoints[2]; // front right top
    const flt: Vector3 = ccsPoints[3]; // front left top
    const rlb: Vector3 = ccsPoints[4]; // rear left bottom
    const rrb: Vector3 = ccsPoints[5]; // rear right bottom
    const rrt: Vector3 = ccsPoints[6]; // rear right top
    const rlt: Vector3 = ccsPoints[7]; // rear left top

    // prettier-ignore
    // Left -> Right, Front -> Rear, Bottom -> Top
    const lineLists = [
      [flt, frt], [flt, rlt], [rlt, rrt], [frt, rrt],
      [flb, frb], [rlb, rrb], [flb, rlb], [frb, rrb],
      [flb, flt], [frb, frt], [rlb, rlt], [rrb, rrt],
    ];

    const lines: Line3[] = lineLists.map(
      ([start, end]) => new Line3(start, end)
    );

    return lines;
  }

  private vcsCuboidToCcsPoints({
    vcsCuboid,
    order = "zyx",
  }: VcsCuboidToCcsPointsArgs) {
    const vcsPoints = this.vcsCuboidToVcsPoints(vcsCuboid, order);

    const vcsPointArray = [];

    for (let i = 0; i < 24; i += 3) {
      vcsPointArray.push(
        new Vector3(vcsPoints[i], vcsPoints[i + 1], vcsPoints[i + 2])
      );
    }

    const ccsPointsArray: Vector3[] = [];

    vcsPointArray.forEach((vcsPoint) => {
      ccsPointsArray.push(this.projectVcsToCcs(vcsPoint));
    });

    return ccsPointsArray;
  }

  public vcsCuboidToVcsPoints(cuboid: Cuboid, order: "zyx") {
    // prettier-ignore
    const {
        x: tx, y: ty, z: tz,
        yaw, roll, pitch,
        width, height, length,
      } = cuboid;
    const transformMatrix = getHomogeneousTransformMatrix({
      angle: { yaw, roll, pitch },
      translation: { tx, ty, tz },
      order,
    });

    const [y, z, x] = [width / 2, height / 2, length / 2];
    // prettier-ignore
    const points = [
      x, y, -z, 1, // front left bottom
      x, -y, -z, 1, // front right bottom
      x, -y, z, 1, // front right top
      x, y, z, 1, // front left top
      
      -x, y, -z, 1, // rear left bottom
      -x, -y, -z, 1, // rear right bottom
      -x, -y, z, 1, // rear right top
      -x, y, z, 1, // rear left top
    ];
    const vcsPoints = multiplyMatrix4(
      points,
      transformMatrix.transpose().elements()
    );

    return matrix4to3(vcsPoints);
  }
}
