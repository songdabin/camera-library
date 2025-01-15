import { Line3, Vector3 } from "three";
import { Cuboid, ICSPoint } from "../types/type";
import { CameraModel } from "./camera_model";

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
    const normalizedPoint = vec3.clone().divideScalar(vec3.getComponent(2));

    const { fx, fy, cx, cy } = this.intrinsic;

    const x = (normalizedPoint.x - cx) / fx;
    const y = (normalizedPoint.y - cy) / fy;

    const [distortedX, distortedY] = this.distortVec3(x, y);

    const distortedPoint: ICSPoint = {
      x: distortedX * fx + cx,
      y: distortedY * fy + cy,
      isInImage: x >= 0 && x < this.width && y >= 0 && y < this.height,
    };

    return distortedPoint;
  }

  public vcsCuboidToIcsCuboidLines(vcsCuboid: Cuboid, order: "zyx"): Line3[] {
    const ccsLines = this.getCcsLinesFromCuboid(vcsCuboid, order);
    const icsLines = this.ccsLinesToIcsLines(ccsLines);
    return icsLines;
  }

  private ccsLinesToIcsLines(ccsLines: Line3[]) {
    /*
  private ccsLinesToIcsLines(ccsLines: [Vector3, Vector3][]) {
    const v1 = new Vector3(...icsToVcsPoitns([0, this.height / 2, 150], this));
    const v2 = new Vector3(
      ...icsToVcsPoitns([this.width, this.height / 2, 150], this)
    );
    const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const angle =
      Math.acos(dotProduct / (v1.length() * v2.length())) * (180 / Math.PI);

    const { lines, positiveMask } = getTruncatedLinesInCameraFov(
      ccsLines,
      this.channel,
      angle
    );
    */
    const icsLines: Line3[] = [
      new Line3(new Vector3(1, 1, 1), new Vector3(1, 1, 1)),
    ];

    /*
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
    */

    return icsLines;
  }
}
