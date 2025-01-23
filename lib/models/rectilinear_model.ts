import { Line3, Vector3 } from "three";
import { ICSPoint } from "../types/type";
import { CameraModel } from "./camera_model";
import { Cuboid } from "../types/Cuboid";

export class RectilinearModel extends CameraModel {
  private distort(x: number, y: number) {
    const { k1, k2, k3, k4, k5, k6, p1, p2 } = this.intrinsic;

    const r2 = x ** 2 + y ** 2;
    const radialD =
      (1 + k1 * r2 + k2 * r2 ** 2 + k3 * r2 ** 3) /
      (1 + k4 * r2 + k5 * r2 ** 2 + k6 * r2 ** 3);
    const distortedX = x * radialD + 2 * p1 * (x * y) + p2 * (r2 + 2 * x ** 2);
    const distortedY = y * radialD + p1 * (r2 + 2 * y ** 2) + 2 * p2 * (x * y);

    return [distortedX, distortedY];
  }

  private project(x: number, y: number) {
    const { fx, fy, cx, cy } = this.intrinsic;

    const projectedX = x * fx + cx;
    const projectedY = y * fy + cy;

    return [projectedX, projectedY];
  }

  private isInImageCheck(x: number, y: number) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public projectCcsToIcs(vec3: Vector3): ICSPoint {
    const normalized = vec3.clone().divideScalar(vec3.getComponent(2));

    const [distortedX, distortedY] = this.distort(
      normalized.getComponent(0),
      normalized.getComponent(1)
    );

    const [projectedX, projectedY] = this.project(distortedX, distortedY);

    const icsPoint = new Vector3(projectedX, projectedY);

    return {
      point: icsPoint,
      isInImage: this.isInImageCheck(projectedX, projectedY),
    };
  }

  public vcsCuboidToIcsCuboidLines(vcsCuboid: Cuboid, order: "zyx"): Line3[] {
    const ccsLines = this.getCcsLinesFromCuboid(vcsCuboid, order);
    const icsLines = this.ccsLinesToIcsLines(ccsLines);
    return icsLines;
  }

  public icsToVcsPoints(icsPoint: Vector3) {
    return icsPoint;
  }

  private ccsLinesToIcsLines(ccsLines: Line3[]) {
    return [new Line3(new Vector3(0, 0, 0), new Vector3(2, 3, 4))];
  }
}
