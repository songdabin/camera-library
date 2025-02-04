import { Line3, Vector3 } from "three";
import { ICSPoint } from "../types/type";
import { CameraModel } from "./camera_model";
import { Cuboid } from "../types/Cuboid";

export type CcsToIcsPointsArgs = {
  ccsPoint: Vector3;
};

export class FisheyeModel extends CameraModel {
  private distortThetas(theta: number) {
    const { k1, k2, k3, k4 } = this.intrinsic;

    const theta2 = theta ** 2;
    const theta4 = theta ** 4;
    const theta6 = theta2 * theta4;
    const theta8 = theta4 * theta4;

    const thetaD =
      theta * (1 + k1 * theta2 + k2 * theta4 + k3 * theta6 + k4 * theta8);

    return thetaD;
  }

  public projectCcsToIcs(vec3: Vector3): ICSPoint {
    const uswPoint = vec3.clone().normalize();
    const theta = Math.acos(uswPoint.z);
    const phi = Math.atan2(uswPoint.y, uswPoint.x);

    const { fx, fy, cx, cy, k1, k2, k3, k4, k5, k6 } = this.intrinsic;
    const fov = this.hfov / 2;

    const thetaSlope =
      1 + k1 * fov ** 2 + k2 * fov ** 4 + k3 * fov ** 6 + k4 * fov ** 8;

    const distScale =
      theta < fov ? this.distortThetas(theta) : theta * thetaSlope;

    const dnx = distScale * Math.cos(phi);
    const dny = distScale * Math.sin(phi);

    const x = fx * dnx + cx;
    const y = fy * dny + cy;
    const isInImage = x >= 0 && x < this.width && y >= 0 && y < this.height;

    const icsPoint = new Vector3(x, y);

    return { point: icsPoint, isInImage };
  }

  public icsToVcsPoint(icsPoint: Vector3) {}

  public vcsCuboidToIcsCuboidLines(
    vcsCuboid: Cuboid,
    order: "zyx"
  ): Array<Line3 | null> {
    const ccsLines = this.getCcsLinesFromCuboid(vcsCuboid, order);
    const icsLines = this.ccsLinesToIcsLines(ccsLines);
    return icsLines;
  }

  private ccsLinesToIcsLines(ccsLines: Line3[]) {
    const icsLines: Array<Line3 | null> = [];

    ccsLines.forEach((ccsLine) => {
      const icsP1 = this.projectCcsToIcs(ccsLine.start);
      const icsP2 = this.projectCcsToIcs(ccsLine.end);
      if (icsP1.isInImage && icsP2.isInImage)
        icsLines.push(new Line3(icsP1.point, icsP2.point));
      else if (icsP1.isInImage || icsP2.isInImage)
        icsLines.push(
          this.clipInImage([icsP1, icsP2], this.width, this.height)
        );
      else icsLines.push(null);
    });

    return icsLines;
  }

  private clipInImage(
    line: ICSPoint[],
    width: number,
    height: number
  ): Line3 | null {
    const [start, end] = line;

    if (start.isInImage && end.isInImage)
      return new Line3(start.point, end.point);
    if (!start.isInImage && !end.isInImage) return null;

    const [xMin, yMin, xMax, yMax] = [0, 0, width, height];
    const dx = end.point.x - start.point.x;
    const dy = end.point.y - start.point.y;
    const m = dy / dx;

    const clip = ([pointIn, pointOut]: [Vector3, Vector3]): Vector3 => {
      let x = pointOut.x;
      let y = pointOut.y;

      // x = xMin (left 경계)와 교차 여부
      if (pointOut.x < xMin) {
        x = xMin;
        y = pointIn.y + m * (xMin - pointIn.x);
      }
      // x = xMax (right 경계)와 교차 여부
      else if (pointOut.x > xMax) {
        x = xMax;
        y = pointIn.y + m * (xMax - pointIn.x);
      }

      // y = yMin (top 경계)와 교차 여부
      if (y < yMin) {
        y = yMin;
        x = pointIn.x + (yMin - pointIn.y) / m;
      }
      // y = yMax (bottom 경계)와 교차 여부
      else if (y > yMax) {
        y = yMax;
        x = pointIn.x + (yMax - pointIn.y) / m;
      }

      return new Vector3(x, y);
    };

    if (start.isInImage)
      return new Line3(start.point, clip([start.point, end.point]));
    return new Line3(clip([end.point, start.point]), end.point);
  }
}
