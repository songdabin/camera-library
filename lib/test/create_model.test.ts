import * as fs from "fs";
import path = require("path");
import { FisheyeModel } from "../models/fisheye_model";
import { RectilinearModel } from "../models/rectilinear_model";
import { createModel } from "../services/create_model";
import { splitData } from "../services/split_data";
import { Vector3 } from "three";

const frontFilePath = path.join(process.cwd(), "assets", "svc_front.yaml");
const frontFileContent = fs.readFileSync(frontFilePath, "utf8");
const [frontCameraType, frontCameraParams] = splitData(frontFileContent);

test("Fisheye Model Create Test", () => {
  expect(createModel(frontCameraType, frontCameraParams)).toBeInstanceOf(
    FisheyeModel
  );
});

test("Fisheye Model projectCcsToIcs Test", () => {
  const fisheyeModel = createModel(frontCameraType, frontCameraParams);

  expect(fisheyeModel?.projectCcsToIcs(new Vector3(10000, 10000, 10))).toEqual({
    x: 1600.9286588735288,
    y: 1408.5782821677863,
    isInImage: true,
  });
});

const rearFilePath = path.join(process.cwd(), "assets", "svc_rear.yaml");
const rearFileContent = fs.readFileSync(rearFilePath, "utf8");
const [rearCameraType, rearCameraParams] = splitData(rearFileContent);

test("Rectilinear Model Create Test", () => {
  expect(createModel(rearCameraType, rearCameraParams)).toBeInstanceOf(
    RectilinearModel
  );
});

test("Rectilinear Model projectCcsToIcs Test", () => {
  const rectilinearModel = createModel(rearCameraType, rearCameraParams);

  expect(
    rectilinearModel?.projectCcsToIcs(new Vector3(10000, 10000, 10))
  ).toEqual({ x: 1000.9588784876503, y: 1006.6784469911012, isInImage: true });
});
