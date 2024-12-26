import * as fs from "fs";
import { parseYaml } from "./parse_yaml";
import { CameraModel } from "../models/camera_model";

export function readYaml(fileName: string) {
  let fileContent = fs.readFileSync(fileName, "utf8");

  let parsedYaml = parseYaml(fileContent);

  const camera = new CameraModel(
    parsedYaml.channel,
    parsedYaml.sensor,
    parsedYaml.distortionModel,
    parsedYaml.hfov,
    parsedYaml.height,
    parsedYaml.width,
    parsedYaml.intrinsic,
    parsedYaml.vcsExtrinsic,
    parsedYaml.lcsExtrinsic,
    parsedYaml.mvcsExtrinsic
  );

  return camera;
}
