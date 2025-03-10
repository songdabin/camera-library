import { Line3, Vector3 } from "three";

// vcs to ccs point
export const vcsToCcsPointTestCase = [
  {
    input: new Vector3(1, 1, 1),
    output: {
      x: 1.0499691871379964,
      y: -0.43376605202830615,
      z: -1.3074447285329316,
    },
  },
  {
    input: new Vector3(0, 0, 0),
    output: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  {
    input: new Vector3(3.333333, 5.5555555, 7.7777777),
    output: {
      x: 5.707259480607106,
      y: -5.419066377930521,
      z: -6.366320802919832,
    },
  },
];

// fisheye ccs to ics point
export const fisheyeCcsToIcsPointTestCase = [
  {
    input: new Vector3(10000, 10000, 10),
    output: {
      point: { x: 1600.9286588735288, y: 1408.5782821677863, z: 0 },
      isInImage: true,
    },
  },
  {
    input: new Vector3(1, 1, 1),
    output: {
      point: {
        x: 1336.2195702701756,
        y: 1144.0413642531755,
        z: 0,
      },
      isInImage: true,
    },
  },
  {
    input: new Vector3(3.333333, 5.5555555, 7.7777777),
    output: {
      point: { x: 1151.84156807861, y: 1088.239446521656, z: 0 },
      isInImage: true,
    },
  },
  {
    input: new Vector3(0, 0, 0),
    output: {
      point: { x: 1867.1972009568562, y: 767.0990841439, z: 0 },
      isInImage: true,
    },
  },
];

// rectilinear ccs to ics point
export const rectilinearCcsToIcsPointTestCase = [
  {
    input: new Vector3(1, 1, 1),
    output: {
      point: { x: 1543.106710453001, y: 1340.48787091835, z: 1 },
      isInImage: true,
    },
  },
  {
    input: new Vector3(10000, 1000, 100),
    output: {
      point: { x: -911978279005498, y: -90989372227315.56, z: 1 },
      isInImage: false,
    },
  },
  {
    input: new Vector3(3.333333, 5.5555555, 7.7777777),
    output: {
      point: { x: 1200.2838883148725, y: 1154.1131530339776, z: 1 },
      isInImage: true,
    },
  },
];

export const getCcsLinesFromCuboidResult = [
  {
    start: {
      x: 1.7160373232869774,
      y: -0.13153194909121646,
      z: -1.771134048044213,
    },
    end: {
      x: 0.8346703933404074,
      y: 0.3275543272491771,
      z: -1.6596346055681643,
    },
  },
  {
    start: {
      x: 1.7160373232869774,
      y: -0.13153194909121646,
      z: -1.771134048044213,
    },
    end: {
      x: 1.244080315063302,
      y: -0.997723396353503,
      z: -1.9353563336153963,
    },
  },
  {
    start: {
      x: 1.244080315063302,
      y: -0.997723396353503,
      z: -1.9353563336153963,
    },
    end: {
      x: 0.3627133851167319,
      y: -0.5386371200131094,
      z: -1.8238568911393476,
    },
  },
  {
    start: {
      x: 0.8346703933404074,
      y: 0.3275543272491771,
      z: -1.6596346055681643,
    },
    end: {
      x: 0.3627133851167319,
      y: -0.5386371200131094,
      z: -1.8238568911393476,
    },
  },
  {
    start: {
      x: 1.7372249891592608,
      y: -0.3288949840435029,
      z: -0.7910325659265157,
    },
    end: {
      x: 0.8558580592126909,
      y: 0.13019129229689083,
      z: -0.6795331234504671,
    },
  },
  {
    start: {
      x: 1.2652679809355853,
      y: -1.1950864313057894,
      z: -0.9552548514976987,
    },
    end: {
      x: 0.38390105098901534,
      y: -0.7360001549653958,
      z: -0.8437554090216501,
    },
  },
  {
    start: {
      x: 1.7372249891592608,
      y: -0.3288949840435029,
      z: -0.7910325659265157,
    },
    end: {
      x: 1.2652679809355853,
      y: -1.1950864313057894,
      z: -0.9552548514976987,
    },
  },
  {
    start: {
      x: 0.8558580592126909,
      y: 0.13019129229689083,
      z: -0.6795331234504671,
    },
    end: {
      x: 0.38390105098901534,
      y: -0.7360001549653958,
      z: -0.8437554090216501,
    },
  },
  {
    start: {
      x: 1.7372249891592608,
      y: -0.3288949840435029,
      z: -0.7910325659265157,
    },
    end: {
      x: 1.7160373232869774,
      y: -0.13153194909121646,
      z: -1.771134048044213,
    },
  },
  {
    start: {
      x: 0.8558580592126909,
      y: 0.13019129229689083,
      z: -0.6795331234504671,
    },
    end: {
      x: 0.8346703933404074,
      y: 0.3275543272491771,
      z: -1.6596346055681643,
    },
  },
  {
    start: {
      x: 1.2652679809355853,
      y: -1.1950864313057894,
      z: -0.9552548514976987,
    },
    end: {
      x: 1.244080315063302,
      y: -0.997723396353503,
      z: -1.9353563336153963,
    },
  },
  {
    start: {
      x: 0.38390105098901534,
      y: -0.7360001549653958,
      z: -0.8437554090216501,
    },
    end: {
      x: 0.3627133851167319,
      y: -0.5386371200131094,
      z: -1.8238568911393476,
    },
  },
];

export const getCcsLinesFromCuboidResult2 = [
  {
    start: {
      x: 11.92506183805262,
      y: -12.086877134787965,
      z: -16.668603976347214,
    },
    end: {
      x: 6.895516395900466,
      y: -4.576081676983544,
      z: -20.945474822696323,
    },
  },
  {
    start: {
      x: 11.92506183805262,
      y: -12.086877134787965,
      z: -16.668603976347214,
    },
    end: {
      x: 7.000727155440565,
      y: -10.510368015126636,
      z: -8.109074378919056,
    },
  },
  {
    start: {
      x: 7.000727155440565,
      y: -10.510368015126636,
      z: -8.109074378919056,
    },
    end: {
      x: 1.9711817132884095,
      y: -2.999572557322214,
      z: -12.385945225268166,
    },
  },
  {
    start: {
      x: 6.895516395900466,
      y: -4.576081676983544,
      z: -20.945474822696323,
    },
    end: {
      x: 1.9711817132884095,
      y: -2.999572557322214,
      z: -12.385945225268166,
    },
  },
  {
    start: {
      x: 19.02820202947152,
      y: -5.675748483243908,
      z: -13.762949345390467,
    },
    end: {
      x: 13.998656587319363,
      y: 1.8350469745605125,
      z: -18.039820191739576,
    },
  },
  {
    start: {
      x: 14.10386734685946,
      y: -4.099239363582579,
      z: -5.20341974796231,
    },
    end: {
      x: 9.074321904707308,
      y: 3.411556094221842,
      z: -9.48029059431142,
    },
  },
  {
    start: {
      x: 19.02820202947152,
      y: -5.675748483243908,
      z: -13.762949345390467,
    },
    end: {
      x: 14.10386734685946,
      y: -4.099239363582579,
      z: -5.20341974796231,
    },
  },
  {
    start: {
      x: 13.998656587319363,
      y: 1.8350469745605125,
      z: -18.039820191739576,
    },
    end: {
      x: 9.074321904707308,
      y: 3.411556094221842,
      z: -9.48029059431142,
    },
  },
  {
    start: {
      x: 19.02820202947152,
      y: -5.675748483243908,
      z: -13.762949345390467,
    },
    end: {
      x: 11.92506183805262,
      y: -12.086877134787965,
      z: -16.668603976347214,
    },
  },
  {
    start: {
      x: 13.998656587319363,
      y: 1.8350469745605125,
      z: -18.039820191739576,
    },
    end: {
      x: 6.895516395900466,
      y: -4.576081676983544,
      z: -20.945474822696323,
    },
  },
  {
    start: {
      x: 14.10386734685946,
      y: -4.099239363582579,
      z: -5.20341974796231,
    },
    end: {
      x: 7.000727155440565,
      y: -10.510368015126636,
      z: -8.109074378919056,
    },
  },
  {
    start: {
      x: 9.074321904707308,
      y: 3.411556094221842,
      z: -9.48029059431142,
    },
    end: {
      x: 1.9711817132884095,
      y: -2.999572557322214,
      z: -12.385945225268166,
    },
  },
];

// cuboid getCcsLinesFromCuboidTestCase
export const getCcsLinesFromCuboidTestCase = [
  {
    input: {
      x: 1,
      y: 1,
      z: 1,
      yaw: 1,
      roll: 1,
      pitch: 1,
      width: 1,
      height: 1,
      length: 1,
    },
    output: getCcsLinesFromCuboidResult,
  },
  {
    input: {
      x: 10,
      y: 10,
      z: 10,
      yaw: 10,
      roll: 10,
      pitch: 10,
      width: 10,
      height: 10,
      length: 10,
    },
    output: getCcsLinesFromCuboidResult2,
  },
];

export const vcsCuboidToCcsPointsTestCase = [
  {
    x: 19.02820202947152,
    y: -5.675748483243908,
    z: -13.762949345390467,
  },
  {
    x: 13.998656587319363,
    y: 1.8350469745605125,
    z: -18.039820191739576,
  },
  {
    x: 6.895516395900466,
    y: -4.576081676983544,
    z: -20.945474822696323,
  },
  {
    x: 11.92506183805262,
    y: -12.086877134787965,
    z: -16.668603976347214,
  },
  {
    x: 14.10386734685946,
    y: -4.099239363582579,
    z: -5.20341974796231,
  },
  {
    x: 9.074321904707308,
    y: 3.411556094221842,
    z: -9.48029059431142,
  },
  {
    x: 1.9711817132884095,
    y: -2.999572557322214,
    z: -12.385945225268166,
  },
  {
    x: 7.000727155440565,
    y: -10.510368015126636,
    z: -8.109074378919056,
  },
];

// Rectilinear Ics To Vcs
export const rectilinearIcsToVcsTestCase = [
  {
    input: new Vector3(100, 10, 1),
    output: {
      x: -1.4721653134837152,
      y: -0.4947721228552209,
      z: 0.23628394627004135,
    },
  },
  {
    input: new Vector3(3.3333, 1.1111, 2.2222),
    output: {
      x: -3.4679957366522074,
      y: -2.7020149991124547,
      z: 1.7633315398786826,
    },
  },
];

// prettier-ignore
export const truncatedTestCaseInput = [
  new Line3(new Vector3(2, 2, 2), new Vector3(3, 2, 2)),
  new Line3(new Vector3(3, 2, 2), new Vector3(3, 3, 2)),
  new Line3(new Vector3(3, 3, 2), new Vector3(2, 3, 2)),
  new Line3(new Vector3(2, 3, 2), new Vector3(2, 2, 2)),

  new Line3(new Vector3(2, 2, 3), new Vector3(3, 2, 3)),
  new Line3(new Vector3(3, 2, 3), new Vector3(3, 3, 3)),
  new Line3(new Vector3(3, 3, 3), new Vector3(2, 3, 3)),
  new Line3(new Vector3(2, 3, 3), new Vector3(2, 2, 3)),

  new Line3(new Vector3(2, 2, 2), new Vector3(2, 2, 3)),
  new Line3(new Vector3(3, 2, 2), new Vector3(3, 2, 3)),
  new Line3(new Vector3(3, 3, 2), new Vector3(3, 3, 3)),
  new Line3(new Vector3(2, 3, 2), new Vector3(2, 3, 3)),
];

// prettier-ignore
export const truncatedTestCaseInput2 = [
  new Line3(new Vector3(0, 0, 0), new Vector3(1000, 0, 0)),
  new Line3(new Vector3(0, 0, 1000), new Vector3(1000, 0, 1000)),
  new Line3(new Vector3(0, 1000, 0), new Vector3(1000, 1000, 0)),
  new Line3(new Vector3(0, 1000, 1000), new Vector3(1000, 1000, 1000)),
  
  new Line3(new Vector3(0, 0, 0), new Vector3(0, 1000, 0)),
  new Line3(new Vector3(1000, 0, 0), new Vector3(1000, 1000, 0)),
  new Line3(new Vector3(0, 0, 1000), new Vector3(0, 1000, 1000)),
  new Line3(new Vector3(1000, 0, 1000), new Vector3(1000, 1000, 1000)),
  
  new Line3(new Vector3(0, 0, 0), new Vector3(0, 0, 1000)),
  new Line3(new Vector3(1000, 0, 0), new Vector3(1000, 0, 1000)),
  new Line3(new Vector3(0, 1000, 0), new Vector3(0, 1000, 1000)),
  new Line3(new Vector3(1000, 1000, 0), new Vector3(1000, 1000, 1000))
];

// prettier-ignore
export const truncatedTestCaseOutput = {
  lines: [
    { start: { x: 2, y: 2, z: 2 }, end: { x: 3, y: 2, z: 2 } },
    { start: { x: 3, y: 2, z: 2 }, end: { x: 3, y: 3, z: 2 } },
    { start: { x: 3, y: 3, z: 2 }, end: { x: 2, y: 3, z: 2 } },
    { start: { x: 2, y: 3, z: 2 }, end: { x: 2, y: 2, z: 2 } },

    { start: { x: 2, y: 2, z: 3 }, end: { x: 3, y: 2, z: 3 } },
    { start: { x: 3, y: 2, z: 3 }, end: { x: 3, y: 3, z: 3 } },
    { start: { x: 3, y: 3, z: 3 }, end: { x: 2, y: 3, z: 3 } },
    { start: { x: 2, y: 3, z: 3 }, end: { x: 2, y: 2, z: 3 } },

    { start: { x: 2, y: 2, z: 2 }, end: { x: 2, y: 2, z: 3 } },
    { start: { x: 3, y: 2, z: 2 }, end: { x: 3, y: 2, z: 3 } },
    { start: { x: 3, y: 3, z: 2 }, end: { x: 3, y: 3, z: 3 } },
    { start: { x: 2, y: 3, z: 2 }, end: { x: 2, y: 3, z: 3 } },
  ],
  
  positiveMask: [
    true, true, true,
    true, true, true,
    true, true, true,
    true, true, true
  ],
};

// prettier-ignore
export const truncatedTestCaseOutput2 = {
  lines: [
    { start: { x: 0.000001, y: 0, z: 0 }, end: { x: 1000, y: 0, z: 0 } },
    { start: { x: 0.000001, y: 0, z: 1000 }, end: { x: 1000, y: 0, z: 1000 } },
    { start: { x: 0.000001, y: 1000, z: 0 }, end: { x: 1000, y: 1000, z: 0 } },
    { start: { x: 0.000001, y: 1000, z: 1000 }, end: { x: 1000, y: 1000, z: 1000 } },
    { start: { x: 0.000001, y: 0, z: 0 }, end: { x: 0.000001, y: 1000, z: 0 } },
    { start: { x: 1000, y: 0, z: 0 }, end: { x: 1000, y: 1000, z: 0 } },
    { start: { x: 0.000001, y: 0, z: 1000 }, end: { x: 0.000001, y: 1000, z: 1000 } },
    { start: { x: 1000, y: 0, z: 1000 }, end: { x: 1000, y: 1000, z: 1000 } },
    { start: { x: 0.000001, y: 0, z: 0 }, end: { x: 0.000001, y: 0, z: 1000 } },
    { start: { x: 1000, y: 0, z: 0 }, end: { x: 1000, y: 0, z: 1000 } },
    { start: { x: 0.000001, y: 1000, z: 0 }, end: { x: 0.000001, y: 1000, z: 1000 } },
    { start: { x: 1000, y: 1000, z: 0 }, end: { x: 1000, y: 1000, z: 1000 } },
  ],
  positiveMask: [
    false, true, false,
    true, false, false,
    true, true, true,
    true, true, true,
  ],
};

export const truncatedTestCase = [
  { input: truncatedTestCaseInput, output: truncatedTestCaseOutput },
  { input: truncatedTestCaseInput2, output: truncatedTestCaseOutput2 },
];

export const vcsToIcsCuboidLinesInput = {
  x: 42,
  y: 230,
  z: 100,
  yaw: 10,
  roll: 13,
  pitch: 41,
  width: 800,
  height: 600,
  length: 340,
};

export const rectVcsToIcsCuboidLinesOutput = [
  null,
  {
    start: {
      x: -300105278307.1027,
      y: -1998498579890.1448,
      z: 0.9999999999999999,
    },
    end: { x: 588.0307554989918, y: 9096.025197102586, z: 1 },
  },
  {
    start: { x: 588.0307554989918, y: 9096.025197102586, z: 1 },
    end: { x: 1857.348621980459, y: 507.6072826512628, z: 1 },
  },
  {
    start: {
      x: 5324692.495840576,
      y: -539359.2705180132,
      z: 0.9999999999999999,
    },
    end: { x: 1857.348621980459, y: 507.6072826512628, z: 1 },
  },
  null,
  {
    start: {
      x: 424969724.88769513,
      y: -925753918.0023853,
      z: 0.9999999999999999,
    },
    end: { x: 31461164.594487138, y: -520559802.4647439, z: 1 },
  },
  null,
  null,
  null,
  null,
  {
    start: {
      x: 424969724.88769513,
      y: -925753918.0023853,
      z: 0.9999999999999999,
    },
    end: { x: 588.0307554989918, y: 9096.025197102586, z: 1 },
  },
  {
    start: { x: 31461164.594487138, y: -520559802.4647439, z: 1 },
    end: { x: 1857.348621980459, y: 507.6072826512628, z: 1 },
  },
];

export const fishVcsToIcsCuboidLinesOutput = [
  {
    start: { x: 777.5324851757919, y: 1033.5191455516688, z: 0 },
    end: { x: 0, y: 751.1750353732236, z: 0 },
  },
  {
    start: { x: 777.5324851757919, y: 1033.5191455516688, z: 0 },
    end: { x: 999.650498710839, y: 1425.4426123319386, z: 0 },
  },
  {
    start: { x: 999.650498710839, y: 1425.4426123319386, z: 0 },
    end: { x: 0, y: 1030.3098916859979, z: 0 },
  },
  null,
  {
    start: { x: 1071.9419027617964, y: 416.6011307975835, z: 0 },
    end: { x: 315.1094851297181, y: 26.806349560593503, z: 0 },
  },
  {
    start: { x: 1535.4018889151644, y: 357.75584942419664, z: 0 },
    end: { x: 788.4634953979754, y: 0, z: 0 },
  },
  {
    start: { x: 1071.9419027617964, y: 416.6011307975835, z: 0 },
    end: { x: 1535.4018889151644, y: 357.75584942419664, z: 0 },
  },
  {
    start: { x: 315.1094851297181, y: 26.806349560593503, z: 0 },
    end: { x: 313.2949026663144, y: 0, z: 0 },
  },
  {
    start: { x: 1071.9419027617964, y: 416.6011307975835, z: 0 },
    end: { x: 777.5324851757919, y: 1033.5191455516688, z: 0 },
  },
  {
    start: { x: 315.1094851297181, y: 26.806349560593503, z: 0 },
    end: { x: 0, y: 744.8228865012644, z: 0 },
  },
  {
    start: { x: 1535.4018889151644, y: 357.75584942419664, z: 0 },
    end: { x: 999.650498710839, y: 1425.4426123319386, z: 0 },
  },
  null,
];

const InputLength = 5;
export const workerInput: number[] = [];

const generateRandomPoint = () => {
  const x = Math.random() * 2000 - 1000;
  const y = Math.random() * 2000 - 1000;
  const z = Math.random() * 2000 - 1000;

  workerInput.push(x, y, z);

  return new Vector3(x, y, z);
};

export const nonWorkerInput = Array.from(
  { length: InputLength },
  generateRandomPoint
);

for (let i = 0; i < InputLength; i++) {
  generateRandomPoint();
}
