import { ICSPoint, Vector3Like } from "../types/type";
import { CameraModel } from "./camera_model";

export class RectilinearModel extends CameraModel {
  public projectCCSToICS(vec3: Vector3Like): ICSPoint {
    return { x: 3, y: 3, isInImage: true };
  }
}
