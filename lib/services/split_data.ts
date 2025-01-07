import { CameraModel } from "../models/camera_model";
export function splitData(yamlData: string) {
  /*
    YAML 데이터를 파싱하여 key-value 구조로 변환하는 함수
    Steps:
    1. YAML 파일의 주석 제거
    2. intrinsic과 extrinsic을 구분하여 데이터 정리
      objectKey: intrinsic, extrinsic 정보
      objectData: 객체의 모든 key:value 정보
    3. key-value 데이터를 typeParser를 통해 파싱
    4. 파싱된 모든 정보를 data에 저장해서 리턴
   */
  const lines = yamlData.split("\n").filter((line) => !line.startsWith("#"));
  const data: Record<string, any> = {};

  let objectKey: string | null = null;
  let objectData: Record<string, string | number | null> = {};

  lines.forEach((line) => {
    if (line.endsWith(":")) {
      if (objectKey) {
        data[objectKey] = objectData;
      }

      objectKey = line.slice(0, -1).trim();
      objectData = {};
    } else {
      const [key, value] = line.split(":").map((part) => part.trim());

      if (objectKey) {
        objectData[key] = typeParser(value);
      } else {
        data[key] = typeParser(value);
      }
    }
  });

  if (objectKey) {
    data[objectKey] = objectData;
  }

  return cameraModelParser(data);
}

function typeParser(value: string) {
  if (value === "null") return null;

  const numberValue = parseFloat(value);
  if (!isNaN(numberValue)) {
    return numberValue;
  }

  return value;
}

function cameraModelParser(data: Record<string, any>): CameraModel {
  const makeExtrinsic = function (inputExtrinsic: any) {
    return {
      ...inputExtrinsic,
      frameFrom: inputExtrinsic.frame_from,
      frameTo: inputExtrinsic.frame_to,
    };
  };

  return {
    channel: data.channel,
    sensor: data.sensor,
    distortionModel: data.distortion_model,
    hfov: data.hfov,
    height: data.height,
    width: data.width,
    intrinsic: data.intrinsic,
    vcsExtrinsic: makeExtrinsic(data.vcs_extrinsic),
    lcsExtrinsic: makeExtrinsic(data.lcs_extrinsic),
    mvcsExtrinsic: makeExtrinsic(data.mvcs_extrinsic),
    projectCCSToICS: (vec3) => {
      return { x: 3, y: 3, isInImage: true };
    },
  };
}
