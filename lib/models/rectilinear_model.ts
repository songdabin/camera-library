import * as THREE from "three";
import { ICSPoint } from "../types/type";
import { CameraModel } from "./camera_model";

export class RectilinearModel extends CameraModel {
  public distortVec3(x: number, y: number, distortionParams: number[]) {
    const [k1, k2, k3, k4, k5, k6, p1, p2] = distortionParams;

    const r2 = x ** 2 + y ** 2;
    const radialD =
      (1 + k1 * r2 + k2 * r2 ** 2 + k3 * r2 ** 3) /
      (1 + k4 * r2 + k5 * r2 ** 2 + k6 * r2 ** 3);
    const distortedX = x * radialD + 2 * p1 * (x * y) + p2 * (r2 + 2 * x ** 2);
    const distortedY = y * radialD + p1 * (r2 + 2 * y ** 2) + 2 * p2 * (x * y);

    return [distortedX, distortedY];
  }

  public projectCcsToIcs(vec3: THREE.Vector3): ICSPoint {
    const normalizedPoint = vec3.clone().divideScalar(vec3.getComponent(2));

    const { fx, fy, cx, cy, k1, k2, k3, k4, k5, k6, p1, p2 } = this.intrinsic;

    const x = (normalizedPoint.x - cx) / fx;
    const y = (normalizedPoint.y - cy) / fy;

    const distortionParams = [k1, k2, k3, k4, k5, k6, p1, p2];
    const [distortedX, distortedY] = this.distortVec3(x, y, distortionParams);

    const distortedPoint: ICSPoint = {
      x: distortedX * fx + cx,
      y: distortedY * fy + cy,
      isInImage: x >= 0 && x < this.width && y >= 0 && y < this.height,
    };

    return distortedPoint;
  }
}
