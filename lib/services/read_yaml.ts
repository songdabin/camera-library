import * as fs from "fs";

export function readYaml(fileName: string) {
  let fileContent = fs.readFileSync(fileName, "utf8");
  console.log("file content/n", fileContent);

  return fileContent;
}
