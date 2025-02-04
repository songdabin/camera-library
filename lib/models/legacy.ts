import { Matrix4, Quaternion, Vector3 } from "three";
import {
  getHomogeneousTransformMatrix,
  LtMatrix4,
  matrix4to3,
  multiplyMatrix4,
  multiplyMatrix4byIntrinsicTranspose,
  toHomogeneous,
  transpose,
} from "../types/LtMatrix4";
import { CameraModelType, Extrinsic, Intrinsic } from "../types/type";
import { Cuboid } from "../types/Cuboid";

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

  const extrinsicT = extrinsicMatrix;
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

  const distScale =
    theta < fov
      ? legacyFisheyeDistortThetas(theta, intrinsic)
      : theta * thetaSlope;

  const dnx = distScale * Math.cos(phi);
  const dny = distScale * Math.sin(phi);

  const x = intrinsic.fx * dnx + intrinsic.cx;
  const y = intrinsic.fy * dny + intrinsic.cy;
  const isInImage = x >= 0 && x < width && y >= 0 && y < height;
  return { x, y, isInImage };
}

// https://darkpgmr.tistory.com/31
// https://carstart.tistory.com/181
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
    if (Math.abs(icsPoints[i + 2]) < Number.EPSILON) z = Number.EPSILON;
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

export function legacyVcsCuboidToCcsPoints(
  vcsCuboid: Cuboid,
  order: "zyx",
  extrinsic: Extrinsic
) {
  const vcsPoints = legacyVcsCuboidToVcsPoints(vcsCuboid, order);

  const vcsPointArray: Vector3[] = [];

  for (let i = 0; i < 24; i += 3) {
    vcsPointArray.push(
      new Vector3(vcsPoints[i], vcsPoints[i + 1], vcsPoints[i + 2])
    );
  }

  const ccsPointsArray: Vector3[] = [];

  vcsPointArray.forEach((vcsPoint) => {
    const numberArray: number[] = vcsPoint.toArray();
    const ccsPoints = legacyProjectVcsToCcs(numberArray, extrinsic);
    ccsPointsArray.push(new Vector3(ccsPoints[0], ccsPoints[1], ccsPoints[2]));
  });

  return ccsPointsArray;
}

export function legacyVcsCuboidToVcsPoints(cuboid: Cuboid, order: "zyx") {
  // prettier-ignore
  const {
        x: tx, y: ty, z: tz,
        yaw, roll, pitch,
        width, height, length,
      } = cuboid;
  const transformMatrix = getHomogeneousTransformMatrix({
    angle: { yaw, roll, pitch },
    translation: { tx, ty, tz },
    order,
  });

  const [y, z, x] = [width / 2, height / 2, length / 2];
  // prettier-ignore
  const points = [
      x, y, -z, 1, // front left bottom
      x, -y, -z, 1, // front right bottom
      x, -y, z, 1, // front right top
      x, y, z, 1, // front left top
      
      -x, y, -z, 1, // rear left bottom
      -x, -y, -z, 1, // rear right bottom
      -x, -y, z, 1, // rear right top
      -x, y, z, 1, // rear left top
    ];
  const vcsPoints = multiplyMatrix4(
    points,
    transformMatrix.transpose().elements()
  );

  return matrix4to3(vcsPoints);
}

/**
 * Undistort ICS points
 *
 * @param points distorted N * 3 ICS matrix
 * @param calibration Calibration
 * @returns undistorted N * 3 ICS matrix
 */
export function undistortIcsPoints(point: number[], intrinsic: Intrinsic) {
  const { fx, fy, cx, cy } = intrinsic;

  point[0] = (point[0] - cx) / fx;
  point[1] = (point[1] - cy) / fy;

  const undistortedPoints: number[] = [];

  const x = point[0];
  const y = point[1];
  const z = point[2];

  const [undistortedX, undistortedY] = undistortPointStandardCam(
    x,
    y,
    intrinsic
  );

  undistortedPoints.push(undistortedX * fx + cx, undistortedY * fy + cy, z);

  return undistortedPoints;
}

export function undistortPointStandardCam(
  u: number,
  v: number,
  intrinsic: Intrinsic
) {
  const { k1, k2, k3, k4, p1, p2 } = intrinsic;

  const x0 = u;
  const y0 = v;
  let undistortedU = u;
  let undistortedY = v;
  for (let i = 0; i < 5; i += 1) {
    const r2 = undistortedU ** 2 + undistortedY ** 2;
    const radialDInv =
      (1 + k4 * r2) / (1 + k1 * r2 + k2 * r2 ** 2 + k3 * r2 ** 3);
    const deltaX =
      2 * p1 * undistortedU * undistortedY + p2 * (r2 + 2 * undistortedU ** 2);
    const deltaY =
      p1 * (r2 + 2 * undistortedY ** 2) + 2 * p2 * undistortedU * undistortedY;

    undistortedU = (x0 - deltaX) * radialDInv;
    undistortedY = (y0 - deltaY) * radialDInv;
  }

  return [undistortedU, undistortedY];
}

/**
 * Convert ICS points to VCS points
 *
 * @param points distorted N * 3 ICS matrix
 * @param calibration Calibration
 * @returns N * 3 VCS points
 */
export function icsToVcsPoints(points: number[], calibration: CameraModelType) {
  const ccsPoints = icsToCcsPoints(points, calibration.intrinsic);

  const vcsPoints = ccsToVcsPoints(ccsPoints, calibration.vcsExtrinsic);

  return vcsPoints;
}

/**
 * Convert ICS points to CCS points
 *
 * @param icsPoints N * 3 ICS matrix
 * @param calibration Calibration
 * @returns N * 3 CCS matrix
 */
export function icsToCcsPoints(icsPoints: number[], intrinsic: Intrinsic) {
  // prettier-ignore
  const intrinsicArray = [
    intrinsic.fx, 0, intrinsic.cx, 0,
    0, intrinsic.fy, intrinsic.cy, 0,
    0, 0, 1, 0,
  ];

  const intrinsicInvT = new LtMatrix4()
    .setFromMatrix3by4(intrinsicArray)
    .invert()
    .transpose()
    .elements();

  const undistortedIcsPoints = undistortIcsPoints(icsPoints, intrinsic);

  for (let i = 0; i < undistortedIcsPoints.length; i += 3) {
    const z = undistortedIcsPoints[i + 2];
    undistortedIcsPoints[i] *= z;
    undistortedIcsPoints[i + 1] *= z;
  }

  const ccsPoints = multiplyMatrix4(
    toHomogeneous(undistortedIcsPoints),
    intrinsicInvT
  );

  return matrix4to3(ccsPoints);
}

/**
 * Convert CCS points to VCS points
 *
 * @param points N * 3 CCS matrix
 * @param calibration Calibration
 * @returns N * 3 VCS matrix
 */
export function ccsToVcsPoints(points: number[], extrinsic: Extrinsic) {
  const { qw, qx, qy, qz } = extrinsic;
  const quaternion = new Quaternion(qx, qy, qz, qw);

  const { tx, ty, tz } = extrinsic;
  const extrinsicMatrix = new Matrix4()
    .makeRotationFromQuaternion(quaternion)
    .setPosition(tx, ty, tz)
    .transpose(); // Matrix4 is column-major order, so need to transpose to set this as LtMatrix4

  const extrinsicInvT = new LtMatrix4(extrinsicMatrix.toArray())
    .invert()
    .transpose()
    .elements();

  const vcsPoints = multiplyMatrix4(toHomogeneous(points), extrinsicInvT);

  return matrix4to3(vcsPoints);
}
