import { Line, Vector3 } from "three";
import { z } from "zod";
import { CameraTypeSchema } from "./schema";
import {
  cameraSchema,
  extrinsicSchema,
  intrinsicSchema,
} from "./camera_schema";

export type ICSPoint = { x: number; y: number; isInImage: boolean };

export type CCSPoint = { x: number; y: number; z: number };

export type Vector3Like =
  | [x: number, y: number, z: number]
  | { x: number; y: number; z: number }
  | Vector3;

export type Extrinsic = z.infer<typeof extrinsicSchema>;

export type Intrinsic = z.infer<typeof intrinsicSchema>;

export type CameraModelType = z.infer<typeof cameraSchema>;

export type CameraType = z.infer<typeof CameraTypeSchema>;
