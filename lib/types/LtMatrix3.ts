export type LtMatrix4Props = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export class LtMatrix3 {
  private _elements: number[];
  // prettier-ignore
  constructor(props?: LtMatrix4Props) {
    this._elements = [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ];

    if (props) {
      this.set(
        props[0], props[1], props[2],
        props[3], props[4], props[5],
        props[6], props[7], props[8],
      );
    }

    return this;
  }

  // prettier-ignore
  set(
  n11: number, n12: number, n13: number, 
  n21: number, n22: number, n23: number, 
  n31: number, n32: number, n33: number,
  ) {
  this._elements[0] = n11;
  this._elements[1] = n12;
  this._elements[2] = n13;
  this._elements[3] = n21;
  this._elements[4] = n22;
  this._elements[5] = n23;
  this._elements[6] = n31;
  this._elements[7] = n32;
  this._elements[8] = n33;

  return this;
}

  multiply(matrix: LtMatrix3) {
    return this.multiplyMatrices(this, matrix);
  }

  premultiply(matrix: LtMatrix3) {
    return this.multiplyMatrices(matrix, this);
  }

  // prettier-ignore
  multiplyMatrices(am: LtMatrix3, bm: LtMatrix3) {
  const m = this._elements;
  const a = am.elements();
  const b = bm.elements();

  const a11 = a[0], a12 = a[1], a13 = a[2];
  const a21 = a[3], a22 = a[4], a23 = a[5];
  const a31 = a[6], a32 = a[7], a33 = a[8];

  const b11 = b[0], b12 = b[1], b13 = b[2];
  const b21 = b[3], b22 = b[4], b23 = b[5];
  const b31 = b[6], b32 = b[7], b33 = b[8];

  m[0] = a11 * b11 + a12 * b21 + a13 * b31;
  m[1] = a11 * b12 + a12 * b22 + a13 * b32;
  m[2] = a11 * b13 + a12 * b23 + a13 * b33;

  m[3] = a21 * b11 + a22 * b21 + a23 * b31;
  m[4] = a21 * b12 + a22 * b22 + a23 * b32;
  m[5] = a21 * b13 + a22 * b23 + a23 * b33;

  m[6] = a31 * b11 + a32 * b21 + a33 * b31;
  m[7] = a31 * b12 + a32 * b22 + a33 * b32;
  m[8] = a31 * b13 + a32 * b23 + a33 * b33;

  return this;
}

  elements() {
    return this._elements;
  }
}
