import { Line3, Matrix4, Vector3, Vector4 } from "three";
import { ICSPoint } from "../types/type";
import { CameraModel } from "./camera_model";
import { Cuboid } from "../types/Cuboid";
import {
  distortRectilinear,
  getTransformMatrix,
  getTruncatedLinesInCameraFov,
  isInImageCheck,
  multiplyMatrix4,
  project,
  undistortRectilinear,
  unproject,
} from "./math_utils";

export class RectilinearModel extends CameraModel {
  public ccsToIcsPoint(vec3: Vector3): ICSPoint {
    const normalized = vec3.clone().divideScalar(vec3.getComponent(2));

    const distorted = distortRectilinear(normalized, this.intrinsic);

    const projected = project(distorted, this.intrinsic);

    // prettier-ignore
    return {
      point: projected,
      isInImage: isInImageCheck(projected, this.width, this.height),
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

    const ccsPoint = multiplyMatrix4(
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
    const extrinsicInvT = getTransformMatrix(this.vcsExtrinsic)
      .invert()
      .transpose();

    const vcsPoint = multiplyMatrix4(new Vector4(...ccsPoint), extrinsicInvT);

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
