import {
  cameraSchema,
  channelOrFrameToEnum,
  frameFromEnum,
} from "../models/camera_schema";
import { z } from "zod";
import { splitData } from "./split_data";

export function parseYaml(fileContent: string) {
  const parsedData = splitData(fileContent);

  try {
    channelOrFrameToEnum.parse(parsedData.channel);
  } catch (channelEnumError) {
    if (channelEnumError instanceof z.ZodError) {
      const errorMessage = channelEnumError.errors.map(
        (e) => `${e.code} error generated from channel: ${e.message}`
      );

      console.error("Validation Error:", errorMessage);
    }
  }

  try {
    channelOrFrameToEnum.parse(
      parsedData.vcsExtrinsic.frameTo ||
        parsedData.lcsExtrinsic.frameTo ||
        parsedData.mvcsExtrinsic.frameTo
    );
  } catch (frameToEnumError) {
    if (frameToEnumError instanceof z.ZodError) {
      const errorMessage = frameToEnumError.errors.map(
        (e) => `${e.code} error generated from channel: ${e.message}`
      );

      console.error("Validation Error:", errorMessage);
    }
  }

  try {
    frameFromEnum.parse(
      parsedData.vcsExtrinsic.frameFrom ||
        parsedData.lcsExtrinsic.frameFrom ||
        parsedData.mvcsExtrinsic.frameFrom
    );
  } catch (frameFromEnumError) {
    if (frameFromEnumError instanceof z.ZodError) {
      const errorMessage = frameFromEnumError.errors.map(
        (e) => `${e.code} error generated from channel: ${e.message}`
      );

      console.error("Validation Error:", errorMessage);
    }
  }

  try {
    cameraSchema.parse(parsedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(
        (e) => `${e.code} error generated from ${e.path}: ${e.message}`
      );

      console.error("Validation Error:", errorMessage);
    }
  }

  return cameraSchema.parse(parsedData);
}
