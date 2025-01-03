import * as fs from "fs";
import { parseYaml } from "./parse_yaml";

export function readYaml(fileName: string) {
  const fileContent = fs.readFileSync(fileName, "utf8");

  return parseYaml(fileContent);
}
