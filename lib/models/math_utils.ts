import { Line3, Vector3 } from "three";
import { Intrinsic, SlopesAndIntercepts } from "../types/type";
import { EPS, UndistortCount } from "../types/schema";

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

  for (let i = 0; i < UndistortCount; i += 1) {
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

function getSlopesAndIntercepts(pointLines: Line3[]) {
  const xzLineSlopes: number[] = [];
  const xzLineIntercepts: number[] = [];
  const xyLineSlopes: number[] = [];
  const xyLineIntercepts: number[] = [];

  // prettier-ignore
  pointLines.forEach((pointLine) => {
    const xDiff = Math.abs(pointLine.start.x - pointLine.end.x) < EPS ? EPS : pointLine.start.x - pointLine.end.x;
    const xzLineSlope = (pointLine.start.z - pointLine.end.z) / xDiff;
    const xzLineIntercept = pointLine.start.z - xzLineSlope * pointLine.start.x;
    const xyLineSlope = (pointLine.start.y - pointLine.end.y) / xDiff;
    const xyLineIntercept = pointLine.start.y - xyLineSlope * pointLine.start.x;

    xzLineSlopes.push(xzLineSlope);
    xzLineIntercepts.push(xzLineIntercept);
    xyLineSlopes.push(xyLineSlope);
    xyLineIntercepts.push(xyLineIntercept);
  });

  return { xyLineSlopes, xzLineSlopes, xyLineIntercepts, xzLineIntercepts };
}

function getIntersections(
  slopesAndIntercepts: SlopesAndIntercepts,
  halfHfovTangent: number
) {
  const { xyLineSlopes, xzLineSlopes, xyLineIntercepts, xzLineIntercepts } =
    slopesAndIntercepts;

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

  return [
    xPositiveIntersections,
    yPositiveIntersections,
    zPositiveIntersections,
    xNegativeIntersections,
    yNegativeIntersections,
    zNegativeIntersections,
  ];
}

export function getTruncatedLinesInCameraFov(lines: Line3[], hfov: number) {
  const halfHfovTangent = Math.tan((90 - hfov / 2) * (Math.PI / 180));

  lines.forEach((line) => {
    if (Math.abs(line.start.x) < EPS) line.start.x = EPS;
    if (Math.abs(line.end.x) < EPS) line.end.x = EPS;
  });

  const zPositiveMask = lines.map((line) => line.start.z > 0 || line.end.z > 0);
  const isPoint0InFovMask = lines.map((line) => {
    const [x0, , z0] = line.start;
    return z0 > -halfHfovTangent * x0 && z0 > halfHfovTangent * x0;
  });

  const isPoint1InFovMask = lines.map((line) => {
    const [x1, , z1] = line.end;
    return z1 > -halfHfovTangent * x1 && z1 > halfHfovTangent * x1;
  });

  const atLeastOnePointInFovMask: boolean[] = [];
  const allPointsInFovMask: boolean[] = [];

  const positiveMask: boolean[] = [];
  const onePointInFovMask: boolean[] = [];
  const noPointsInFovMask: boolean[] = [];

  lines.forEach((line, i) => {
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

  const onePointLines = lines.filter((_, i) => onePointInFovMask[i]);
  const noPointLines = lines.filter((_, i) => noPointsInFovMask[i]);

  // prettier-ignore
  function updateOnePointLines() {
    const slopesAndIntercepts = getSlopesAndIntercepts(onePointLines);

    const [
      xPositiveIntersections, yPositiveIntersections, zPositiveIntersections,
      xNegativeIntersections, yNegativeIntersections, zNegativeIntersections,
    ] = getIntersections(
      slopesAndIntercepts,
      halfHfovTangent
    );

    const minXs: number[] = [];
    const maxXs: number[] = [];

    onePointLines.forEach((onePointLine) => {
      const { start, end } = onePointLine;
      
      minXs.push(Math.min(start.x, end.x));
      maxXs.push(Math.max(start.x, end.x));
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

    function intersect(fovPlaneMask: boolean[], xIntersections: number[], yIntersections: number[], zIntersections: number[]) {
      _m = pointOutOfFovMask.filter((_, i) => fovPlaneMask[i]);
      const line = onePointLines.filter((_, i) => fovPlaneMask[i]);

      _m.forEach((mask, index) => {
        const i = fovPlaneMask.findIndex(
          (val, idx) => idx >= index && val
        );
        if (mask[0]) {
          line[index].start.set(xIntersections[i], yIntersections[i], zIntersections[i]);
        }
        if (mask[1]) {
          line[index].end.set(xIntersections[i], yIntersections[i], zIntersections[i]);
        }
      });

      line.forEach((line, index) => {
        const i = fovPlaneMask.findIndex(
          (val, idx) => idx >= index && val
        );
        onePointLines[i] = line;
      });

      return { line }
    }

    intersect(intersectWithPositiveFovPlaneMask, xPositiveIntersections, yPositiveIntersections, zPositiveIntersections);
    
    intersect(intersectWithNegativeFovPlaneMask, xNegativeIntersections, yNegativeIntersections, zNegativeIntersections);

    intersectWithPositiveFovPlaneMask.forEach((positiveMask, i) => {
      if (!positiveMask) return;

      const mask = pointOutOfFovMask[i];

      if (mask[0])
        onePointLines[i].start.set(xPositiveIntersections[i], yPositiveIntersections[i], zPositiveIntersections[i]);
      if (mask[1])
        onePointLines[i].end.set(xPositiveIntersections[i], yPositiveIntersections[i], zPositiveIntersections[i]);
    });

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

      lines[i] = onePointLines[positiveIndex];
      positiveIndex++;
    });
  }

  // prettier-ignore
  function updateNoPointsLines() {
    const slopesAndIntercepts = getSlopesAndIntercepts(noPointLines);

    const [
      xIntersections, yIntersections, zIntersections,
      xNegativeIntersections, yNegativeIntersections, zNegativeIntersections,
    ] = getIntersections(
      slopesAndIntercepts,
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

      lines[i] = noPointLines[negativeIndex];
      negativeIndex ++;
    });
  }

  if (onePointInFovMask.includes(true) && onePointLines.length > 0) {
    updateOnePointLines();
  }

  if (noPointsInFovMask.some((v) => v) && noPointLines.length > 0) {
    updateNoPointsLines();
  }

  return { lines: lines, positiveMask };
}
