import * as fs from "fs";
import path = require("path");
import { createModel } from "../services/create_model";
import { splitData } from "../services/split_data";
import {
  fisheyeCcsToIcsPointTestCase,
  vcsToCcsPointTestCase,
  rectilinearIcsToVcsTestCase,
  rectilinearCcsToIcsPointTestCase,
  truncatedTestCase,
} from "./testcase";
import { getTruncatedLinesInCameraFov } from "../models/legacy";

const frontFilePath = path.join(process.cwd(), "assets", "svc_front.yaml");
const frontFileContent = fs.readFileSync(frontFilePath, "utf8");
const [frontCameraType, frontCameraParams] = splitData(frontFileContent);

const rearFilePath = path.join(process.cwd(), "assets", "svc_rear.yaml");
const rearFileContent = fs.readFileSync(rearFilePath, "utf8");
const [rearCameraType, rearCameraParams] = splitData(rearFileContent);

fisheyeCcsToIcsPointTestCase.forEach(({ input, output }) => {
  const fisheyeModel = createModel(frontCameraType, frontCameraParams);

  test("Fisheye Model ccsToIcsPoint Test", () => {
    expect(fisheyeModel?.ccsToIcsPoint(input)).toEqual(output);
  });
});

vcsToCcsPointTestCase.forEach(({ input, output }) => {
  const rectilinearModel = createModel(rearCameraType, rearCameraParams);

  test("Rectilinear Model vcsToCcsPoint Test", () => {
    expect(rectilinearModel?.vcsToCcsPoint(input)).toEqual(output);
  });
});

rectilinearCcsToIcsPointTestCase.forEach(({ input, output }) => {
  const rectilinearModel = createModel(rearCameraType, rearCameraParams);

  test("Rectilinear Model ccsToIcsPoint Test", () => {
    expect(rectilinearModel?.ccsToIcsPoint(input)).toEqual(output);
  });
});

rectilinearIcsToVcsTestCase.forEach(({ input, output }) => {
  const rectilinearModel = createModel(rearCameraType, rearCameraParams);

  test("icsToVcsPoint", () => {
    expect(rectilinearModel?.icsToVcsPoint(input)).toEqual(output);
  });
});

truncatedTestCase.forEach(({ input, output }) => {
  test("truncatedTest", () => {
    expect(getTruncatedLinesInCameraFov(input, rearCameraParams.hfov)).toEqual(
      output
    );
  });
});
