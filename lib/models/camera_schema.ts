import { z } from "zod";

export const channelOrFrameToEnum = z.enum([
  "svc_front",
  "svc_rear",
  "svc_left",
  "svc_right",
  "mvc_front",
  "mvc_rear",
]);

export const frameFromEnum = z.enum(["vcs", "lidar", "mvcs"]);

export const extrinsicSchema = z.object({
  frameFrom: z.string(),
  frameTo: z.string(),
  qw: z.number(),
  qx: z.number(),
  qy: z.number(),
  qz: z.number(),
  tx: z.number(),
  ty: z.number(),
  tz: z.number(),
});

export const intrinsicSchema = z.object({
  fx: z.number(),
  fy: z.number(),
  cx: z.number(),
  cy: z.number(),
  k1: z.number(),
  k2: z.number(),
  k3: z.number(),
  k4: z.number(),
  k5: z.number().default(0),
  k6: z.number().default(0),
  p1: z.number(),
  p2: z.number(),
});

export const cameraSchema = z.object({
  channel: z.string(),
  sensor: z.string().regex(/^[a-zA-Z]*$/),
  distortionModel: z.string().regex(/^[a-zA-Z]*$/),
  hfov: z.number(),
  height: z.number(),
  width: z.number(),
  intrinsic: intrinsicSchema,
  vcsExtrinsic: extrinsicSchema,
  lcsExtrinsic: extrinsicSchema,
  mvcsExtrinsic: extrinsicSchema,
});
