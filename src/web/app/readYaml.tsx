import { loadYamlFileSync } from "load-yaml-file";
import { Camera } from "./cameraModel";

async function readYaml(fileName: string) {
  const lData: any = await loadYamlFileSync(fileName);

  const rtnVal: Camera = new Camera(
    lData.channel,
    lData.sensor,
    lData.distortion_model,
    lData.hfov,
    lData.height,
    lData.width,
    lData.intrinsic,
    lData.vcs_extrinsic,
    lData.lcs_extrinsic,
    lData.mvcs_extrinsic
  );

  return rtnVal;
}

export { readYaml };
