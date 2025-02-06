import { Vector3 } from "three";
import { z } from "zod";
import { CameraTypeSchema } from "./schema";
import {
  cameraSchema,
  extrinsicSchema,
  intrinsicSchema,
} from "./camera_schema";

export type ICSPoint = { point: Vector3; isInImage: boolean };

export type Extrinsic = z.infer<typeof extrinsicSchema>;

export type Intrinsic = z.infer<typeof intrinsicSchema>;

export type CameraModelType = z.infer<typeof cameraSchema>;

export type CameraType = z.infer<typeof CameraTypeSchema>;

export type SlopesAndIntercepts = {
  xyLineSlopes: number[];
  xzLineSlopes: number[];
  xyLineIntercepts: number[];
  xzLineIntercepts: number[];
};
