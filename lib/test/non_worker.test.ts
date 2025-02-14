import * as fs from "fs";
import path = require("path");
import { createModel } from "../services/create_model";
import { splitData } from "../services/split_data";
import { nonWorkerInput } from "./testcase";

const rearFilePath = path.join(process.cwd(), "assets", "svc_rear.yaml");
const rearFileContent = fs.readFileSync(rearFilePath, "utf8");
const [rearCameraType, rearCameraParams] = splitData(rearFileContent);
const rectilinearModel = createModel(rearCameraType, rearCameraParams);

nonWorkerInput.forEach((input) => {
  test("Non Worker Test", () => {
    const result =
      rectilinearModel?.icsToVcsPoint(input)!.toArray().toString() + " / ";

    fs.appendFileSync("non_worker.txt", result);
  });
});
