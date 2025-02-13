import path = require("path");
import * as fs from "fs";
import { splitData } from "../services/split_data";
import { icsToVcsPoints } from "../models/buffer_attribute";

type MessageHandler = (msg: number[]) => void;

class WorkerSetup {
  url: string;
  onmessage: MessageHandler;
  constructor(stringUrl: string) {
    this.url = stringUrl;
    this.onmessage = (e) => {
      this.doSomethingComplicated(e);
    };
  }
  postMessage(msg: number[]): void {
    this.onmessage(msg);
  }

  doSomethingComplicated(point: number[]) {
    const rearFilePath = path.join(process.cwd(), "assets", "svc_rear.yaml");
    const rearFileContent = fs.readFileSync(rearFilePath, "utf8");
    const [rearCameraType, rearCameraParams] = splitData(rearFileContent);

    const vcsPoints =
      icsToVcsPoints(rearCameraParams, point).array.toString() + " / ";

    fs.writeFile("worker.txt", vcsPoints, function (err) {
      if (err) throw err;
    });
  }
}

Object.defineProperty(window, "Worker", {
  writable: true,
  value: WorkerSetup,
});
