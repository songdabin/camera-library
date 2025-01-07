import { cameraSchema } from "../types/camera_schema";
import { ValidationError } from "../models/validation_error";
import { channelOrFrameToEnum, frameFromEnum } from "../types/schema";
import { FisheyeModel } from "../models/fisheye_model";
import { RectilinearModel } from "../models/rectilinear_model";
import { validateYaml } from "./validate_yaml";

export function parseYaml(cameraParams: FisheyeModel | RectilinearModel) {
  const channelValidationError = validateYaml(
    channelOrFrameToEnum,
    cameraParams.channel,
    "channel"
  );
  if (channelValidationError) {
    throw new ValidationError(channelValidationError);
  }

  const extrinsicList = [
    cameraParams.vcsExtrinsic,
    cameraParams.lcsExtrinsic,
    cameraParams.mvcsExtrinsic,
  ];

  for (const extrinsic of extrinsicList) {
    const frameToValidationError = validateYaml(
      channelOrFrameToEnum,
      extrinsic.frameTo,
      "frame_to"
    );
    if (frameToValidationError) {
      throw new ValidationError(frameToValidationError);
    }
  }

  for (const extrinsic of extrinsicList) {
    const frameFromValidationError = validateYaml(
      frameFromEnum,
      extrinsic.frameFrom,
      "frame_from"
    );
    if (frameFromValidationError) {
      throw new ValidationError(frameFromValidationError);
    }
  }

  const cameraSchemaValidationError = validateYaml(cameraSchema, cameraParams);
  if (cameraSchemaValidationError) {
    throw new ValidationError(cameraSchemaValidationError);
  }

  return cameraSchema.parse(cameraParams);
}
