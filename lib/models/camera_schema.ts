import { z } from "zod";

const extrinsicSchema = z.object({
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

const intrinsicSchema = z.object({
  fx: z.number(),
  fy: z.number(),
  cx: z.number(),
  cy: z.number(),
  k1: z.number(),
  k2: z.number(),
  k3: z.number(),
  k4: z.number(),
  k5: z.number().optional(),
  k6: z.number().optional(),
  p1: z.number(),
  p2: z.number(),
});

export const cameraSchema = z.object({
  channel: z.string(),
  sensor: z.string(),
  distortionModel: z.string(),
  hfov: z.number(),
  height: z.number(),
  width: z.number(),
  intrinsic: intrinsicSchema,
  vcsExtrinsic: extrinsicSchema,
  lcsExtrinsic: extrinsicSchema,
  mvcsExtrinsic: extrinsicSchema,
});
