import { Extrinsic, ICSPoint, Intrinsic, Vector3Like } from "../types/type";

export abstract class CameraModel {
  channel: string;
  sensor: string;
  distortionModel: string;
  hfov: number;
  height: number;
  width: number;
  intrinsic: Intrinsic;
  vcsExtrinsic: Extrinsic;
  lcsExtrinsic: Extrinsic;
  mvcsExtrinsic: Extrinsic;

  constructor(
    channel: string,
    sensor: string,
    distortionModel: string,
    hfov: number,
    height: number,
    width: number,
    intrinsic: Intrinsic,
    vcsExtrinsic: Extrinsic,
    lcsExtrinsic: Extrinsic,
    mvcsExtrinsic: Extrinsic
  ) {
    const updatedIntrinsic = {
      ...intrinsic,
      k5: intrinsic.k5 ?? 0,
      k6: intrinsic.k6 ?? 0,
    };
    this.channel = channel;
    this.sensor = sensor;
    this.distortionModel = distortionModel;
    this.hfov = hfov;
    this.height = height;
    this.width = width;
    this.intrinsic = updatedIntrinsic;
    this.vcsExtrinsic = vcsExtrinsic;
    this.lcsExtrinsic = lcsExtrinsic;
    this.mvcsExtrinsic = mvcsExtrinsic;
  }

  abstract projectCcsToIcs(vec3: Vector3Like): ICSPoint;
}
