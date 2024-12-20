interface Extrinsic {
  frame_from: string;
  frame_to: string;
  qw: number;
  qx: number;
  qy: number;
  qz: number;
  tx: number;
  ty: number;
  tz: number;
}

interface Intrinsic {
  fx: number;
  fy: number;
  cx: number;
  cy: number;
  k1: number;
  k2: number;
  k3: number;
  k4: number;
  p1: number;
  p2: number;
}

class Camera {
  channel: string;
  sensor: string;
  distortion_model: string;
  hfov: number;
  height: number;
  width: number;
  intrinsic: Intrinsic;
  vcs_extrinsic: Extrinsic;
  lcs_extrinsic: Extrinsic;
  mvcs_extrinsic: Extrinsic;

  constructor(
    channel: string,
    sensor: string,
    distortion_model: string,
    hfov: number,
    height: number,
    width: number,
    intrinsic: Intrinsic,
    vcs_extrinsic: Extrinsic,
    lcs_extrinsic: Extrinsic,
    mvcs_extrinsic: Extrinsic
  ) {
    this.channel = channel;
    this.sensor = sensor;
    this.distortion_model = distortion_model;
    this.hfov = hfov;
    this.height = height;
    this.width = width;
    this.intrinsic = intrinsic;
    this.vcs_extrinsic = vcs_extrinsic;
    this.lcs_extrinsic = lcs_extrinsic;
    this.mvcs_extrinsic = mvcs_extrinsic;
  }
}

export { Camera };
