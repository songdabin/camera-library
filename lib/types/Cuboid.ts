import { Euler, Float32BufferAttribute, Line3, Matrix4, Vector3 } from "three";

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

// prettier-ignore
export function multiplyMatrix4(a: number[], b: Matrix4): Vector3[] {
  const bArray = b.toArray();

  const buffer = new Float32BufferAttribute(a, 4);
  
  const b11 = bArray[0], b12 = bArray[1], b13 = bArray[2], b14 = bArray[3];
  const b21 = bArray[4], b22 = bArray[5], b23 = bArray[6], b24 = bArray[7];
  const b31 = bArray[8], b32 = bArray[9], b33 = bArray[10], b34 = bArray[11];
  const b41 = bArray[12], b42 = bArray[13], b43 = bArray[14], b44 = bArray[15];

  const result: Vector3[] = [];
  for (let i = 0; i < a.length; i += 4) {
    const a11 = a[i], a12 = a[i + 1], a13 = a[i + 2], a14 = a[i + 3];

    result.push(new Vector3(
      a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41,
      a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42,
      a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43
    ));
  }

  return result;
}

export function getPoints(
  width: number,
  height: number,
  length: number
): number[] {
  const [y, z, x] = [width / 2, height / 2, length / 2];

  // prettier-ignore
  return [
    x, y, -z, 1, // front left bottom
    x, -y, -z, 1, // front right bottom
    x, -y, z, 1, // front right top
    x, y, z, 1, // front left top
    
    -x, y, -z, 1, // rear left bottom
    -x, -y, -z, 1, // rear right bottom
    -x, -y, z, 1, // rear right top
    -x, y, z, 1, // rear left top
  ];
}
