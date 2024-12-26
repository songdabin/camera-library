import * as fs from "fs";

export function readYaml(fileName: string) {
  let fileContent = fs.readFileSync(fileName, "utf8");

  let splitFileContent = fileContent.split(":");
  console.log(splitFileContent[0]);

  return fileContent;
}
