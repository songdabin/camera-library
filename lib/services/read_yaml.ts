import { parseYaml } from "./parse_yaml";
import { splitData } from "./split_data";

export function readYaml(fileName: string) {
  const [cameraType, cameraParams] = splitData(fileName);

  return parseYaml(cameraParams);
}
