import { FisheyeModel } from "../models/fisheye_model";
import { RectilinearModel } from "../models/rectilinear_model";
import { CameraModelType, CameraType } from "../types/type";

export function createModel(
  cameraTypeName: CameraType,
  cameraParams: CameraModelType
) {
  if (cameraTypeName === "standard") {
    return new RectilinearModel(
      cameraParams.channel,
      cameraParams.sensor,
      cameraParams.distortionModel,
      cameraParams.hfov,
      cameraParams.height,
      cameraParams.width,
      cameraParams.intrinsic,
      cameraParams.vcsExtrinsic,
      cameraParams.lcsExtrinsic,
      cameraParams.mvcsExtrinsic
    );
  }
  if (cameraTypeName === "fisheye") {
    return new FisheyeModel(
      cameraParams.channel,
      cameraParams.sensor,
      cameraParams.distortionModel,
      cameraParams.hfov,
      cameraParams.height,
      cameraParams.width,
      cameraParams.intrinsic,
      cameraParams.vcsExtrinsic,
      cameraParams.lcsExtrinsic,
      cameraParams.mvcsExtrinsic
    );
  }
}
