import * as THREE from "three";
import { ICSPoint } from "../types/type";
import { CameraModel } from "./camera_model";

export class RectilinearModel extends CameraModel {
  /**
   * Transform CCS points to ICS points
   *
   * @see https://docs.opencv.org/2.4.13/modules/calib3d/doc/camera_calibration_and_3d_reconstruction.html
   * @param args arguments
   * @param args.vec3 CCS Vector3
   * @return ICSPoint Vector3
   */
  public projectCcsToIcs(vec3: THREE.Vector3): ICSPoint {
    const normalizedPoint = vec3.clone().normalize();

    const distortedIcsPoints = this.distortIcsPoint(normalizedPoint);

    return distortedIcsPoints;
  }

  /**
   * Apply camera distortion to ICS pointsFr
   *
   * @param point undistorted ICS Point
   * @return distorted ICS Point
   */
  public distortIcsPoint(point: THREE.Vector3) {
    // if (!calibration.isDistorted()) return points;

    const intrinsicParams = this.intrinsic;
    const { fx, fy, cx, cy } = intrinsicParams;

    const coefficients = [
      intrinsicParams.k1,
      intrinsicParams.k2,
      intrinsicParams.k3,
      intrinsicParams.k4,
      intrinsicParams.p1,
      intrinsicParams.p2,
    ];

    const x = (point.x - cx) / fx;
    const y = (point.y - cy) / fy;
    const z = point.z;

    const [distortedX, distortedY] = this.distortPointStandardCam(
      x,
      y,
      coefficients
    );

    const isInImage = x >= 0 && x < this.width && y >= 0 && y < this.height;

    const distortedPoint: ICSPoint = {
      x: distortedX * fx + cx,
      y: distortedY * fy + cy,
      isInImage: isInImage,
    };

    return distortedPoint;
  }

  /**
   * Distort point with standard camera coefficients
   *
   * @see https://docs.opencv.org/4.x/dc/dbb/tutorial_py_calibration.html
   * @param x
   * @param y
   * @param coefficients
   * @returns [distortedX, distortedY]
   */
  public distortPointStandardCam(x: number, y: number, coefficients: number[]) {
    const [k1, k2, k3, k4, p1, p2] = coefficients;

    const r2 = x ** 2 + y ** 2;
    const radialD = (1 + k1 * r2 + k2 * r2 ** 2 + k3 * r2 ** 3) / (1 + k4 * r2);
    const distortedX = radialD * x + 2 * p1 * (x * y) + p2 * (r2 + 2 * x ** 2);
    const distortedY = radialD * y + p1 * (r2 + 2 * y ** 2) + 2 * p2 * (x * y);

    return [distortedX, distortedY];
  }
}
