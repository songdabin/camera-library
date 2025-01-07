import { parseYaml } from "./parse_yaml";
import { readFile } from "./read_file";
import { splitData } from "./split_data";

export function readYaml(fileName: string) {
  const fileContent = readFile(fileName);

  const [cameraType, cameraParams] = splitData(fileContent);

  return parseYaml(cameraParams);
}
