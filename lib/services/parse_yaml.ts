import {
  cameraSchema,
  channelOrFrameToEnum,
  frameFromEnum,
} from "../models/camera_schema";
import { z } from "zod";
import { splitData } from "./split_data";
import { CameraModel } from "../models/camera_model";
import { ValidationError } from "../models/validation_error";

export function parseYaml(fileContent: string) {
  const parsedData = splitData(fileContent);

  const validateYaml = function (
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
  };

  const channelValidationError = validateYaml(
    channelOrFrameToEnum,
    parsedData.channel,
    "channel"
  );
  if (channelValidationError) {
    throw new ValidationError(channelValidationError);
  }

  const extrinsicList = [
    parsedData.vcsExtrinsic,
    parsedData.lcsExtrinsic,
    parsedData.mvcsExtrinsic,
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

  const cameraSchemaValidationError = validateYaml(cameraSchema, parsedData);
  if (cameraSchemaValidationError) {
    throw new ValidationError(cameraSchemaValidationError);
  }

  return cameraSchema.parse(parsedData);
}
