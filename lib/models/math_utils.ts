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

export function getTruncatedLinesInCameraFov(lines: Line3[], hfov: number) {
  const halfHfovTangent = Math.tan((90 - hfov / 2) * (Math.PI / 180));
  const EPS = Number.EPSILON;

  const _lines: Line3[] = [...lines];
  for (let i = 0; i < lines.length; i += 1) {
    if (Math.abs(lines[i].start.x) < EPS) lines[i].start.x = EPS;
    if (Math.abs(lines[i].end.x) < EPS) lines[i].end.x = EPS;
  }

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
        (atLeastOnePointInFovMask[i] || _lines[i].start.x * _lines[i].end.x < 0)
    );
    onePointInFovMask.push(
      atLeastOnePointInFovMask[i] && !allPointsInFovMask[i]
    );
    noPointsInFovMask.push(
      zPositiveMask[i] &&
        !atLeastOnePointInFovMask[i] &&
        _lines[i].start.x * _lines[i].end.x < 0
    );
  }

  const poLines = _lines.filter((_, i) => onePointInFovMask[i]);
  const pnLines = _lines.filter((_, i) => noPointsInFovMask[i]);
  if (onePointInFovMask.includes(true) && poLines.length > 0) {
    const xzLineSlopes: number[] = [];
    const xzLineIntercepts: number[] = [];
    const xyLineSlopes: number[] = [];
    const xyLineIntercepts: number[] = [];

    poLines.forEach((poLine) => {
      const xDiff =
        Math.abs(poLine.start.x - poLine.end.x) < EPS
          ? EPS
          : poLine.start.x - poLine.end.x;
      const xzLineSlope = (poLine.start.z - poLine.end.z) / xDiff;
      const xzLineIntercept = poLine.start.z - xzLineSlope * poLine.start.x;
      const xyLineSlope = (poLine.start.y - poLine.end.y) / xDiff;
      const xyLineIntercept = poLine.start.y - xyLineSlope * poLine.start.x;

      xzLineSlopes.push(xzLineSlope);
      xzLineIntercepts.push(xzLineIntercept);
      xyLineSlopes.push(xyLineSlope);
      xyLineIntercepts.push(xyLineIntercept);
    });

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

    poLines.forEach((poLine) => {
      const { start, end } = poLine;
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
        _l[index].start.x = xPositiveIntersections[i];
        _l[index].start.y = yPositiveIntersections[i];
        _l[index].start.z = zPositiveIntersections[i];
      }
      if (mask[1]) {
        _l[index].end.x = xPositiveIntersections[i];
        _l[index].end.y = yPositiveIntersections[i];
        _l[index].end.z = zPositiveIntersections[i];
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
        _nl[index].start.x = xNegativeIntersections[i];
        _nl[index].start.y = yNegativeIntersections[i];
        _nl[index].start.z = zNegativeIntersections[i];
      }
      if (mask[1]) {
        _nl[index].end.x = xNegativeIntersections[i];
        _nl[index].end.y = yNegativeIntersections[i];
        _nl[index].end.z = zNegativeIntersections[i];
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
        poLines[i].start.set(intersectionX, intersectionY, intersectionZ);
      if (mask[1])
        poLines[i].end.set(intersectionX, intersectionY, intersectionZ);
    }

    for (let i = 0; i < intersectWithNegativeFovPlaneMask.length; i += 1) {
      if (!intersectWithNegativeFovPlaneMask[i]) continue;

      const mask = pointOutOfFovMask[i];
      const intersectionX = xNegativeIntersections[i];
      const intersectionY = yNegativeIntersections[i];
      const intersectionZ = zNegativeIntersections[i];

      if (mask[0])
        poLines[i].start.set(intersectionX, intersectionY, intersectionZ);
      if (mask[1])
        poLines[i].end.set(intersectionX, intersectionY, intersectionZ);
    }

    // Update real box line
    let positiveIndex = 0;
    for (let i = 0; i < onePointInFovMask.length; i += 1) {
      if (!onePointInFovMask[i]) continue;

      _lines[i] = poLines[positiveIndex];
      positiveIndex += 1;
    }
  }

  // prettier-ignore
  if (noPointsInFovMask.some((v) => v) && pnLines.length > 0) {
    const xDiff = pnLines.map((pnLine) =>
      Math.abs(pnLine.start.x - pnLine.end.x) < EPS ? EPS : pnLine.start.x - pnLine.end.x
    );
    const xzLineSlopes = pnLines.map(
      (pnLine, i) => (pnLine.start.z - pnLine.end.z) / xDiff[i]
    );
    const xzLineIntercepts = pnLines.map(
      (pnLine, i) => pnLine.start.z - xzLineSlopes[i] * pnLine.start.x
    );
    const xyLineSlopes = pnLines.map(
      (pnLine, i) => (pnLine.start.y - pnLine.end.y) / xDiff[i]
    );
    const xyLineIntercepts = pnLines.map(
      (pnLine, i) => pnLine.start.y - xyLineSlopes[i] * pnLine.start.x
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

    const largerMask = pnLines.map((pnLine) => pnLine.start.x > pnLine.end.x);
    const smallerMask = largerMask.map((v) => !v);

    for (let i = 0; i < largerMask.length; i += 1) {
      if (!largerMask[i]) continue;
      pnLines[i].start.set(xIntersections[i], yIntersections[i], zIntersections[i]);
    }
    for (let i = 0; i < smallerMask.length; i += 1) {
      if (!smallerMask[i]) continue;
      pnLines[i].end.set(zNegativeIntersections[i], yNegativeIntersections[i], zNegativeIntersections[i]);
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
