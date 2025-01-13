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
        frameFrom: data.vcsExtrinsic.frame_from,
        frameTo: data.vcsExtrinsic.frame_to,
        qw: data.vcsExtrinsic.qw,
        qx: data.vcsExtrinsic.qx,
        qy: data.vcsExtrinsic.qy,
        qz: data.vcsExtrinsic.qz,
        tx: data.vcsExtrinsic.tx,
        ty: data.vcsExtrinsic.ty,
        tz: data.vcsExtrinsic.tz,
      },
      lcsExtrinsic: {
        frameFrom: data.lcsExtrinsic.frame_from,
        frameTo: data.lcsExtrinsic.frame_to,
        qw: data.lcsExtrinsic.qw,
        qx: data.lcsExtrinsic.qx,
        qy: data.lcsExtrinsic.qy,
        qz: data.lcsExtrinsic.qz,
        tx: data.lcsExtrinsic.tx,
        ty: data.lcsExtrinsic.ty,
        tz: data.lcsExtrinsic.tz,
      },
      mvcsExtrinsic: {
        frameFrom: data.mvcsExtrinsic.frame_from,
        frameTo: data.mvcsExtrinsic.frame_to,
        qw: data.mvcsExtrinsic.qw,
        qx: data.mvcsExtrinsic.qx,
        qy: data.mvcsExtrinsic.qy,
        qz: data.mvcsExtrinsic.qz,
        tx: data.mvcsExtrinsic.tx,
        ty: data.mvcsExtrinsic.ty,
        tz: data.mvcsExtrinsic.tz,
      },
    },
  ];
}
