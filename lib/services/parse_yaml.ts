import { z } from "zod";
import { cameraSchema } from "../types/camera_schema";
import { FisheyeModel } from "../models/fisheye_model";
import { RectilinearModel } from "../models/rectilinear_model";
import { ValidationError } from "../models/validation_error";

export function parseYaml(cameraParams: FisheyeModel | RectilinearModel) {
  try {
    cameraSchema.parse(cameraParams);
  } catch (validateError) {
    if (validateError instanceof z.ZodError) {
      const errorMessage = validateError.errors.map(
        (e) => `${e.code}/ ${e.path}/ ${e.message}`
      );

      throw new ValidationError("[Validation Error] " + errorMessage);
    }
  }

  return cameraParams;
}
