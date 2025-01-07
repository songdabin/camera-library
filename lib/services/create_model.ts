import * as fs from "fs";
import path = require("path");
import { FisheyeModel } from "../models/fisheye_model";
import { RectilinearModel } from "../models/rectilinear_model";
import { splitData } from "./split_data";

export function CreateModel(fileName: string) {
  const filePath = path.join(process.cwd(), "assets", `${fileName}`);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const data = splitData(fileContent);

  if (data[0].startsWith("standard")) {
    return new RectilinearModel(
      data[1].channel,
      data[1].sensor,
      data[1].distortionModel,
      data[1].hfov,
      data[1].height,
      data[1].width,
      data[1].intrinsic,
      data[1].vcsExtrinsic,
      data[1].lcsExtrinsic,
      data[1].mvcsExtrinsic
    );
  } else if (data[0].startsWith("fisheye")) {
    return new FisheyeModel(
      data[1].channel,
      data[1].sensor,
      data[1].distortionModel,
      data[1].hfov,
      data[1].height,
      data[1].width,
      data[1].intrinsic,
      data[1].vcsExtrinsic,
      data[1].lcsExtrinsic,
      data[1].mvcsExtrinsic
    );
  }
}
