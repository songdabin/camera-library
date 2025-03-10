import { createModel } from "./create_model";
import { parseYaml } from "./parse_yaml";
import { readFile } from "./read_file";
import { splitData } from "./split_data";

export function readYaml(fileName: string) {
  const fileData = readFile(fileName);
  const [cameraType, cameraParams] = splitData(fileData);
  const modelData = createModel(cameraType, parseYaml(cameraParams));

  return modelData;
}
