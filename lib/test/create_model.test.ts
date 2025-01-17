import * as fs from "fs";
import path = require("path");
import { FisheyeModel } from "../models/fisheye_model";
import { RectilinearModel } from "../models/rectilinear_model";
import { createModel } from "../services/create_model";
import { splitData } from "../services/split_data";

const frontFilePath = path.join(process.cwd(), "assets", "svc_front.yaml");
const frontFileContent = fs.readFileSync(frontFilePath, "utf8");
const [frontCameraType, frontCameraParams] = splitData(frontFileContent);

const rearFilePath = path.join(process.cwd(), "assets", "svc_rear.yaml");
const rearFileContent = fs.readFileSync(rearFilePath, "utf8");
const [rearCameraType, rearCameraParams] = splitData(rearFileContent);

test("Fisheye Model Create Test", () => {
  expect(createModel(frontCameraType, frontCameraParams)).toBeInstanceOf(
    FisheyeModel
  );
});

test("Rectilinear Model Create Test", () => {
  expect(createModel(rearCameraType, rearCameraParams)).toBeInstanceOf(
    RectilinearModel
  );
});

// test("icsToVcsPoint Test", () => {
//   console.log(rectilinearModel?.icsToVcsPoints([1, 2, 3]));
// });
