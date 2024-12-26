import { Extrinsic, Intrinsic } from "../models/camera_model";

export function splitData(yamlData: string) {
  // 줄바꿈을 기준으로 split한 뒤, #으로 시작하는 줄(주석) 삭제
  const lines = yamlData.split("\n").filter((line) => !line.startsWith("#"));
  const data: any = {};

  // objectKey는 intrinsic, extrinsic 정보를 가지고,
  // objectData는 해당 객체의 모든 key:value 정보를 가진다
  let objectKey: string | null = null;
  let objectData: any = {};

  lines.map((line) => {
    // intrinsic, extrinsic case
    // key:로 이루어진 line
    if (line.endsWith(":")) {
      // 지금까지 처리하던 객체 정보를 data에 저장하고,
      if (objectKey) {
        data[objectKey] = objectData;
      }

      // 새로운 객체 생성
      objectKey = line.slice(0, -1).trim();
      objectData = {};
    }
    // key: value로 구성된 line
    else {
      // key: value 분리
      const [key, value] = line.split(":").map((part) => part.trim());

      // 객체 안의 key: value인 경우 objectData에 추가
      if (objectKey) {
        objectData[key] = typeParser(value);
      }
      // 객체 안에 속해있지 않고, key: value만 가지고 있는 경우 (channel, sensor, etc.)
      // data에 바로 저장
      else {
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
    console.error("필수 항목이 누락되었습니다.");
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
