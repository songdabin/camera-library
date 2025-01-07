import * as fs from "fs";
import path = require("path");
import { FisheyeModel } from "../models/fisheye_model";
import { RectilinearModel } from "../models/rectilinear_model";
import { createModel } from "../services/create_model";
import { splitData } from "../services/split_data";

test("Fisheye Model Create Test", () => {
  const filePath = path.join(process.cwd(), "assets", "svc_front.yaml");
  const fileContent = fs.readFileSync(filePath, "utf8");
  const [cameraType, cameraParams] = splitData(fileContent);

  expect(createModel(cameraType, cameraParams)).toBeInstanceOf(FisheyeModel);
});

test("Rectilinear Model Create Test", () => {
  const filePath = path.join(process.cwd(), "assets", "svc_rear.yaml");
  const fileContent = fs.readFileSync(filePath, "utf8");
  const [cameraType, cameraParams] = splitData(fileContent);
  expect(createModel(cameraType, cameraParams)).toBeInstanceOf(
    RectilinearModel
  );
});
