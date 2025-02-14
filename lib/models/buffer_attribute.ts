import { Float32BufferAttribute, Matrix4, Quaternion } from "three";
import { CameraModelType, Extrinsic, Intrinsic } from "../types/type";
import { UndistortCount } from "../types/schema";

export function icsToVcsPoints(
  cameraParams: CameraModelType,
  icsPoint: Array<number>
): Float32BufferAttribute {
  const points = new Float32BufferAttribute(icsPoint, 3);
  const ccsPoints = icsToCcsPoints(cameraParams.intrinsic, points);

  const vcsPoints = ccsToVcsPoints(cameraParams.vcsExtrinsic, ccsPoints);

  return vcsPoints;
}

export function icsToCcsPoints(
  intrinsic: Intrinsic,
  points: Float32BufferAttribute
): Float32BufferAttribute {
  const { fx, fy, cx, cy } = intrinsic;

  // prettier-ignore
  const intrinsicInvertTransposed = new Matrix4(
      fx, 0, cx, 0,
      0, fy, cy, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ).invert();

  const undistorted = undistortIcsPoint(points, intrinsic);

  for (let i = 0; i < undistorted.count; i++) {
    undistorted.setXYZ(
      i,
      undistorted.getX(i) * undistorted.getZ(i),
      undistorted.getY(i) * undistorted.getZ(i),
      undistorted.getZ(i)
    );
  }

  const ccsPoints = multiplyMatrix4(undistorted, intrinsicInvertTransposed);

  return ccsPoints;
}

export function undistortIcsPoint(
  point: Float32BufferAttribute,
  intrinsic: Intrinsic
) {
  point = unproject(point, intrinsic);

  const undistorted = undistortRectilinear(point, intrinsic);

  point = project(undistorted, intrinsic);

  return point;
}

export function project(
  points: Float32BufferAttribute,
  intrinsic: Intrinsic
): Float32BufferAttribute {
  const { fx, fy, cx, cy } = intrinsic;

  for (let i = 0; i < points.count; i++) {
    const projectedX = points.getX(i) * fx + cx;
    const projectedY = points.getY(i) * fy + cy;

    points.setXYZ(i, projectedX, projectedY, points.getZ(i));
  }

  return points;
}

export function unproject(
  points: Float32BufferAttribute,
  intrinsic: Intrinsic
): Float32BufferAttribute {
  const { fx, fy, cx, cy } = intrinsic;

  for (let i = 0; i < points.count; i++) {
    const unprojectedX = (points.getX(i) - cx) / fx;
    const unprojectedY = (points.getY(i) - cy) / fy;

    points.setXYZ(i, unprojectedX, unprojectedY, points.getZ(i));
  }

  return points;
}

export function distortRectilinear(
  point: Float32BufferAttribute,
  intrinsic: Intrinsic
): Float32BufferAttribute {
  for (let i = 0; i < point.count; i++) {
    const x = point.getX(i);
    const y = point.getY(i);
    const { k1, k2, k3, k4, k5, k6, p1, p2 } = intrinsic;

    const r2 = x ** 2 + y ** 2;
    const radialD =
      (1 + k1 * r2 + k2 * r2 ** 2 + k3 * r2 ** 3) /
      (1 + k4 * r2 + k5 * r2 ** 2 + k6 * r2 ** 3);
    const distortedX = x * radialD + 2 * p1 * (x * y) + p2 * (r2 + 2 * x ** 2);
    const distortedY = y * radialD + p1 * (r2 + 2 * y ** 2) + 2 * p2 * (x * y);

    point.setXY(i, distortedX, distortedY);
  }

  return point;
}

export function undistortRectilinear(
  points: Float32BufferAttribute,
  intrinsic: Intrinsic
): Float32BufferAttribute {
  const { k1, k2, k3, k4, p1, p2 } = intrinsic;

  for (let j = 0; j < points.count; j++) {
    const x0 = points.getX(j);
    const y0 = points.getY(j);

    let undistortedX = x0;
    let undistortedY = y0;

    for (let i = 0; i < UndistortCount; i++) {
      const r2 = undistortedX ** 2 + undistortedY ** 2;
      const radialDInv =
        (1 + k4 * r2) / (1 + k1 * r2 + k2 * r2 ** 2 + k3 * r2 ** 3);
      const deltaX =
        2 * p1 * undistortedX * undistortedY +
        p2 * (r2 + 2 * undistortedX ** 2);
      const deltaY =
        p1 * (r2 + 2 * undistortedY ** 2) +
        2 * p2 * undistortedX * undistortedY;

      undistortedX = (x0 - deltaX) * radialDInv;
      undistortedY = (y0 - deltaY) * radialDInv;
    }
    points.setXYZ(j, undistortedX, undistortedY, points.getZ(j));
  }

  return points;
}

export function multiplyMatrix4(
  point: Float32BufferAttribute,
  translationMatrix: Matrix4
): Float32BufferAttribute {
  const b = translationMatrix.toArray();

  for (let i = 0; i < point.count; i++) {
    const x = point.getX(i),
      y = point.getY(i),
      z = point.getZ(i);

    point.setXYZ(
      i,
      x * b[0] + y * b[4] + z * b[8],
      x * b[1] + y * b[5] + z * b[9],
      x * b[2] + y * b[6] + z * b[10]
    );
  }

  return point;
}

export function ccsToVcsPoints(
  extrinsic: Extrinsic,
  ccsPoints: Float32BufferAttribute
) {
  const extrinsicInvT = getTransformMatrix(extrinsic).invert().transpose();

  const vcsPoint = multiplyMatrix4(ccsPoints, extrinsicInvT);

  return vcsPoint;
}

export function getTransformMatrix(extrinsic: Extrinsic): Matrix4 {
  const { qw, qx, qy, qz, tx, ty, tz } = extrinsic;

  const quaternion = new Quaternion(qx, qy, qz, qw);

  const rotationMatrix = new Matrix4().makeRotationFromQuaternion(quaternion);
  const transformMatrix = rotationMatrix.setPosition(tx, ty, tz).transpose();

  return transformMatrix;
}

export function vcsToCcsPoints(
  extrinsic: Extrinsic,
  points: Float32BufferAttribute
): Float32BufferAttribute {
  for (let i = 0; i < points.count; i++) {
    points.setW(i, 1);
  }

  const ccsPoints = multiplyMatrix4(points, getTransformMatrix(extrinsic));

  return ccsPoints;
}

export function ccsToIcsPoints(
  intrinsic: Intrinsic,
  points: Float32BufferAttribute
): Float32BufferAttribute {
  for (let i = 0; i < points.count; i++) {
    const x = points.getX(i);
    const y = points.getY(i);
    const z = points.getZ(i);

    points.setXY(i, x / z, y / z);

    distortRectilinear(points, intrinsic);

    project(points, intrinsic);
  }
  return points;
}
