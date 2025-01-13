import { z } from "zod";

export const channelOrFrameToSchema = z.enum([
  "svc_front",
  "svc_rear",
  "svc_left",
  "svc_right",
  "mvc_front",
  "mvc_rear",
]);

export const frameFromSchema = z.enum(["vcs", "lidar", "mvcs"]);

export const CameraTypeSchema = z.enum(["standard", "fisheye"]);
