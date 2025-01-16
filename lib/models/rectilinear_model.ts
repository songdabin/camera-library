import { Line3, Matrix4, Quaternion, Vector3 } from "three";
import { Cuboid, ICSPoint } from "../types/type";
import { CameraModel } from "./camera_model";
import {
  multiplyMatrix4byIntrinsicTranspose,
  toHomogeneous,
  transpose,
} from "../types/LtMatrix4";

export class RectilinearModel extends CameraModel {
  private distortVec3(x: number, y: number) {
    const { k1, k2, k3, k4, k5, k6, p1, p2 } = this.intrinsic;

    const r2 = x ** 2 + y ** 2;
    const radialD =
      (1 + k1 * r2 + k2 * r2 ** 2 + k3 * r2 ** 3) /
      (1 + k4 * r2 + k5 * r2 ** 2 + k6 * r2 ** 3);
    const distortedX = x * radialD + 2 * p1 * (x * y) + p2 * (r2 + 2 * x ** 2);
    const distortedY = y * radialD + p1 * (r2 + 2 * y ** 2) + 2 * p2 * (x * y);

    return [distortedX, distortedY];
  }

  public projectCcsToIcs(vec3: Vector3): ICSPoint {
    const { fx, fy, cx, cy } = this.intrinsic;

    const homoCcsPoints = toHomogeneous(vec3.toArray());

    // prettier-ignore
    const intrinsicArray = [
      fx, 0, cx, 0,
      0, fy, cy, 0,
      0, 0, 1, 0,
    ];
    const intrinsicT = transpose(intrinsicArray, 4);
    const icsPoints = multiplyMatrix4byIntrinsicTranspose(
      homoCcsPoints,
      intrinsicT
    );

    const icsPointVec = new Vector3(icsPoints[0], icsPoints[1], icsPoints[2]);

    const normalizedPoint = icsPointVec.clone().divideScalar(icsPoints[2]);

    const x = (normalizedPoint.x - cx) / fx;
    const y = (normalizedPoint.y - cy) / fy;

    const [distortedX, distortedY] = this.distortVec3(x, y);

    const result_x = distortedX * fx + cx;
    const result_y = distortedY * fy + cy;

    const distortedPoint: ICSPoint = {
      x: result_x,
      y: result_y,
      isInImage:
        result_x >= 0 &&
        result_x < this.width &&
        result_y >= 0 &&
        result_y < this.height,
    };

    return distortedPoint;
  }

  public vcsCuboidToIcsCuboidLines(vcsCuboid: Cuboid, order: "zyx"): Line3[] {
    const ccsLines = this.getCcsLinesFromCuboid(vcsCuboid, order);
    const icsLines = this.ccsLinesToIcsLines(ccsLines);
    return icsLines;
  }

  public icsToVcsPoints(icsPoint: number[]) {
    const icsPointVec = new Vector3(icsPoint[0], icsPoint[1], icsPoint[2]);

    const { tx, ty, tz } = this.vcsExtrinsic;
    const translationVector = new Vector3(tx, ty, tz);

    const denormalized = icsPointVec.multiplyScalar(icsPoint[2]);

    const { fx, fy, cx, cy } = this.intrinsic;

    const undistorted = new Vector3(
      (denormalized.x - cx) / fx,
      (denormalized.y - cy) / fy,
      denormalized.z
    );

    const { qw, qx, qy, qz } = this.vcsExtrinsic;
    const quaternion = new Quaternion(qx, qy, qz, qw);

    const rotationMatrix = new Matrix4().makeRotationFromQuaternion(quaternion);

    const vcsPoint = undistorted.sub(translationVector);
    // divide vcsPoint by rotation Matrix?

    return vcsPoint;
  }

  private ccsLinesToIcsLines(ccsLines: Line3[]) {
    return [new Line3(new Vector3(0, 0, 0), new Vector3(2, 3, 4))];
  }

  /*
  private ccsLinesToIcsLines(ccsLines: [Vector3, Vector3][]) {
    const v1 = new Vector3(...icsToVcsPoints([0, this.height / 2, 150]));
    const v2 = new Vector3(
      ...icsToVcsPoints([this.width, this.height / 2, 150])
    );
    const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const angle =
      Math.acos(dotProduct / (v1.length() * v2.length())) * (180 / Math.PI);

    const { lines, positiveMask } = getTruncatedLinesInCameraFov(
      ccsLines,
      this.channel,
      angle
    );

    const icsLines: Line3[] = lines.map((line: Line3, i: number) => {
      if (positiveMask[i]) {
        const icsP1 = this.projectCcsToIcs(line.start);
        const icsP2 = this.projectCcsToIcs(line.end);
        return [
          { x: icsP1.x, y: icsP1.y },
          { x: icsP2.x, y: icsP2.y },
        ];
      } else {
        return null;
      }
    });

    return icsLines;
  }
  */
}
