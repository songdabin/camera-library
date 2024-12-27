import {
  cameraSchema,
  channelOrFrameToEnum,
  frameFromEnum,
} from "../models/camera_schema";
import { z } from "zod";
import { splitData } from "./split_data";

export function parseYaml(fileContent: string) {
  const parsedData = splitData(fileContent);

  const vcsExtrinsic = {
    frameFrom: parsedData?.vcsExtrinsic.frameFrom,
    frameTo: parsedData?.vcsExtrinsic.frameTo,
    qw: parsedData?.vcsExtrinsic.qw,
    qx: parsedData?.vcsExtrinsic.qx,
    qy: parsedData?.vcsExtrinsic.qy,
    qz: parsedData?.vcsExtrinsic.qz,
    tx: parsedData?.vcsExtrinsic.tx,
    ty: parsedData?.vcsExtrinsic.ty,
    tz: parsedData?.vcsExtrinsic.tz,
  };

  const lcsExtrinsic = {
    frameFrom: parsedData?.lcsExtrinsic.frameFrom,
    frameTo: parsedData?.lcsExtrinsic.frameTo,
    qw: parsedData?.lcsExtrinsic.qw,
    qx: parsedData?.lcsExtrinsic.qx,
    qy: parsedData?.lcsExtrinsic.qy,
    qz: parsedData?.lcsExtrinsic.qz,
    tx: parsedData?.lcsExtrinsic.tx,
    ty: parsedData?.lcsExtrinsic.ty,
    tz: parsedData?.lcsExtrinsic.tz,
  };

  const mvcsExtrinsic = {
    frameFrom: parsedData?.mvcsExtrinsic.frameFrom,
    frameTo: parsedData?.mvcsExtrinsic.frameTo,
    qw: parsedData?.mvcsExtrinsic.qw,
    qx: parsedData?.mvcsExtrinsic.qx,
    qy: parsedData?.mvcsExtrinsic.qy,
    qz: parsedData?.mvcsExtrinsic.qz,
    tx: parsedData?.mvcsExtrinsic.tx,
    ty: parsedData?.mvcsExtrinsic.ty,
    tz: parsedData?.mvcsExtrinsic.tz,
  };

  try {
    channelOrFrameToEnum.parse(parsedData?.channel);
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
      parsedData?.vcsExtrinsic.frameTo ||
        parsedData?.lcsExtrinsic.frameTo ||
        parsedData?.mvcsExtrinsic.frameTo
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
      parsedData?.vcsExtrinsic.frameFrom ||
        parsedData?.lcsExtrinsic.frameFrom ||
        parsedData?.mvcsExtrinsic.frameFrom
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
    cameraSchema.parse({
      channel: parsedData?.channel,
      sensor: parsedData?.sensor,
      distortionModel: parsedData?.distortionModel,
      hfov: parsedData?.hfov,
      height: parsedData?.height,
      width: parsedData?.width,
      intrinsic: parsedData?.intrinsic,
      vcsExtrinsic: vcsExtrinsic,
      lcsExtrinsic: lcsExtrinsic,
      mvcsExtrinsic: mvcsExtrinsic,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(
        (e) => `${e.code} error generated from ${e.path}: ${e.message}`
      );

      console.error("Validation Error:", errorMessage);
    }
  }

  return cameraSchema.parse({
    channel: parsedData?.channel,
    sensor: parsedData?.sensor,
    distortionModel: parsedData?.distortionModel,
    hfov: parsedData?.hfov,
    height: parsedData?.height,
    width: parsedData?.width,
    intrinsic: parsedData?.intrinsic,
    vcsExtrinsic: vcsExtrinsic,
    lcsExtrinsic: lcsExtrinsic,
    mvcsExtrinsic: mvcsExtrinsic,
  });
}
