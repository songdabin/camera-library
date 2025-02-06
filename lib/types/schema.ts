import { z } from "zod";

export const channelSchema = z.enum([
  "svc_front",
  "svc_rear",
  "svc_left",
  "svc_right",
  "mvc_front",
  "mvc_rear",
]);

export const frameFromSchema = z.enum(["vcs", "lidar", "mvcs"]);

export const CameraTypeSchema = z.enum(["standard", "fisheye"]);

export const EPS = 1e-6;

export const UndistortCount = 5;

export const CuboidPointCount = 8;
