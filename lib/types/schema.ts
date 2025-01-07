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

export const CameraTypeSchema = z.enum(["standard", "fisheye"]);
