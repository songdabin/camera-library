import * as THREE from "three";
import { ICSPoint, Intrinsic, Vector3Like } from "../types/type";
import { CameraModel } from "./camera_model";

export type CcsToIcsPointsArgs = {
  ccsPoint: THREE.Vector3;
};

export class FisheyeModel extends CameraModel {
  public distortThetas(theta: number) {
    const theta2 = theta ** 2;
    const theta4 = theta ** 4;
    const theta6 = theta2 * theta4;
    const theta8 = theta4 * theta4;
    const thetaD =
      theta *
      (1 +
        this.intrinsic.k1 * theta2 +
        this.intrinsic.k2 * theta4 +
        this.intrinsic.k3 * theta6 +
        this.intrinsic.k4 * theta8);

    return thetaD;
  }

  public projectCcsToIcs(vec3: THREE.Vector3): ICSPoint {
    const uswPoint = vec3.clone().normalize();
    const theta = Math.acos(uswPoint.z);
    const phi = Math.atan2(uswPoint.y, uswPoint.x);

    const fov = this.hfov;
    const thetaSlope =
      1 +
      this.intrinsic.k1 * fov ** 2 +
      this.intrinsic.k2 * fov ** 4 +
      this.intrinsic.k3 * fov ** 6 +
      this.intrinsic.k4 * fov ** 8;

    const distScale =
      theta < fov ? this.distortThetas(theta) : theta * thetaSlope;

    const dnx = distScale * Math.cos(phi);
    const dny = distScale * Math.sin(phi);

    const x = this.intrinsic.fx * dnx + this.intrinsic.cx;
    const y = this.intrinsic.fy * dny + this.intrinsic.cy;
    const isInImage = x >= 0 && x < this.width && y >= 0 && y < this.height;
    return { x, y, isInImage };
  }
}
