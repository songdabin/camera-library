import { loadYamlFileSync } from "load-yaml-file";

async function read_yaml(file_name: string) {
  const l_data: any = await loadYamlFileSync(file_name);

  return l_data;
}

export { read_yaml };
