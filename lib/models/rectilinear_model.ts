import { Line3, Matrix4, Vector3, Vector4 } from "three";
import { ICSPoint, Intrinsic } from "../types/type";
import { CameraModel } from "./camera_model";
import { Cuboid } from "../types/Cuboid";
import {
  distortRectilinear,
  getTruncatedLinesInCameraFov,
  project,
  unproject,
} from "./math_utils";

export class RectilinearModel extends CameraModel {
  private isInImageCheck(x: number, y: number) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public projectCcsToIcs(vec3: Vector3): ICSPoint {
    const normalized = vec3.clone().divideScalar(vec3.getComponent(2));

    const distorted = distortRectilinear(normalized, this.intrinsic);

    const projected = project(distorted, this.intrinsic);

    return {
      point: projected,
      isInImage: this.isInImageCheck(projected.x, projected.y),
    };
  }

  public vcsCuboidToIcsCuboidLines(
    vcsCuboid: Cuboid,
    order: "zyx"
  ): Array<Line3 | null> {
    const ccsLines = this.getCcsLinesFromCuboid(vcsCuboid, order);
    const icsLines = this.ccsLinesToIcsLines(ccsLines);
    return icsLines;
  }

  public icsToCcsPoint(icsPoint: Vector3): Vector3 {
    const { fx, fy, cx, cy } = this.intrinsic;

    // prettier-ignore
    const intrinsicInvertTransposed = new Matrix4(
      fx, 0, cx, 0,
      0, fy, cy, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ).invert();

    const undistorted = this.undistortIcsPoint(icsPoint);

    undistorted.set(
      undistorted.x * undistorted.z,
      undistorted.y * undistorted.z,
      undistorted.z
    );

    const ccsPoint = this.multiplyMatrix4(
      new Vector4(...undistorted),
      intrinsicInvertTransposed
    );

    return ccsPoint;
  }

  private undistortIcsPoint(point: Vector3) {
    point = unproject(point, this.intrinsic);

    const undistorted = this.undistortPointStandardCam(point, this.intrinsic);

    point = project(undistorted, this.intrinsic);

    return point;
  }

  private undistortPointStandardCam(
    point: Vector3,
    intrinsic: Intrinsic
  ): Vector3 {
    const { k1, k2, k3, k4, p1, p2 } = intrinsic;
    const { x, y } = point;

    const x0 = x;
    const y0 = y;

    let undistortedX = x;
    let undistortedY = y;

    for (let i = 0; i < 5; i += 1) {
      const r2 = undistortedX ** 2 + undistortedY ** 2;
      const radialDInv =
        (1 + k4 * r2) / (1 + k1 * r2 + k2 * r2 ** 2 + k3 * r2 ** 3);
      const deltaX =
        2 * p1 * undistortedX * undistortedY +
        p2 * (r2 + 2 * undistortedX ** 2);
      const deltaY =
        p1 * (r2 + 2 * undistortedY ** 2) +
        2 * p2 * undistortedX * undistortedY;

      undistortedX = (x0 - deltaX) * radialDInv;
      undistortedY = (y0 - deltaY) * radialDInv;
    }

    return point.set(undistortedX, undistortedY, point.z);
  }

  private ccsToVcsPoint(ccsPoint: Vector3) {
    const extrinsicInvT = this.getTransformMatrix().invert().transpose();

    const vcsPoint = this.multiplyMatrix4(
      new Vector4(...ccsPoint),
      extrinsicInvT
    );

    return vcsPoint;
  }

  public icsToVcsPoint(icsPoint: Vector3): Vector3 {
    const ccsPoint = this.icsToCcsPoint(icsPoint);

    const vcsPoint = this.ccsToVcsPoint(ccsPoint);

    return vcsPoint;
  }

  private ccsLinesToIcsLines(ccsLines: Line3[]) {
    const { width, height, hfov } = this;
    const v1 = this.icsToVcsPoint(new Vector3(0, height / 2, 150));
    const v2 = this.icsToVcsPoint(new Vector3(width, height / 2, 150));
    const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const angle =
      Math.acos(dotProduct / (v1.length() * v2.length())) * (180 / Math.PI);

    const { lines, positiveMask } = getTruncatedLinesInCameraFov(
      ccsLines,
      hfov
    );
    const icsLines: Array<Line3 | null> = lines.map((line, i) => {
      if (positiveMask[i]) {
        const start = this.projectCcsToIcs(line.start).point;
        const end = this.projectCcsToIcs(line.end).point;
        return new Line3(start, end);
      } else {
        return null;
      }
    });

    return icsLines;
  }
}
