import { FisheyeModel } from "../models/fisheye_model";
import { RectilinearModel } from "../models/rectilinear_model";
import { CreateModel } from "../services/create_model";

test("Fisheye Model Create Test", () => {
  expect(CreateModel("fisheye")).toBeInstanceOf(FisheyeModel);
});

test("Rectilinear Model Create Test", () => {
  expect(CreateModel("standard")).toBeInstanceOf(RectilinearModel);
});
