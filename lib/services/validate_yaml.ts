import { z } from "zod";
import { CameraModel } from "../models/camera_model";

export function validateYaml(
  validateInput: { parse: (arg0: string | CameraModel) => void },
  testData: string | CameraModel,
  testKey?: string
) {
  try {
    validateInput.parse(testData);
  } catch (validateError) {
    if (validateError instanceof z.ZodError) {
      const errorMessage = validateError.errors.map(
        (e) => `${e.code}/ ${testKey ?? e.path}/ ${e.message}`
      );

      return "[Validation Error] " + errorMessage;
    }
  }
}
