import { FisheyeModel } from "../models/fisheye_model";
import { RectilinearModel } from "../models/rectilinear_model";
import { CreateModel } from "../services/create_model";

test("Fisheye Model Create Test", () => {
  expect(CreateModel("svc_front.yaml")).toBeInstanceOf(FisheyeModel);
});

test("Rectilinear Model Create Test", () => {
  expect(CreateModel("svc_rear.yaml")).toBeInstanceOf(RectilinearModel);
});
