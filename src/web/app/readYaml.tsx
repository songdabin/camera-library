import { loadYamlFileSync } from "load-yaml-file";

async function readYaml(fileName: string) {
  const lData: any = await loadYamlFileSync(fileName);

  return lData;
}

export { readYaml };
