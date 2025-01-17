import { Matrix4, Quaternion, Vector3, Vector3Tuple } from "three";
import {
  getHomogeneousTransformMatrix,
  matrix4to3,
  multiplyMatrix4,
  multiplyMatrix4byIntrinsicTranspose,
  toHomogeneous,
  transpose,
} from "../types/LtMatrix4";
import { CameraModelType, Cuboid, Extrinsic, Intrinsic } from "../types/type";

export function legacyProjectVcsToCcs(
  vcsPoints: number[],
  extrinsic: Extrinsic
) {
  const homoVcsPoints = toHomogeneous(vcsPoints);

  const { qw, qx, qy, qz } = extrinsic;
  const quaternion = new Quaternion(qx, qy, qz, qw);

  const { tx, ty, tz } = extrinsic;
  const extrinsicMatrix = new Matrix4()
    .makeRotationFromQuaternion(quaternion)
    .setPosition(tx, ty, tz);

  const extrinsicT = extrinsicMatrix.transpose();
  const ccsPoints = multiplyMatrix4(homoVcsPoints, extrinsicT.toArray());

  return matrix4to3(ccsPoints);
}

export function legacyFisheyeDistortThetas(
  theta: number,
  intrinsic: Intrinsic
) {
  const theta2 = theta ** 2;
  const theta4 = theta ** 4;
  const theta6 = theta2 * theta4;
  const theta8 = theta4 * theta4;
  const thetaD =
    theta *
    (1 +
      intrinsic.k1 * theta2 +
      intrinsic.k2 * theta4 +
      intrinsic.k3 * theta6 +
      intrinsic.k4 * theta8);

  return thetaD;
}

// Question
// r 대신 fov? theta?
// https://carstart.tistory.com/181
// x_corrected = x(1 + k1*r^2 + k2*r^2 + k3*r^6)
// x -> distorted_point(original)

export function legacyFisheyeProjectCcsToIcs(
  point: Vector3,
  hfov: number,
  width: number,
  height: number,
  intrinsic: Intrinsic
) {
  const uswPoint = point.clone().normalize();
  const theta = Math.acos(uswPoint.z);
  const phi = Math.atan2(uswPoint.y, uswPoint.x);

  const fov = hfov;
  const thetaSlope =
    1 +
    intrinsic.k1 * fov ** 2 +
    intrinsic.k2 * fov ** 4 +
    intrinsic.k3 * fov ** 6 +
    intrinsic.k4 * fov ** 8;

  // theta가 fov보다 크면 fov 사용 (fov의 범위를 theta가 넘어갈 수 없음)
  const distScale =
    theta < fov
      ? legacyFisheyeDistortThetas(theta, intrinsic)
      : theta * thetaSlope;

  // Question
  // ?
  const dnx = distScale * Math.cos(phi);
  const dny = distScale * Math.sin(phi);

  const x = intrinsic.fx * dnx + intrinsic.cx;
  const y = intrinsic.fy * dny + intrinsic.cy;
  const isInImage = x >= 0 && x < width && y >= 0 && y < height;
  return { x, y, isInImage };
}

// https://darkpgmr.tistory.com/31
// https://carstart.tistory.com/181
// 접선왜곡 p1, p2
// x_corrected = x[2*p1*y + p2(r^2 + 2*x^2)]
// y_corrected = y[2*p2*x + p2(r^2 + 2*y^2)]
export function legacyRectiliniearProjectCcsToIcs(
  ccsPoints: number[],
  intrinsic: Intrinsic,
  width: number,
  height: number
) {
  // 3 * 4 to 4 * 3
  const homoCcsPoints = toHomogeneous(ccsPoints);

  // prettier-ignore
  const intrinsicArray = [
    intrinsic.fx, 0, intrinsic.cx, 0,
    0, intrinsic.fy, intrinsic.cy, 0,
    0, 0, 1, 0,
  ];
  const intrinsicT = transpose(intrinsicArray, 4);

  const icsPoints = multiplyMatrix4byIntrinsicTranspose(
    homoCcsPoints,
    intrinsicT
  );

  const normalizedIcsPoints = [];
  for (let i = 0; i < icsPoints.length; i += 3) {
    let z = icsPoints[i + 2];
    // Question
    // EPS?
    // if (Math.abs(icsPoints[i + 2]) < EPS) z = EPS;
    const x = icsPoints[i] / z;
    const y = icsPoints[i + 1] / z;

    normalizedIcsPoints.push(x, y, z);
  }

  const distortedIcsPoints = distortIcsPoints(normalizedIcsPoints, intrinsic);

  const isInImage =
    distortedIcsPoints[0] >= 0 &&
    distortedIcsPoints[0] < width &&
    distortedIcsPoints[1] >= 0 &&
    distortedIcsPoints[1] < height;

  const icsPoint = {
    x: distortedIcsPoints[0],
    y: distortedIcsPoints[1],
    isInImage: isInImage,
  };

  return icsPoint;
}

export function distortIcsPoints(points: number[], intrinsic: Intrinsic) {
  const { fx, fy, cx, cy, k1, k2, k3, k4, p1, p2 } = intrinsic;
  const coefficients = [k1, k2, k3, k4, p1, p2];
  const pointsInPlane: number[] = [];
  for (let i = 0; i < points.length; i += 3) {
    pointsInPlane.push(
      (points[i] - cx) / fx,
      (points[i + 1] - cy) / fy,
      points[i + 2]
    );
  }

  const distortedPoints: number[] = [];
  for (let i = 0; i < pointsInPlane.length; i += 3) {
    const x = pointsInPlane[i];
    const y = pointsInPlane[i + 1];
    const z = pointsInPlane[i + 2];

    const [distortedX, distortedY] = distortPointStandardCam(
      x,
      y,
      coefficients
    );
    distortedPoints.push(distortedX * fx + cx, distortedY * fy + cy, z);
  }

  return distortedPoints;
}

export function distortPointStandardCam(
  x: number,
  y: number,
  coefficients: number[]
) {
  const [k1, k2, k3, k4, p1, p2] = coefficients;

  const r2 = x ** 2 + y ** 2;
  const radialD = (1 + k1 * r2 + k2 * r2 ** 2 + k3 * r2 ** 3) / (1 + k4 * r2);
  const distortedX = radialD * x + 2 * p1 * (x * y) + p2 * (r2 + 2 * x ** 2);
  const distortedY = radialD * y + p1 * (r2 + 2 * y ** 2) + 2 * p2 * (x * y);

  return [distortedX, distortedY];
}
