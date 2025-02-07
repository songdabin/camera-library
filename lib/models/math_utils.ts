import { Line3, Vector3 } from "three";
import { Intersections, Intrinsic, SlopesAndIntercepts } from "../types/type";
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

  for (let i = 0; i < UndistortCount; i++) {
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

export function getTruncatedLinesInCameraFov(lines: Line3[], hfov: number) {
  const halfHfovTangent = Math.tan((90 - hfov / 2) * (Math.PI / 180));

  const _lines: Line3[] = [...lines];
  lines.forEach((line) => {
    if (Math.abs(line.start.x) < EPS) line.start.x = EPS;
    if (Math.abs(line.end.x) < EPS) line.end.x = EPS;
  });

  const zPositiveMask = _lines.map(
    ({ start, end }) => start.z > 0 || end.z > 0
  );
  const isPoint0InFovMask = _lines.map((line) => {
    const [x0, , z0] = line.start;
    return z0 > -halfHfovTangent * x0 && z0 > halfHfovTangent * x0;
  });

  const isPoint1InFovMask = _lines.map((line) => {
    const [x1, , z1] = line.end;
    return z1 > -halfHfovTangent * x1 && z1 > halfHfovTangent * x1;
  });

  const atLeastOnePointInFovMask: boolean[] = [];
  const allPointsInFovMask: boolean[] = [];

  const positiveMask: boolean[] = [];
  const onePointInFovMasks: boolean[] = [];
  const noPointsInFovMasks: boolean[] = [];

  _lines.forEach((line, i) => {
    atLeastOnePointInFovMask.push(isPoint0InFovMask[i] || isPoint1InFovMask[i]);
    allPointsInFovMask.push(isPoint0InFovMask[i] && isPoint1InFovMask[i]);

    positiveMask.push(
      zPositiveMask[i] &&
        (atLeastOnePointInFovMask[i] || line.start.x * line.end.x < 0)
    );
    onePointInFovMasks.push(
      atLeastOnePointInFovMask[i] && !allPointsInFovMask[i]
    );
    noPointsInFovMasks.push(
      zPositiveMask[i] &&
        !atLeastOnePointInFovMask[i] &&
        line.start.x * line.end.x < 0
    );
  });

  function getSlopesAndIntercepts(pointLines: Line3[]): SlopesAndIntercepts {
    const xDiff = pointLines.map(({ start, end }) =>
      Math.abs(start.x - end.x) < EPS ? EPS : start.x - end.x
    );
    const xzLineSlopes = pointLines.map(
      ({ start, end }, i) => (start.z - end.z) / xDiff[i]
    );
    const xzLineIntercepts = pointLines.map(
      ({ start, end }, i) => start.z - xzLineSlopes[i] * start.x
    );
    const xyLineSlopes = pointLines.map(
      ({ start, end }, i) => (start.y - end.y) / xDiff[i]
    );
    const xyLineIntercepts = pointLines.map(
      ({ start, end }, i) => start.y - xyLineSlopes[i] * start.x
    );

    return {
      xzLineSlopes,
      xzLineIntercepts,
      xyLineSlopes,
      xyLineIntercepts,
    };
  }

  function getIntersections(
    slopesAndIntercepts: SlopesAndIntercepts
  ): Intersections {
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

    const posIntersections: Vector3[] = [];
    const negIntersections: Vector3[] = [];

    xPositiveIntersections.forEach((_, i) => {
      posIntersections.push(
        new Vector3(
          xPositiveIntersections[i],
          yPositiveIntersections[i],
          zPositiveIntersections[i]
        )
      );
      negIntersections.push(
        new Vector3(
          xNegativeIntersections[i],
          yNegativeIntersections[i],
          zNegativeIntersections[i]
        )
      );
    });

    return { positive: posIntersections, negative: negIntersections };
  }

  const onePointLines = _lines.filter((_, i) => onePointInFovMasks[i]);
  const noPointLines = _lines.filter((_, i) => noPointsInFovMasks[i]);
  if (onePointInFovMasks.includes(true) && onePointLines.length > 0) {
    const slopesAndIntercepts = getSlopesAndIntercepts(onePointLines);

    const intersections = getIntersections(slopesAndIntercepts);

    const minXs: number[] = [];
    const maxXs: number[] = [];
    onePointLines.forEach((onePointLine) => {
      const { start, end } = onePointLine;

      minXs.push(Math.min(start.x, end.x));
      maxXs.push(Math.max(start.x, end.x));
    });

    const pMask: boolean[] = [];
    const nMask: boolean[] = [];

    intersections.positive.forEach((positive, i) => {
      pMask.push(
        positive.x >= 0 && minXs[i] <= positive.x && positive.x < maxXs[i]
      );
    });

    intersections.negative.forEach((negative, i) => {
      nMask.push(
        negative.x <= 0 && minXs[i] <= negative.x && negative.x < maxXs[i]
      );
    });

    const pointOutOfFovMask: [boolean, boolean][] = [];
    onePointInFovMasks.forEach((onePointInFovMask, i) => {
      if (!onePointInFovMask) return;
      pointOutOfFovMask.push([!isPoint0InFovMask[i], !isPoint1InFovMask[i]]);
    });

    let _m;

    function setLines(masks: boolean[], intersections: Vector3[]) {
      _m = pointOutOfFovMask.filter((_, i) => masks[i]);
      const _l = onePointLines.filter((_, i) => masks[i]);

      _m.forEach((mask, index) => {
        const i = masks.findIndex((val, idx) => idx >= index && val);
        if (mask[0]) {
          _l[index].start.set(
            intersections[i].x,
            intersections[i].y,
            intersections[i].z
          );
        }
        if (mask[1]) {
          _l[index].end.set(
            intersections[i].x,
            intersections[i].y,
            intersections[i].z
          );
        }
      });

      _l.forEach((line, index) => {
        const i = masks.findIndex((val, idx) => idx >= index && val);
        onePointLines[i] = line;
      });

      masks.forEach((mask, i) => {
        if (!mask) return;

        const pointMask = pointOutOfFovMask[i];

        if (pointMask[0])
          onePointLines[i].start.set(
            intersections[i].x,
            intersections[i].y,
            intersections[i].z
          );
        if (pointMask[1])
          onePointLines[i].end.set(
            intersections[i].x,
            intersections[i].y,
            intersections[i].z
          );
      });
    }

    setLines(pMask, intersections.positive);
    setLines(nMask, intersections.negative);

    // Update real box line
    let positiveIndex = 0;
    onePointInFovMasks.forEach((onePointInFovMask, i) => {
      if (!onePointInFovMask) return;

      _lines[i] = onePointLines[positiveIndex];
      positiveIndex += 1;
    });
  }

  if (noPointsInFovMasks.some((v) => v) && noPointLines.length > 0) {
    const slopesAndIntercepts = getSlopesAndIntercepts(noPointLines);

    const intersections = getIntersections(slopesAndIntercepts);

    const largerMasks = noPointLines.map(({ start, end }) => start.x > end.x);
    const smallerMasks = largerMasks.map((v) => !v);

    largerMasks.forEach((largerMask, i) => {
      if (!largerMask) return;
      // prettier-ignore
      noPointLines[i].start.set(
        intersections.positive[i].x, intersections.positive[i].y, intersections.positive[i].z
      );
    });

    smallerMasks.forEach((smallerMask, i) => {
      if (!smallerMask) return;
      // prettier-ignore
      noPointLines[i].end.set(
        intersections.negative[i].z, intersections.negative[i].y, intersections.negative[i].z
      );
    });

    // Update real box line
    let negativeIndex = 0;
    noPointsInFovMasks.forEach((noPointsInFovMask, i) => {
      if (!noPointsInFovMask) return;

      _lines[i] = noPointLines[negativeIndex];
      negativeIndex++;
    });
  }

  return { lines: _lines, positiveMask };
}
