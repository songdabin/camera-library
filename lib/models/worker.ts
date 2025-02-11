import { parentPort } from "worker_threads";
import { icsToVcsPoints } from "./buffer_attribute";
import path = require("path");
import * as fs from "fs";
import { splitData } from "../services/split_data";

parentPort?.on("message", (point) => {
  const rearFilePath = path.join(process.cwd(), "assets", "svc_rear.yaml");
  const rearFileContent = fs.readFileSync(rearFilePath, "utf8");
  const [rearCameraType, rearCameraParams] = splitData(rearFileContent);

  const vcsPoints = icsToVcsPoints(rearCameraParams, point);

  fs.writeFile("worker.txt", vcsPoints.array.toString(), function (err) {
    if (err) throw err;
    console.log("successfully saved.");
  });

  parentPort?.postMessage(vcsPoints.getX(0));
  parentPort?.close();
});
