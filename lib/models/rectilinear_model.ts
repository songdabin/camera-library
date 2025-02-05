import { Line3, Matrix4, Vector3, Vector4 } from "three";
import { ICSPoint } from "../types/type";
import { CameraModel } from "./camera_model";
import { Cuboid } from "../types/Cuboid";
import {
  distortRectilinear,
  getTruncatedLinesInCameraFov,
  project,
  undistortRectilinear,
  unproject,
} from "./math_utils";

export class RectilinearModel extends CameraModel {
  private isInImageCheck(x: number, y: number) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public ccsToIcsPoint(vec3: Vector3): ICSPoint {
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

    const undistorted = undistortRectilinear(point, this.intrinsic);

    point = project(undistorted, this.intrinsic);

    return point;
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
    const { lines, positiveMask } = getTruncatedLinesInCameraFov(
      ccsLines,
      this.hfov
    );
    const icsLines: Array<Line3 | null> = lines.map((line, i) => {
      if (positiveMask[i]) {
        const start = this.ccsToIcsPoint(line.start).point;
        const end = this.ccsToIcsPoint(line.end).point;
        return new Line3(start, end);
      } else {
        return null;
      }
    });

    return icsLines;
  }
}
