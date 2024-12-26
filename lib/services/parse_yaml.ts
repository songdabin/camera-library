import { parse } from "yaml";
import { cameraSchema } from "../models/camera_schema";

export function parseYaml(fileContent: string) {
  const parsedContent = parse(fileContent);

  const vcsExtrinsic = {
    frameFrom: parsedContent.vcs_extrinsic.frame_from,
    frameTo: parsedContent.vcs_extrinsic.frame_to,
    qw: parsedContent.vcs_extrinsic.qw,
    qx: parsedContent.vcs_extrinsic.qx,
    qy: parsedContent.vcs_extrinsic.qy,
    qz: parsedContent.vcs_extrinsic.qz,
    tx: parsedContent.vcs_extrinsic.tx,
    ty: parsedContent.vcs_extrinsic.ty,
    tz: parsedContent.vcs_extrinsic.tz,
  };

  const lcsExtrinsic = {
    frameFrom: parsedContent.lcs_extrinsic.frame_from,
    frameTo: parsedContent.lcs_extrinsic.frame_to,
    qw: parsedContent.lcs_extrinsic.qw,
    qx: parsedContent.lcs_extrinsic.qx,
    qy: parsedContent.lcs_extrinsic.qy,
    qz: parsedContent.lcs_extrinsic.qz,
    tx: parsedContent.lcs_extrinsic.tx,
    ty: parsedContent.lcs_extrinsic.ty,
    tz: parsedContent.lcs_extrinsic.tz,
  };

  const mvcsExtrinsic = {
    frameFrom: parsedContent.mvcs_extrinsic.frame_from,
    frameTo: parsedContent.mvcs_extrinsic.frame_to,
    qw: parsedContent.mvcs_extrinsic.qw,
    qx: parsedContent.mvcs_extrinsic.qx,
    qy: parsedContent.mvcs_extrinsic.qy,
    qz: parsedContent.mvcs_extrinsic.qz,
    tx: parsedContent.mvcs_extrinsic.tx,
    ty: parsedContent.mvcs_extrinsic.ty,
    tz: parsedContent.mvcs_extrinsic.tz,
  };

  return cameraSchema.parse({
    channel: parsedContent.channel,
    sensor: parsedContent.sensor,
    distortionModel: parsedContent.distortion_model,
    hfov: parsedContent.hfov,
    height: parsedContent.height,
    width: parsedContent.width,
    intrinsic: parsedContent.intrinsic,
    vcsExtrinsic: vcsExtrinsic,
    lcsExtrinsic: lcsExtrinsic,
    mvcsExtrinsic: mvcsExtrinsic,
  });
}
