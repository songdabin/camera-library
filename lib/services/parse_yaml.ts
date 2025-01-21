import { cameraSchema } from "../types/camera_schema";
import { CameraModelType } from "../types/type";

export function parseYaml(cameraParams: CameraModelType) {
  cameraSchema.parse(cameraParams);

  return cameraParams;
}
