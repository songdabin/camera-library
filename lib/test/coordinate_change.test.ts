import * as fs from "fs";
import path = require("path");
import { createModel } from "../services/create_model";
import { splitData } from "../services/split_data";
import {
  fisheyeProjectCcsToIcsTestCase,
  projectVcsToCcsTestCase,
  rectilinearIcsToVcsTestCase,
  rectilinearProjectCcsToIcsTestCase,
  truncatedTestCase,
} from "./testcase";
import { getTruncatedLinesInCameraFov } from "../models/legacy";

const frontFilePath = path.join(process.cwd(), "assets", "svc_front.yaml");
const frontFileContent = fs.readFileSync(frontFilePath, "utf8");
const [frontCameraType, frontCameraParams] = splitData(frontFileContent);

const rearFilePath = path.join(process.cwd(), "assets", "svc_rear.yaml");
const rearFileContent = fs.readFileSync(rearFilePath, "utf8");
const [rearCameraType, rearCameraParams] = splitData(rearFileContent);

fisheyeProjectCcsToIcsTestCase.forEach(({ input, output }) => {
  const fisheyeModel = createModel(frontCameraType, frontCameraParams);

  test("Fisheye Model projectCcsToIcs Test", () => {
    expect(fisheyeModel?.projectCcsToIcs(input)).toEqual(output);
  });
});

projectVcsToCcsTestCase.forEach(({ input, output }) => {
  const rectilinearModel = createModel(rearCameraType, rearCameraParams);

  test("Rectilinear Model projectVcsToCcs Test", () => {
    expect(rectilinearModel?.projectVcsToCcs(input)).toEqual(output);
  });
});

rectilinearProjectCcsToIcsTestCase.forEach(({ input, output }) => {
  const rectilinearModel = createModel(rearCameraType, rearCameraParams);

  test("Rectilinear Model projectCcsToIcs Test", () => {
    expect(rectilinearModel?.projectCcsToIcs(input)).toEqual(output);
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
