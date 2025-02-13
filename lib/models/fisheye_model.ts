import { Line3, Vector3 } from "three";
import { ICSPoint } from "../types/type";
import { CameraModel } from "./camera_model";
import { Cuboid } from "../types/Cuboid";
import {
  clipInImage,
  distortFisheye,
  isInImageCheck,
  project,
} from "./math_utils";

export type CcsToIcsPointsArgs = {
  ccsPoint: Vector3;
};

export class FisheyeModel extends CameraModel {
  public ccsToIcsPoint(vec3: Vector3): ICSPoint {
    const distorted = distortFisheye(vec3, this.hfov, this.intrinsic);

    const icsPoint = project(distorted, this.intrinsic);

    const isInImage = isInImageCheck(icsPoint, this.width, this.height);

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
      const icsP1 = this.ccsToIcsPoint(ccsLine.start);
      const icsP2 = this.ccsToIcsPoint(ccsLine.end);
      if (icsP1.isInImage && icsP2.isInImage)
        icsLines.push(new Line3(icsP1.point, icsP2.point));
      else if (icsP1.isInImage || icsP2.isInImage)
        icsLines.push(clipInImage([icsP1, icsP2], this.width, this.height));
      else icsLines.push(null);
    });

    return icsLines;
  }
}
