import { Worker, WorkerOptions } from "worker_threads";
import { workerInput } from "./testcase";

function workerTs(filename: string, workerOptions: WorkerOptions) {
  workerOptions.eval = true;
  if (!workerOptions.workerData) {
    workerOptions.workerData = {};
  }
  workerOptions.workerData.__filename = filename;
  return new Worker(
    `
  const wk = require('worker_threads');
  require('ts-node').register();
  let file = wk.workerData.__filename;
  require(file);
  `,
    workerOptions
  );
}

let workerPath = "./models/worker.ts";
let myWorker = workerTs(workerPath, {});

async function worker() {
  const point: number[] = workerInput;

  myWorker.postMessage(point);

  myWorker.on("message", (data) => {
    // console.log("Message from worker:", data);
  });

  myWorker.on("error", (error: Error) => {
    console.error("Error in worker:", error);
  });
}

test("Worker Test", () => {
  worker();
});
