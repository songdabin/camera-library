import { Line3, Vector3 } from "three";

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

export function createCuboidPoints(cuboidPoint: Vector3[]): CuboidPoints {
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

  return cuboidPoints;
}

export function createCuboidLines(ccsPoints: CuboidPoints) {
  const { flb, frb, frt, flt, rlb, rrb, rrt, rlt } = ccsPoints;

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
