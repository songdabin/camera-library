import * as fs from "fs";
import { FisheyeModel } from "../models/fisheye_model";
import { RectilinearModel } from "../models/rectilinear_model";
import { cameraModelParser } from "./camera_model_parser";
import { CameraType } from "../types/type";

export function splitData(
  filePath: string
): [cameraType: CameraType, cameraParams: FisheyeModel | RectilinearModel] {
  const yamlData = fs.readFileSync(filePath, "utf8");
  const lines = yamlData.split("\n").filter((line) => !line.startsWith("#"));
  const data: Record<string, any> = {};

  let objectKey: string | null = null;
  let objectData: Record<string, string | number | null> = {};

  lines.forEach((line) => {
    if (line.endsWith(":")) {
      if (objectKey) {
        data[objectKey] = objectData;
      }

      objectKey = line.slice(0, -1).trim();
      objectData = {};
    } else {
      const [key, value] = line.split(":").map((part) => part.trim());

      if (objectKey) {
        objectData[key] = typeParser(value);
      } else {
        data[key] = typeParser(value);
      }
    }
  });

  if (objectKey) {
    data[objectKey] = objectData;
  }

  return cameraModelParser(data);
}

function typeParser(value: string) {
  if (value === "null") return null;

  const numberValue = parseFloat(value);
  if (!isNaN(numberValue)) {
    return numberValue;
  }

  return value;
}
