import * as fs from "fs";
import path = require("path");
import { FisheyeModel } from "../models/fisheye_model";
import { RectilinearModel } from "../models/rectilinear_model";
import { createModel } from "../services/create_model";
import { splitData } from "../services/split_data";
import { Vector3 } from "three";
import {
  cuboidTestCase,
  cuboidTestCase2,
  fisheyeProjectCcsToIcsTestCase,
  getCcsLinesFromCuboidResult,
  getCcsLinesFromCuboidResult2,
  projectVcsToCcsTestCase,
  rectilinearProjectCcsToIcsTestCase,
} from "./testcase";

const frontFilePath = path.join(process.cwd(), "assets", "svc_front.yaml");
const frontFileContent = fs.readFileSync(frontFilePath, "utf8");
const [frontCameraType, frontCameraParams] = splitData(frontFileContent);
const fisheyeModel = createModel(frontCameraType, frontCameraParams);

const rearFilePath = path.join(process.cwd(), "assets", "svc_rear.yaml");
const rearFileContent = fs.readFileSync(rearFilePath, "utf8");
const [rearCameraType, rearCameraParams] = splitData(rearFileContent);
const rectilinearModel = createModel(rearCameraType, rearCameraParams);

test("Fisheye Model Create Test", () => {
  expect(createModel(frontCameraType, frontCameraParams)).toBeInstanceOf(
    FisheyeModel
  );
});

fisheyeProjectCcsToIcsTestCase.forEach(({ input, output }) => {
  test("Fisheye Model projectCcsToIcs Test", () => {
    expect(fisheyeModel?.projectCcsToIcs(input)).toEqual(output);
  });
});

test("Rectilinear Model Create Test", () => {
  expect(createModel(rearCameraType, rearCameraParams)).toBeInstanceOf(
    RectilinearModel
  );
});

projectVcsToCcsTestCase.forEach(({ input, output }) => {
  test("Rectilinear Model projectVcsToCcs Test", () => {
    expect(rectilinearModel?.projectVcsToCcs(input)).toEqual(output);
  });
});

rectilinearProjectCcsToIcsTestCase.forEach(({ input, output }) => {
  test("Rectilinear Model projectCcsToIcs Test", () => {
    expect(rectilinearModel?.projectCcsToIcs(input)).toEqual(output);
  });
});

test("getCcsLinesFromCuboid Test", () => {
  expect(
    rectilinearModel?.getCcsLinesFromCuboid(cuboidTestCase, "zyx")
  ).toEqual(getCcsLinesFromCuboidResult);

  expect(
    rectilinearModel?.getCcsLinesFromCuboid(cuboidTestCase2, "zyx")
  ).toEqual(getCcsLinesFromCuboidResult2);
});

// test("icsToVcsPoint Test", () => {
//   console.log(rectilinearModel?.icsToVcsPoints([1, 2, 3]));
// });
