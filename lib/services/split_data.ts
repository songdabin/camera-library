import { Extrinsic, Intrinsic } from "../models/camera_model";

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
  const data: any = {};

  let objectKey: string | null = null;
  let objectData: any = {};

  lines.map((line) => {
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
  if (value === "true") return true;
  if (value === "false") return false;

  const numberValue = parseFloat(value);
  if (!isNaN(numberValue)) {
    return numberValue;
  }

  return value;
}

function cameraModelParser(data: any) {
  if (
    !data.channel ||
    !data.sensor ||
    !data.distortion_model ||
    !data.hfov ||
    !data.height ||
    !data.width ||
    !data.intrinsic ||
    !data.vcs_extrinsic ||
    !data.lcs_extrinsic ||
    !data.mvcs_extrinsic
  ) {
    console.error("필수 항목이 모두 입력되지 않았습니다.");
    return null;
  }

  const intrinsic: Intrinsic = {
    fx: data.intrinsic.fx,
    fy: data.intrinsic.fy,
    cx: data.intrinsic.cx,
    cy: data.intrinsic.cy,
    k1: data.intrinsic.k1,
    k2: data.intrinsic.k2,
    k3: data.intrinsic.k3,
    k4: data.intrinsic.k4,
    k5: data.intrinsic.k5 ?? 0,
    k6: data.intrinsic.k6 ?? 0,
    p1: data.intrinsic.p1,
    p2: data.intrinsic.p2,
  };

  const vcsExtrinsic: Extrinsic = {
    frameFrom: data.vcs_extrinsic.frame_from,
    frameTo: data.vcs_extrinsic.frame_to,
    qw: data.vcs_extrinsic.qw,
    qx: data.vcs_extrinsic.qx,
    qy: data.vcs_extrinsic.qy,
    qz: data.vcs_extrinsic.qz,
    tx: data.vcs_extrinsic.tx,
    ty: data.vcs_extrinsic.ty,
    tz: data.vcs_extrinsic.tz,
  };

  const lcsExtrinsic: Extrinsic = {
    frameFrom: data.lcs_extrinsic.frame_from,
    frameTo: data.lcs_extrinsic.frame_to,
    qw: data.lcs_extrinsic.qw,
    qx: data.lcs_extrinsic.qx,
    qy: data.lcs_extrinsic.qy,
    qz: data.lcs_extrinsic.qz,
    tx: data.lcs_extrinsic.tx,
    ty: data.lcs_extrinsic.ty,
    tz: data.lcs_extrinsic.tz,
  };

  const mvcsExtrinsic: Extrinsic = {
    frameFrom: data.mvcs_extrinsic.frame_from,
    frameTo: data.mvcs_extrinsic.frame_to,
    qw: data.mvcs_extrinsic.qw,
    qx: data.mvcs_extrinsic.qx,
    qy: data.mvcs_extrinsic.qy,
    qz: data.mvcs_extrinsic.qz,
    tx: data.mvcs_extrinsic.tx,
    ty: data.mvcs_extrinsic.ty,
    tz: data.mvcs_extrinsic.tz,
  };

  return {
    channel: data.channel,
    sensor: data.sensor,
    distortionModel: data.distortion_model,
    hfov: data.hfov,
    height: data.height,
    width: data.width,
    intrinsic,
    vcsExtrinsic,
    lcsExtrinsic,
    mvcsExtrinsic,
  };
}
