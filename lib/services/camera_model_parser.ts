import { CameraModelType, CameraType } from "../types/type";

export function cameraModelParser(
  data: Record<string, any>
): [CameraType, CameraModelType] {
  const makeExtrinsic = function (inputExtrinsic: any) {
    return {
      frameFrom: inputExtrinsic.frame_from,
      frameTo: inputExtrinsic.frame_to,
      qw: inputExtrinsic.qw,
      qx: inputExtrinsic.qx,
      qy: inputExtrinsic.qy,
      qz: inputExtrinsic.qz,
      tx: inputExtrinsic.tx,
      ty: inputExtrinsic.ty,
      tz: inputExtrinsic.tz,
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
    },
  ];
}
