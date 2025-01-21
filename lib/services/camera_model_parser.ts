import { CameraModelType, CameraType } from "../types/type";

export function cameraModelParser(
  data: Record<string, any>
): [CameraType, CameraModelType] {
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
      vcsExtrinsic: {
        frameFrom: data.vcs_extrinsic.frame_from,
        frameTo: data.vcs_extrinsic.frame_to,
        qw: data.vcs_extrinsic.qw,
        qx: data.vcs_extrinsic.qx,
        qy: data.vcs_extrinsic.qy,
        qz: data.vcs_extrinsic.qz,
        tx: data.vcs_extrinsic.tx,
        ty: data.vcs_extrinsic.ty,
        tz: data.vcs_extrinsic.tz,
      },
      lcsExtrinsic: {
        frameFrom: data.lcs_extrinsic.frame_from,
        frameTo: data.lcs_extrinsic.frame_to,
        qw: data.lcs_extrinsic.qw,
        qx: data.lcs_extrinsic.qx,
        qy: data.lcs_extrinsic.qy,
        qz: data.lcs_extrinsic.qz,
        tx: data.lcs_extrinsic.tx,
        ty: data.lcs_extrinsic.ty,
        tz: data.lcs_extrinsic.tz,
      },
      mvcsExtrinsic: {
        frameFrom: data.mvcs_extrinsic.frame_from,
        frameTo: data.mvcs_extrinsic.frame_to,
        qw: data.mvcs_extrinsic.qw,
        qx: data.mvcs_extrinsic.qx,
        qy: data.mvcs_extrinsic.qy,
        qz: data.mvcs_extrinsic.qz,
        tx: data.mvcs_extrinsic.tx,
        ty: data.mvcs_extrinsic.ty,
        tz: data.mvcs_extrinsic.tz,
      },
    },
  ];
}
