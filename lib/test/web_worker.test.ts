import { workerInput } from "./testcase";

jest.mock("./worker_setup.ts");

test("Worker Test", () => {
  const worker = new Worker("./worker.js");

  worker.postMessage(workerInput);

  worker.onmessage = (e) => {
    console.log(e);
  };
});
