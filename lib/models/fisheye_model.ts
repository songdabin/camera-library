import { CameraModel, IParam, IReturn } from "./camera_model";

export class FisheyeModel extends CameraModel {
  public projectCCSToICS(vec3: IParam): IReturn {
    return { x: 3, y: 3, isInImage: true };
  }
}
