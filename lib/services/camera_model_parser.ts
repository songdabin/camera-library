import { FisheyeModel } from "../models/fisheye_model";
import { RectilinearModel } from "../models/rectilinear_model";
import { CameraType, Vector3Like } from "../types/type";

export function cameraModelParser(
  data: Record<string, any>
): [CameraType, FisheyeModel | RectilinearModel] {
  const makeExtrinsic = function (inputExtrinsic: any) {
    return {
      ...inputExtrinsic,
      frameFrom: inputExtrinsic.frame_from,
      frameTo: inputExtrinsic.frame_to,
    };
  };

  return [
    data.type,
    {
      channel: data.channel,
      sensor: data.sensor,
      distortionModel: data.distortion_model,
      hfov: data.hfov,
      height: data.height,
      width: data.width,
      intrinsic: data.intrinsic,
      vcsExtrinsic: makeExtrinsic(data.vcs_extrinsic),
      lcsExtrinsic: makeExtrinsic(data.lcs_extrinsic),
      mvcsExtrinsic: makeExtrinsic(data.mvcs_extrinsic),
      projectCCSToICS: (vec3: Vector3Like) => {
        return { x: 3, y: 3, isInImage: true };
      },
    },
  ];
}
