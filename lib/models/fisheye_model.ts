import * as THREE from "three";
import { ICSPoint } from "../types/type";
import { CameraModel } from "./camera_model";

export type CcsToIcsPointsArgs = {
  ccsPoint: THREE.Vector3;
};

export class FisheyeModel extends CameraModel {
  public distortThetas(theta: number) {
    const { k1, k2, k3, k4 } = this.intrinsic;

    const theta2 = theta ** 2;
    const theta4 = theta ** 4;
    const theta6 = theta2 * theta4;
    const theta8 = theta4 * theta4;

    const thetaD =
      theta * (1 + k1 * theta2 + k2 * theta4 + k3 * theta6 + k4 * theta8);

    return thetaD;
  }

  public projectCcsToIcs(vec3: THREE.Vector3): ICSPoint {
    const uswPoint = vec3.clone().normalize();
    const theta = Math.acos(uswPoint.z);
    const phi = Math.atan2(uswPoint.y, uswPoint.x);

    const { fx, fy, cx, cy, k1, k2, k3, k4, k5, k6 } = this.intrinsic;
    const fov = this.hfov;

    const thetaSlope =
      1 + k1 * fov ** 2 + k2 * fov ** 4 + k3 * fov ** 6 + k4 * fov ** 8;

    const distScale =
      theta < fov ? this.distortThetas(theta) : theta * thetaSlope;

    const dnx = distScale * Math.cos(phi);
    const dny = distScale * Math.sin(phi);

    const x = fx * dnx + cx;
    const y = fy * dny + cy;
    const isInImage = x >= 0 && x < this.width && y >= 0 && y < this.height;

    return { x, y, isInImage };
  }
}
