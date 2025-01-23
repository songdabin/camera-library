import {
  Euler,
  Float32BufferAttribute,
  Line3,
  Matrix4,
  Vector3,
  Vector4,
} from "three";

export type VcsCuboidToCcsPointsArgs = {
  vcsCuboid: Cuboid;
  order: "zyx";
};

export type Cuboid = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  roll: number;
  pitch: number;
  width: number;
  height: number;
  length: number;
};

export type CuboidPoints = {
  flb: Vector3;
  frb: Vector3;
  frt: Vector3;
  flt: Vector3;
  rlb: Vector3;
  rrb: Vector3;
  rrt: Vector3;
  rlt: Vector3;
};

export type CuboidLine = [start: Vector3, end: Vector3];

export function createCuboidLines(cuboidPoint: Vector3[]): Line3[] {
  const cuboidPoints = {
    flb: cuboidPoint[0],
    frb: cuboidPoint[1],
    frt: cuboidPoint[2],
    flt: cuboidPoint[3],
    rlb: cuboidPoint[4],
    rrb: cuboidPoint[5],
    rrt: cuboidPoint[6],
    rlt: cuboidPoint[7],
  };

  const { flb, frb, frt, flt, rlb, rrb, rrt, rlt } = cuboidPoints;

  // prettier-ignore
  // Left -> Right, Front -> Rear, Bottom -> Top
  const lineLists: CuboidLine[] = [
    [flt, frt], [flt, rlt], [rlt, rrt], [frt, rrt],
    [flb, frb], [rlb, rrb], [flb, rlb], [frb, rrb],
    [flb, flt], [frb, frt], [rlb, rlt], [rrb, rrt],
  ];

  const lines: Line3[] = lineLists.map(([start, end]) => new Line3(start, end));

  return lines;
}

export function vcsCuboidToVcsPoints(cuboid: Cuboid, order: "zyx"): Vector3[] {
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

  const vcsPoints = multiplyMatrix4(
    getPoints(width, height, length),
    transformMatrix
  );

  return vcsPoints;
}

/**
 * Get homogeneous transform matrix from euler angle and translation
 * column-major matrix
 *
 * @param params { angle, translation, order }
 * @returns Matrix4 that is applied with rotation and translation (column-major matrix)
 */
export function getHomogeneousTransformMatrix({
  angle,
  translation = { tx: 0, ty: 0, tz: 0 },
  order = "ZYX",
}: {
  angle: { yaw: number; roll: number; pitch: number };
  translation?: { tx: number; ty: number; tz: number };
  order?: string;
}) {
  const { tx, ty, tz } = translation;
  const { roll, pitch, yaw } = angle;

  const euler = new Euler(roll, pitch, yaw, "ZYX");
  const rotationMatrix = new Matrix4().makeRotationFromEuler(euler);

  const transformMatrix = rotationMatrix
    .clone()
    .setPosition(new Vector3(tx, ty, tz));

  return transformMatrix;
}

/**
 * Get a Vcs Cuboid Point Array
 *
 * @param cuboidPoints Cuboid Points Array (Homogeneous)
 * @param transformMatrix Matrix4 that includes rotation and translation parameters (column-major matrix)
 * @returns Vector3[] (Vcs Cuboid Points)
 */
export function multiplyMatrix4(
  cuboidPoints: Vector4[],
  transformMatrix: Matrix4
): Vector3[] {
  const bArray = transformMatrix.toArray();

  const result: Vector3[] = [];

  for (let i = 0; i < cuboidPoints.length; i++) {
    // prettier-ignore
    const x = cuboidPoints[i].x, y = cuboidPoints[i].y, z = cuboidPoints[i].z, w = cuboidPoints[i].w;

    result.push(
      new Vector3(
        x * bArray[0] + y * bArray[4] + z * bArray[8] + w * bArray[12],
        x * bArray[1] + y * bArray[5] + z * bArray[9] + w * bArray[13],
        x * bArray[2] + y * bArray[6] + z * bArray[10] + w * bArray[14]
      )
    );
  }

  return result;
}

export function getPoints(
  width: number,
  height: number,
  length: number
): Vector4[] {
  const [y, z, x] = [width / 2, height / 2, length / 2];

  return [
    new Vector4(x, y, -z, 1), // front left bottom
    new Vector4(x, -y, -z, 1), // front right bottom
    new Vector4(x, -y, z, 1), // front right top
    new Vector4(x, y, z, 1), // front left top

    new Vector4(-x, y, -z, 1), // rear left bottom
    new Vector4(-x, -y, -z, 1), // rear right bottom
    new Vector4(-x, -y, z, 1), // rear right top
    new Vector4(-x, y, z, 1), // rear left top
  ];
}
