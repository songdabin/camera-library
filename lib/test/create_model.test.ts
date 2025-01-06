import { FisheyeModel } from "../models/fisheye_model";
import { RectilinearModel } from "../models/rectilinear_model";
import { CreateModel } from "../services/create_model";

const intrinsic_ex = {
  fx: 510.5319068115689,
  fy: 510.19984934242643,
  cx: 959.0319617867203,
  cy: 767.0990841439,
  k1: 0.13535565583898965,
  k2: -0.03627517425195722,
  k3: 6.687170273551911e-5,
  k4: 0.0004943406139128694,
  k5: 1,
  k6: 3,
  p1: 0.0,
  p2: 0.0,
};

const extrinsic_ex = {
  frameFrom: "vcs",
  frameTo: "svc_front",
  qw: 0.45318990639291945,
  qx: -0.5412997983614972,
  qy: 0.5420231651667693,
  qz: -0.45587753340121573,
  tx: 3.6900000000000004,
  ty: -4.1199519888546195e-18,
  tz: 0.6249999999999999,
};

const result_model = {
  channel: "channel",
  sensor: "sensor",
  distortionModel: "distortionm",
  hfov: 1,
  height: 1,
  width: 1,
  intrinsic: intrinsic_ex,
  vcsExtrinsic: extrinsic_ex,
  lcsExtrinsic: extrinsic_ex,
  mvcsExtrinsic: extrinsic_ex,
};

test("Fisheye Model Create Test", () => {
  expect(CreateModel("fisheye")).toBeInstanceOf(FisheyeModel);
});

test("Rectilinear Model Create Test", () => {
  expect(CreateModel("standard")).toBeInstanceOf(RectilinearModel);
});
