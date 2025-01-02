import {
  cameraSchema,
  channelOrFrameToEnum,
  frameFromEnum,
} from "../models/camera_schema";
import { z } from "zod";
import { splitData } from "./split_data";
import { CameraModel } from "../models/camera_model";

export function parseYaml(fileContent: string) {
  const parsedData = splitData(fileContent);

  const validateYaml = function (
    enumInput: { parse: (arg0: string | CameraModel) => void },
    testData: string | CameraModel,
    testKey?: string
  ) {
    try {
      enumInput.parse(testData);
    } catch (validateError) {
      if (validateError instanceof z.ZodError) {
        const errorMessage = validateError.errors.map(
          (e) =>
            `${e.code} error generated from '${testKey ?? e.path}':\n${e.message}\n`
        );

        throw new Error(
          "\n\n---------------Validation Error---------------\n\n" +
            errorMessage +
            "\n----------------------------------------------\n"
        );
      }
    }
  };

  validateYaml(channelOrFrameToEnum, parsedData.channel, "channel");

  const extrinsicList = [
    parsedData.vcsExtrinsic,
    parsedData.lcsExtrinsic,
    parsedData.mvcsExtrinsic,
  ];

  extrinsicList.forEach((extrinsic) =>
    validateYaml(channelOrFrameToEnum, extrinsic.frameTo, "frame_to")
  );

  extrinsicList.forEach((extrinsic) =>
    validateYaml(frameFromEnum, extrinsic.frameFrom, "frame_from")
  );

  validateYaml(cameraSchema, parsedData);

  return cameraSchema.parse(parsedData);
}
