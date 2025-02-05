import { Line3, Vector3 } from "three";
import { Intrinsic } from "../types/type";

export function project(point: Vector3, intrinsic: Intrinsic): Vector3 {
  const { fx, fy, cx, cy } = intrinsic;

  const projectedX = point.x * fx + cx;
  const projectedY = point.y * fy + cy;

  return new Vector3(projectedX, projectedY, point.z);
}

export function unproject(point: Vector3, intrinsic: Intrinsic): Vector3 {
  const { fx, fy, cx, cy } = intrinsic;

  const unprojectedX = (point.x - cx) / fx;
  const unprojectedY = (point.y - cy) / fy;

  point.set(unprojectedX, unprojectedY, point.z);

  return point;
}

export function distortRectilinear(
  point: Vector3,
  intrinsic: Intrinsic
): Vector3 {
  const { x, y, z } = point;
  const { k1, k2, k3, k4, k5, k6, p1, p2 } = intrinsic;

  const r2 = x ** 2 + y ** 2;
  const radialD =
    (1 + k1 * r2 + k2 * r2 ** 2 + k3 * r2 ** 3) /
    (1 + k4 * r2 + k5 * r2 ** 2 + k6 * r2 ** 3);
  const distortedX = x * radialD + 2 * p1 * (x * y) + p2 * (r2 + 2 * x ** 2);
  const distortedY = y * radialD + p1 * (r2 + 2 * y ** 2) + 2 * p2 * (x * y);

  return new Vector3(distortedX, distortedY, z);
}

export function undistortRectilinear(
  point: Vector3,
  intrinsic: Intrinsic
): Vector3 {
  const { k1, k2, k3, k4, p1, p2 } = intrinsic;
  const { x, y } = point;

  const x0 = x;
  const y0 = y;

  let undistortedX = x;
  let undistortedY = y;

  for (let i = 0; i < 5; i += 1) {
    const r2 = undistortedX ** 2 + undistortedY ** 2;
    const radialDInv =
      (1 + k4 * r2) / (1 + k1 * r2 + k2 * r2 ** 2 + k3 * r2 ** 3);
    const deltaX =
      2 * p1 * undistortedX * undistortedY + p2 * (r2 + 2 * undistortedX ** 2);
    const deltaY =
      p1 * (r2 + 2 * undistortedY ** 2) + 2 * p2 * undistortedX * undistortedY;

    undistortedX = (x0 - deltaX) * radialDInv;
    undistortedY = (y0 - deltaY) * radialDInv;
  }

  return point.set(undistortedX, undistortedY, point.z);
}

function getIntersections(
  xzLineSlopes: number[],
  xyLineSlopes: number[],
  xyLineIntercepts: number[],
  xzLineIntercepts: number[],
  halfHfovTangent: number
) {
  const positiveSlopes = xzLineSlopes.map((slope, i) =>
    Math.abs(halfHfovTangent - slope) < Number.EPSILON
      ? Number.EPSILON
      : halfHfovTangent - slope
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
    Math.abs(-halfHfovTangent - slope) < Number.EPSILON
      ? Number.EPSILON
      : -halfHfovTangent - slope
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

  return [
    xPositiveIntersections,
    zPositiveIntersections,
    yPositiveIntersections,
    xNegativeIntersections,
    zNegativeIntersections,
    yNegativeIntersections,
  ];
}

export function getTruncatedLinesInCameraFov(lines: Line3[], hfov: number) {
  const halfHfovTangent = Math.tan((90 - hfov / 2) * (Math.PI / 180));
  const EPS = Number.EPSILON;

  const _lines: Line3[] = [...lines];
  lines.forEach((line) => {
    if (Math.abs(line.start.x) < EPS) line.start.x = EPS;
    if (Math.abs(line.end.x) < EPS) line.end.x = EPS;
  });

  const zPositiveMask = _lines.map(
    (line) => line.start.z > 0 || line.end.z > 0
  );
  const isPoint0InFovMask = _lines.map((line) => {
    const [x0, , z0] = line.start;
    return z0 > -halfHfovTangent * x0 && z0 > halfHfovTangent * x0;
  });

  // isPoint1InFov 계산
  const isPoint1InFovMask = _lines.map((line) => {
    const [x1, , z1] = line.end;
    return z1 > -halfHfovTangent * x1 && z1 > halfHfovTangent * x1;
  });

  const atLeastOnePointInFovMask: boolean[] = [];
  const allPointsInFovMask: boolean[] = [];

  const positiveMask: boolean[] = [];
  const onePointInFovMask: boolean[] = [];
  const noPointsInFovMask: boolean[] = [];

  _lines.forEach((line, i) => {
    atLeastOnePointInFovMask.push(isPoint0InFovMask[i] || isPoint1InFovMask[i]);
    allPointsInFovMask.push(isPoint0InFovMask[i] && isPoint1InFovMask[i]);

    positiveMask.push(
      zPositiveMask[i] &&
        (atLeastOnePointInFovMask[i] || line.start.x * line.end.x < 0)
    );
    onePointInFovMask.push(
      atLeastOnePointInFovMask[i] && !allPointsInFovMask[i]
    );
    noPointsInFovMask.push(
      zPositiveMask[i] &&
        !atLeastOnePointInFovMask[i] &&
        line.start.x * line.end.x < 0
    );
  });

  const onePointLines = _lines.filter((_, i) => onePointInFovMask[i]);
  const noPointLines = _lines.filter((_, i) => noPointsInFovMask[i]);
  if (onePointInFovMask.includes(true) && onePointLines.length > 0) {
    const xzLineSlopes: number[] = [];
    const xzLineIntercepts: number[] = [];
    const xyLineSlopes: number[] = [];
    const xyLineIntercepts: number[] = [];

    onePointLines.forEach((onePointLine) => {
      const xDiff =
        Math.abs(onePointLine.start.x - onePointLine.end.x) < EPS
          ? EPS
          : onePointLine.start.x - onePointLine.end.x;
      const xzLineSlope = (onePointLine.start.z - onePointLine.end.z) / xDiff;
      // slope * x = ?
      // z - slope * z = ?
      const xzLineIntercept =
        onePointLine.start.z - xzLineSlope * onePointLine.start.x;
      const xyLineSlope = (onePointLine.start.y - onePointLine.end.y) / xDiff;
      const xyLineIntercept =
        onePointLine.start.y - xyLineSlope * onePointLine.start.x;

      xzLineSlopes.push(xzLineSlope);
      xzLineIntercepts.push(xzLineIntercept);
      xyLineSlopes.push(xyLineSlope);
      xyLineIntercepts.push(xyLineIntercept);
    });

    // prettier-ignore
    const [
      xPositiveIntersections, zPositiveIntersections, yPositiveIntersections,
      xNegativeIntersections, zNegativeIntersections, yNegativeIntersections,
    ] = getIntersections(
      xzLineSlopes,
      xyLineIntercepts,
      xyLineIntercepts,
      xzLineIntercepts,
      halfHfovTangent
    );

    const minXs: number[] = [];
    const maxXs: number[] = [];

    onePointLines.forEach((onePointLine) => {
      const { start, end } = onePointLine;
      const minX = Math.min(start.x, end.x);
      const maxX = Math.max(start.x, end.x);
      minXs.push(minX);
      maxXs.push(maxX);
    });

    const intersectWithPositiveFovPlaneMask = xPositiveIntersections.map(
      (x, i) => x >= 0 && minXs[i] <= x && x < maxXs[i]
    );
    const intersectWithNegativeFovPlaneMask = xNegativeIntersections.map(
      (x, i) => x <= 0 && minXs[i] <= x && x < maxXs[i]
    );

    const pointOutOfFovMask: [boolean, boolean][] = [];

    onePointInFovMask.forEach((onePointInFov, i) => {
      if (!onePointInFov) return;
      pointOutOfFovMask.push([!isPoint0InFovMask[i], !isPoint1InFovMask[i]]);
    });

    let _m;

    _m = pointOutOfFovMask.filter(
      (_, i) => intersectWithPositiveFovPlaneMask[i]
    );
    const _l = onePointLines.filter(
      (_, i) => intersectWithPositiveFovPlaneMask[i]
    );

    // prettier-ignore
    _m.forEach((mask, index) => {
      const i = intersectWithPositiveFovPlaneMask.findIndex(
        (val, idx) => idx >= index && val
      );
      if (mask[0]) {
        _l[index].start.set(xPositiveIntersections[i], yPositiveIntersections[i], zPositiveIntersections[i]);
      }
      if (mask[1]) {
        _l[index].end.set(xPositiveIntersections[i], yPositiveIntersections[i], zPositiveIntersections[i]);
      }
    });

    _l.forEach((line, index) => {
      const i = intersectWithPositiveFovPlaneMask.findIndex(
        (val, idx) => idx >= index && val
      );
      onePointLines[i] = line;
    });

    _m = pointOutOfFovMask.filter(
      (_, i) => intersectWithNegativeFovPlaneMask[i]
    );
    const _nl = onePointLines.filter(
      (_, i) => intersectWithNegativeFovPlaneMask[i]
    );

    // prettier-ignore
    _m.forEach((mask, index) => {
      const i = intersectWithNegativeFovPlaneMask.findIndex(
        (val, idx) => idx >= index && val
      );
      if (mask[0]) {
        _nl[index].start.set(xNegativeIntersections[i], yNegativeIntersections[i], zNegativeIntersections[i])
      }
      if (mask[1]) {
        _nl[index].end.set(xNegativeIntersections[i], yNegativeIntersections[i], zNegativeIntersections[i])
      }
    });

    _nl.forEach((line, index) => {
      const i = intersectWithNegativeFovPlaneMask.findIndex(
        (val, idx) => idx >= index && val
      );
      onePointLines[i] = line;
    });

    // prettier-ignore
    intersectWithPositiveFovPlaneMask.forEach((positiveMask, i) => {
      if (!positiveMask) return;

      const mask = pointOutOfFovMask[i];

      if (mask[0])
        onePointLines[i].start.set(xPositiveIntersections[i], yPositiveIntersections[i], zPositiveIntersections[i]);
      if (mask[1])
        onePointLines[i].end.set(xPositiveIntersections[i], yPositiveIntersections[i], zPositiveIntersections[i]);
    });

    // prettier-ignore
    intersectWithNegativeFovPlaneMask.forEach((negativeMask, i) => {
      if (!negativeMask) return;

      const mask = pointOutOfFovMask[i];

      if (mask[0])
        onePointLines[i].start.set(xNegativeIntersections[i], yPositiveIntersections[i], zPositiveIntersections[i]);
      if (mask[1])
        onePointLines[i].end.set(xNegativeIntersections[i], yPositiveIntersections[i], zPositiveIntersections[i]);
    });

    // Update real box line
    let positiveIndex = 0;
    onePointInFovMask.forEach((mask, i) => {
      if (!mask) return;

      _lines[i] = onePointLines[positiveIndex];
      positiveIndex++;
    });
  }

  // prettier-ignore
  if (noPointsInFovMask.some((v) => v) && noPointLines.length > 0) {
    const xDiff = noPointLines.map((noPointLine) =>
      Math.abs(noPointLine.start.x - noPointLine.end.x) < EPS ? EPS : noPointLine.start.x - noPointLine.end.x
    );
    const xzLineSlopes = noPointLines.map(
      (noPointLine, i) => (noPointLine.start.z - noPointLine.end.z) / xDiff[i]
    );
    const xzLineIntercepts = noPointLines.map(
      (noPointLine, i) => noPointLine.start.z - xzLineSlopes[i] * noPointLine.start.x
    );
    const xyLineSlopes = noPointLines.map(
      (noPointLine, i) => (noPointLine.start.y - noPointLine.end.y) / xDiff[i]
    );
    const xyLineIntercepts = noPointLines.map(
      (noPointLine, i) => noPointLine.start.y - xyLineSlopes[i] * noPointLine.start.x
    );

    const [
      xIntersections, zIntersections, yIntersections,
      xNegativeIntersections, zNegativeIntersections, yNegativeIntersections,
    ] = getIntersections(
      xzLineSlopes,
      xyLineIntercepts,
      xyLineIntercepts,
      xzLineIntercepts,
      halfHfovTangent
    );

    const largerMask = noPointLines.map((noPointLine) => noPointLine.start.x > noPointLine.end.x);
    const smallerMask = largerMask.map((v) => !v);

    largerMask.forEach((element, i) => {
      if (!element) return;
      noPointLines[i].start.set(xIntersections[i], yIntersections[i], zIntersections[i]);
    });

    smallerMask.forEach((element, i) => {
      if (!element) return;
      noPointLines[i].end.set(zNegativeIntersections[i], yNegativeIntersections[i], zNegativeIntersections[i]);
    });
 
    // Update real box line
    let negativeIndex = 0;
    noPointsInFovMask.forEach((element, i) => {
      if (!element) return;

      _lines[i] = noPointLines[negativeIndex];
      negativeIndex ++;
    });
  }

  return { lines: _lines, positiveMask };
}
