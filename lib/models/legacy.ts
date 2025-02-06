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

/**
 * This is experimental function. It may not work properly.
 * @param lines CCS lines [Vector3Tuple, Vector3Tuple]
 * @param calibration
 */
export function getTruncatedLinesInCameraFov(
  lines: [number[], number[]][],
  hfov: number
) {
  const halfHfovTangent = Math.tan((90 - hfov / 2) * (Math.PI / 180));
  const EPS = 1e-6;

  const _lines: [number[], number[]][] = [...lines];
  for (let i = 0; i < lines.length; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      if (Math.abs(lines[i][j][0]) < EPS) lines[i][j][0] = EPS;
    }
  }

  const zPositiveMask = _lines.map(([p1, p2]) => p1[2] > 0 || p2[2] > 0);
  const isPoint0InFovMask = _lines.map((line) => {
    const [x0, , z0] = line[0];
    return z0 > -halfHfovTangent * x0 && z0 > halfHfovTangent * x0;
  });

  // isPoint1InFov 계산
  const isPoint1InFovMask = _lines.map((line) => {
    const [x1, , z1] = line[1];
    return z1 > -halfHfovTangent * x1 && z1 > halfHfovTangent * x1;
  });

  const atLeastOnePointInFovMask: boolean[] = [];
  const allPointsInFovMask: boolean[] = [];
  for (let i = 0; i < _lines.length; i += 1) {
    atLeastOnePointInFovMask.push(isPoint0InFovMask[i] || isPoint1InFovMask[i]);
    allPointsInFovMask.push(isPoint0InFovMask[i] && isPoint1InFovMask[i]);
  }

  const positiveMask: boolean[] = [];
  const onePointInFovMask: boolean[] = [];
  const noPointsInFovMask: boolean[] = [];
  for (let i = 0; i < _lines.length; i += 1) {
    positiveMask.push(
      zPositiveMask[i] &&
        (atLeastOnePointInFovMask[i] || _lines[i][0][0] * _lines[i][1][0] < 0)
    );
    onePointInFovMask.push(
      atLeastOnePointInFovMask[i] && !allPointsInFovMask[i]
    );
    noPointsInFovMask.push(
      zPositiveMask[i] &&
        !atLeastOnePointInFovMask[i] &&
        _lines[i][0][0] * _lines[i][1][0] < 0
    );
  }

  const poLines = _lines.filter((_, i) => onePointInFovMask[i]);
  const pnLines = _lines.filter((_, i) => noPointsInFovMask[i]);
  if (onePointInFovMask.includes(true) && poLines.length > 0) {
    const xzLineSlopes: number[] = [];
    const xzLineIntercepts: number[] = [];
    const xyLineSlopes: number[] = [];
    const xyLineIntercepts: number[] = [];
    for (const [p1, p2] of poLines) {
      const xDiff = Math.abs(p1[0] - p2[0]) < EPS ? EPS : p1[0] - p2[0];
      const xzLineSlope = (p1[2] - p2[2]) / xDiff;
      const xzLineIntercept = p1[2] - xzLineSlope * p1[0];
      const xyLineSlope = (p1[1] - p2[1]) / xDiff;
      const xyLineIntercept = p1[1] - xyLineSlope * p1[0];

      xzLineSlopes.push(xzLineSlope);
      xzLineIntercepts.push(xzLineIntercept);
      xyLineSlopes.push(xyLineSlope);
      xyLineIntercepts.push(xyLineIntercept);
    }

    const positiveSlopes = xzLineSlopes.map((slope, i) =>
      Math.abs(halfHfovTangent - slope) < EPS ? EPS : halfHfovTangent - slope
    );
    const xPositiveIntersections = xzLineIntercepts.map(
      (intercept, i) => intercept / positiveSlopes[i]
    );
    const zPositiveIntersections = xzLineSlopes.map(
      (slope, i) => slope * xPositiveIntersections[i] + xzLineIntercepts[i]
    );
    const yPositiveIntersections = xyLineSlopes.map(
      (slope, i) => slope * xPositiveIntersections[i] + xyLineIntercepts[i]
    );

    const negativeSlopes = xzLineSlopes.map((slope, i) =>
      Math.abs(-halfHfovTangent - slope) < EPS ? EPS : -halfHfovTangent - slope
    );
    const xNegativeIntersections = xzLineIntercepts.map(
      (intercept, i) => intercept / negativeSlopes[i]
    );
    const zNegativeIntersections = xzLineSlopes.map(
      (slope, i) => slope * xNegativeIntersections[i] + xzLineIntercepts[i]
    );
    const yNegativeIntersections = xyLineSlopes.map(
      (slope, i) => slope * xNegativeIntersections[i] + xyLineIntercepts[i]
    );

    const minXs: number[] = [];
    const maxXs: number[] = [];
    for (let i = 0; i < poLines.length; i += 1) {
      const [p1, p2] = poLines[i];
      const minX = Math.min(p1[0], p2[0]);
      const maxX = Math.max(p1[0], p2[0]);
      minXs.push(minX);
      maxXs.push(maxX);
    }

    const intersectWithPositiveFovPlaneMask = xPositiveIntersections.map(
      (x, i) => x >= 0 && minXs[i] <= x && x < maxXs[i]
    );
    const intersectWithNegativeFovPlaneMask = xNegativeIntersections.map(
      (x, i) => x <= 0 && minXs[i] <= x && x < maxXs[i]
    );

    const pointOutOfFovMask: [boolean, boolean][] = [];
    for (let i = 0; i < onePointInFovMask.length; i += 1) {
      if (!onePointInFovMask[i]) continue;
      pointOutOfFovMask.push([!isPoint0InFovMask[i], !isPoint1InFovMask[i]]);
    }

    let _m;

    _m = pointOutOfFovMask.filter(
      (_, i) => intersectWithPositiveFovPlaneMask[i]
    );
    const _l = poLines.filter((_, i) => intersectWithPositiveFovPlaneMask[i]);

    _m.forEach((mask, index) => {
      const i = intersectWithPositiveFovPlaneMask.findIndex(
        (val, idx) => idx >= index && val
      );
      if (mask[0]) {
        _l[index][0][0] = xPositiveIntersections[i];
        _l[index][0][1] = yPositiveIntersections[i];
        _l[index][0][2] = zPositiveIntersections[i];
      }
      if (mask[1]) {
        _l[index][1][0] = xPositiveIntersections[i];
        _l[index][1][1] = yPositiveIntersections[i];
        _l[index][1][2] = zPositiveIntersections[i];
      }
    });

    _l.forEach((line, index) => {
      const i = intersectWithPositiveFovPlaneMask.findIndex(
        (val, idx) => idx >= index && val
      );
      poLines[i] = line;
    });

    _m = pointOutOfFovMask.filter(
      (_, i) => intersectWithNegativeFovPlaneMask[i]
    );
    const _nl = poLines.filter((_, i) => intersectWithNegativeFovPlaneMask[i]);

    _m.forEach((mask, index) => {
      const i = intersectWithNegativeFovPlaneMask.findIndex(
        (val, idx) => idx >= index && val
      );
      if (mask[0]) {
        _nl[index][0][0] = xNegativeIntersections[i];
        _nl[index][0][1] = yNegativeIntersections[i];
        _nl[index][0][2] = zNegativeIntersections[i];
      }
      if (mask[1]) {
        _nl[index][1][0] = xNegativeIntersections[i];
        _nl[index][1][1] = yNegativeIntersections[i];
        _nl[index][1][2] = zNegativeIntersections[i];
      }
    });

    _nl.forEach((line, index) => {
      const i = intersectWithNegativeFovPlaneMask.findIndex(
        (val, idx) => idx >= index && val
      );
      poLines[i] = line;
    });

    for (let i = 0; i < intersectWithPositiveFovPlaneMask.length; i += 1) {
      if (!intersectWithPositiveFovPlaneMask[i]) continue;

      const mask = pointOutOfFovMask[i];
      const intersectionX = xPositiveIntersections[i];
      const intersectionY = yPositiveIntersections[i];
      const intersectionZ = zPositiveIntersections[i];

      if (mask[0])
        poLines[i][0] = [intersectionX, intersectionY, intersectionZ];
      if (mask[1])
        poLines[i][1] = [intersectionX, intersectionY, intersectionZ];
    }

    for (let i = 0; i < intersectWithNegativeFovPlaneMask.length; i += 1) {
      if (!intersectWithNegativeFovPlaneMask[i]) continue;

      const mask = pointOutOfFovMask[i];
      const intersectionX = xNegativeIntersections[i];
      const intersectionY = yNegativeIntersections[i];
      const intersectionZ = zNegativeIntersections[i];

      if (mask[0])
        poLines[i][0] = [intersectionX, intersectionY, intersectionZ];
      if (mask[1])
        poLines[i][1] = [intersectionX, intersectionY, intersectionZ];
    }

    // Update real box line
    let positiveIndex = 0;
    for (let i = 0; i < onePointInFovMask.length; i += 1) {
      if (!onePointInFovMask[i]) continue;

      _lines[i] = poLines[positiveIndex];
      positiveIndex += 1;
    }
  }

  if (noPointsInFovMask.some((v) => v) && pnLines.length > 0) {
    const xDiff = pnLines.map(([p1, p2]) =>
      Math.abs(p1[0] - p2[0]) < EPS ? EPS : p1[0] - p2[0]
    );
    const xzLineSlopes = pnLines.map(
      ([p1, p2], i) => (p1[2] - p2[2]) / xDiff[i]
    );
    const xzLineIntercepts = pnLines.map(
      ([p1, p2], i) => p1[2] - xzLineSlopes[i] * p1[0]
    );
    const xyLineSlopes = pnLines.map(
      ([p1, p2], i) => (p1[1] - p2[1]) / xDiff[i]
    );
    const xyLineIntercepts = pnLines.map(
      ([p1, p2], i) => p1[1] - xyLineSlopes[i] * p1[0]
    );

    const positiveSlopes = xzLineSlopes.map((slope, i) =>
      Math.abs(halfHfovTangent - slope) < EPS ? EPS : halfHfovTangent - slope
    );
    const xIntersections = xzLineIntercepts.map(
      (intercept, i) => intercept / positiveSlopes[i]
    );
    const zIntersections = xzLineSlopes.map(
      (slope, i) => slope * xIntersections[i] + xzLineIntercepts[i]
    );
    const yIntersections = xyLineSlopes.map(
      (slope, i) => slope * xIntersections[i] + xyLineIntercepts[i]
    );

    const negativeSlopes = xzLineSlopes.map((slope, i) =>
      Math.abs(-halfHfovTangent - slope) < EPS ? EPS : -halfHfovTangent - slope
    );
    const xNegativeIntersections = xzLineIntercepts.map(
      (intercept, i) => intercept / negativeSlopes[i]
    );
    const zNegativeIntersections = xzLineSlopes.map(
      (slope, i) => slope * xNegativeIntersections[i] + xzLineIntercepts[i]
    );
    const yNegativeIntersections = xyLineSlopes.map(
      (slope, i) => slope * xNegativeIntersections[i] + xyLineIntercepts[i]
    );

    const largerMask = pnLines.map(([p1, p2]) => p1[0] > p2[0]);
    const smallerMask = largerMask.map((v) => !v);

    for (let i = 0; i < largerMask.length; i += 1) {
      if (!largerMask[i]) continue;
      pnLines[i][0] = [xIntersections[i], yIntersections[i], zIntersections[i]];
    }
    for (let i = 0; i < smallerMask.length; i += 1) {
      if (!smallerMask[i]) continue;
      pnLines[i][1] = [
        zNegativeIntersections[i],
        yNegativeIntersections[i],
        zNegativeIntersections[i],
      ];
    }

    // Update real box line
    let negativeIndex = 0;
    for (let i = 0; i < noPointsInFovMask.length; i += 1) {
      if (!noPointsInFovMask[i]) continue;

      _lines[i] = pnLines[negativeIndex];
      negativeIndex += 1;
    }
  }

  return { lines: _lines, positiveMask };
}
