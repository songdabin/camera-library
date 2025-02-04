import * as fs from "fs";
import path = require("path");
import { createModel } from "../services/create_model";
import { splitData } from "../services/split_data";
import {
  getCcsLinesFromCuboidTestCase,
  vcsToIcsCuboidLinesTestCase,
} from "./testcase";

const frontFilePath = path.join(process.cwd(), "assets", "svc_front.yaml");
const frontFileContent = fs.readFileSync(frontFilePath, "utf8");
const [frontCameraType, frontCameraParams] = splitData(frontFileContent);
const fisheyeModel = createModel(frontCameraType, frontCameraParams);

const rearFilePath = path.join(process.cwd(), "assets", "svc_rear.yaml");
const rearFileContent = fs.readFileSync(rearFilePath, "utf8");
const [rearCameraType, rearCameraParams] = splitData(rearFileContent);
const rectilinearModel = createModel(rearCameraType, rearCameraParams);

getCcsLinesFromCuboidTestCase.forEach(({ input, output }) => {
  test("getCcsLinesFromCuboid Test", () => {
    expect(rectilinearModel?.getCcsLinesFromCuboid(input, "zyx")).toEqual(
      output
    );
  });
});

console.log(
  "rectilinear vcs to ics cuboid lines",
  rectilinearModel?.vcsCuboidToIcsCuboidLines(
    vcsToIcsCuboidLinesTestCase,
    "zyx"
  )
);

console.log(
  "fisheye vcs to ics cuboid lines",
  fisheyeModel?.vcsCuboidToIcsCuboidLines(vcsToIcsCuboidLinesTestCase, "zyx")
);
