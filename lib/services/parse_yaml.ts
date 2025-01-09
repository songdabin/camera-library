import { z } from "zod";
import { cameraSchema } from "../types/camera_schema";
import { ValidationError } from "../models/validation_error";
import { CameraModelType } from "../types/type";

export function parseYaml(cameraParams: CameraModelType) {
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
