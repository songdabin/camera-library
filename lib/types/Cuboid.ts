import { Line3, Vector3 } from "three";
import {
  getHomogeneousTransformMatrix,
  matrix4to3,
  multiplyMatrix4,
} from "./LtMatrix4";

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

export function vcsCuboidToVcsPoints(cuboid: Cuboid, order: "zyx") {
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
    transformMatrix.transpose().elements()
  );

  return matrix4to3(vcsPoints);
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
