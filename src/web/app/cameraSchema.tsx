import { z } from "zod";

const extrinsicSchema = z.object({
  frame_from: z.string(),
  frame_to: z.string(),
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
  k5: z.number(),
  k6: z.number(),
  p1: z.number(),
  p2: z.number(),
});

const cameraSchema = z.object({
  channel: z.string(),
  sensor: z.string(),
  distortion_model: z.string(),
  hfov: z.number(),
  height: z.number(),
  width: z.number(),
  intrinsic: intrinsicSchema,
  vcs_extrinsic: extrinsicSchema,
  lcs_extrinsic: extrinsicSchema,
  mvcs_extrinsic: extrinsicSchema,
});
