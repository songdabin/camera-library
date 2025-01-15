import { LtMatrix3 } from "../types/LtMatrix3";

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
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export class LtMatrix4 {
  private _elements: number[];

  // prettier-ignore
  constructor(props?: LtMatrix4Props) {
      this._elements = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
  
      if (props) {
        this.set(
          props[0], props[1], props[2], props[3],
          props[4], props[5], props[6], props[7],
          props[8], props[9], props[10], props[11],
          props[12], props[13], props[14], props[15]
        );
      }
  
      return this;
    }

  // prettier-ignore
  set(
      n11: number, n12: number, n13: number, n14: number,
      n21: number, n22: number, n23: number, n24: number,
      n31: number, n32: number, n33: number ,n34: number,
      n41: number, n42: number, n43: number, n44: number
      ) {
      this._elements[0] = n11;
      this._elements[1] = n12;
      this._elements[2] = n13;
      this._elements[3] = n14;
      this._elements[4] = n21;
      this._elements[5] = n22;
      this._elements[6] = n23;
      this._elements[7] = n24;
      this._elements[8] = n31;
      this._elements[9] = n32;
      this._elements[10] = n33;
      this._elements[11] = n34;
      this._elements[12] = n41;
      this._elements[13] = n42;
      this._elements[14] = n43;
      this._elements[15] = n44;
  
      return this;
    }

  // prettier-ignore
  setFromMatrix3(matrix: LtMatrix3): LtMatrix4 {
    const me = matrix.elements();
    
    this.set(
      me[0], me[1], me[2], 0,
      me[3], me[4], me[5], 0,
      me[6], me[7], me[8], 0,
      0, 0, 0, 1
    );

    return this;
  }

  // prettier-ignore
  setFromMatrix3by4(matrix: number[]) {
      if (matrix.length !== 12) throw new Error('matrix is not 3 * 4 matrix');
  
      this.set(
        matrix[0], matrix[1], matrix[2], matrix[3],
        matrix[4], matrix[5], matrix[6], matrix[7],
        matrix[8], matrix[9], matrix[10], matrix[11],
        0, 0, 0, 1
      );
  
      return this;
  }

  multiply(matrix: LtMatrix4) {
    return this.multiplyMatrices(this, matrix);
  }

  premultiply(matrix: LtMatrix4) {
    return this.multiplyMatrices(matrix, this);
  }

  // prettier-ignore
  multiplyMatrices(am: LtMatrix4, bm: LtMatrix4) {
      const m = this._elements;
      const a = am.elements();
      const b = bm.elements();
  
      const a11 = a[0], a12 = a[1], a13 = a[2], a14 = a[3];
      const a21 = a[4], a22 = a[5], a23 = a[6], a24 = a[7];
      const a31 = a[8], a32 = a[9], a33 = a[10], a34 = a[11];
      const a41 = a[12], a42 = a[13], a43 = a[14], a44 = a[15];
    
      const b11 = b[0], b12 = b[1], b13 = b[2], b14 = b[3];
      const b21 = b[4], b22 = b[5], b23 = b[6], b24 = b[7];
      const b31 = b[8], b32 = b[9], b33 = b[10], b34 = b[11];
      const b41 = b[12], b42 = b[13], b43 = b[14], b44 = b[15];
    
      m[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
      m[1] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
      m[2] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
      m[3] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
  
      m[4] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
      m[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
      m[6] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
      m[7] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
  
      m[8] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
      m[9] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
      m[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
      m[11] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
  
      m[12] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
      m[13] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
      m[14] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
      m[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
      
      return this;
    }

  translate(x: number, y: number, z: number) {
    this._elements[3] = x;
    this._elements[7] = y;
    this._elements[11] = z;

    return this;
  }

  // prettier-ignore
  transpose() {
      let tmp = null;
      const m = this._elements;
  
      tmp = m[1]; m[1] = m[4]; m[4] = tmp;
      tmp = m[2]; m[2] = m[8]; m[8] = tmp;
      tmp = m[6]; m[6] = m[9]; m[9] = tmp;
  
      tmp = m[3]; m[3] = m[12]; m[12] = tmp;
      tmp = m[7]; m[7] = m[13]; m[13] = tmp;
      tmp = m[11]; m[11] = m[14]; m[14] = tmp;
  
      return this;
    }

  // prettier-ignore
  invert() {
      const m = this._elements;
  
      const n11 = m[0], n12 = m[4], n13 = m[8], n14 = m[12];
      const n21 = m[1], n22 = m[5], n23 = m[9], n24 = m[13];
      const n31 = m[2], n32 = m[6], n33 = m[10], n34 = m[14];
      const n41 = m[3], n42 = m[7], n43 = m[11], n44 = m[15];
  
      const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
      const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
          const	t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
      const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
  
      const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
  
      if (det === 0) return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
  
      const detInv = 1 / det;
  
      m[0] = t11 * detInv;
          m[1] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
          m[2] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
          m[3] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;
  
          m[4] = t12 * detInv;
          m[5] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
          m[6] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
          m[7] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;
  
          m[8] = t13 * detInv;
          m[9] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
          m[10] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
          m[11] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;
  
          m[12] = t14 * detInv;
          m[13] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
          m[14] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
          m[15] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;
      
      return this;
    }

  elements() {
    return this._elements;
  }
}

// prettier-ignore
export function rotationX(angle: number) {
    return new LtMatrix3([
      1, 0, 0,
      0, Math.cos(angle), -Math.sin(angle),
      0, Math.sin(angle), Math.cos(angle),
    ]);
  }

// prettier-ignore
export function rotationY(angle: number) {
    return new LtMatrix3([
      Math.cos(angle), 0, Math.sin(angle),
      0, 1, 0,
      -Math.sin(angle), 0, Math.cos(angle),
    ]);
  }

// prettier-ignore
export function rotationZ(angle: number) {
    return new LtMatrix3([
      Math.cos(angle), -Math.sin(angle), 0,
      Math.sin(angle), Math.cos(angle), 0,
      0, 0, 1
    ]);
  }

/**
 * multiply N * 4 matrix with 4 * 4 matrix
 *
 * @param a N * 4 matrix
 * @param b 4 * 4 matrix
 * @returns N * 4 matrix
 */
// prettier-ignore
export function multiplyMatrix4(a: number[], b: number[]) {
    assertMatrix4(a);
    assertSquareMatrix4(b);
  
    const b11 = b[0], b12 = b[1], b13 = b[2], b14 = b[3];
    const b21 = b[4], b22 = b[5], b23 = b[6], b24 = b[7];
    const b31 = b[8], b32 = b[9], b33 = b[10], b34 = b[11];
    const b41 = b[12], b42 = b[13], b43 = b[14], b44 = b[15];
    
    const result: number[] = [];
    for (let i = 0; i < a.length; i += 4) {
      const a11 = a[i], a12 = a[i + 1], a13 = a[i + 2], a14 = a[i + 3];
  
      result.push(
        a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41,
        a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42,
        a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43,
        a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44
      );
    }
  
    return result;
  }

/**
 * Multiply N * 4 matrix with 4 * 3 matrix
 *
 * @param m N * 4 matrix
 * @param intrinsicT 4 * 3 intrinsic matrix
 * @return N * 3 matrix
 */
// prettier-ignore
export function multiplyMatrix4byIntrinsicTranspose(m: number[], intrinsicT: number[]) {
    const i11 = intrinsicT[0], i12 = intrinsicT[1], i13 = intrinsicT[2];
    const i21 = intrinsicT[3], i22 = intrinsicT[4], i23 = intrinsicT[5];
    const i31 = intrinsicT[6], i32 = intrinsicT[7], i33 = intrinsicT[8];
    const i41 = intrinsicT[9], i42 = intrinsicT[10], i43 = intrinsicT[11];
  
    const result: number[] = [];
    for (let i = 0; i < m.length; i += 4) {
      const m11 = m[i], m12 = m[i + 1], m13 = m[i + 2], m14 = m[i + 3];
  
      result.push(
        m11 * i11 + m12 * i21 + m13 * i31 + m14 * i41,
        m11 * i12 + m12 * i22 + m13 * i32 + m14 * i42,
        m11 * i13 + m12 * i23 + m13 * i33 + m14 * i43
      );
    }
  
    return result;
  }

/**
 * Convert N * 4 matrix to N * 3 matrix
 *
 * @param matrix N * 4 matrix
 * @returns N * 3 matrix
 */
export function matrix4to3(matrix: number[]) {
  assertMatrix4(matrix);

  const result: number[] = [];
  for (let i = 0; i < matrix.length; i += 4) {
    result.push(matrix[i], matrix[i + 1], matrix[i + 2]);
  }

  return result;
}

/**
 * N * 3 matrix to homogeneous N * 4 matrix
 *
 * @param matrix N * 3 matrix
 * @returns N * 4 matrix with 1 in the last column
 *          [x, y, z] -> [x, y, z, 1]
 */
export function toHomogeneous(matrix: number[]) {
  assertMatrix3(matrix);

  const result: number[] = [];
  for (let i = 0; i < matrix.length; i += 3) {
    result.push(matrix[i], matrix[i + 1], matrix[i + 2], 1);
  }

  return result;
}

/**
 * Get homogeneous transform matrix from euler angle, translation
 *
 * @param params { angle, translation, order }
 * @returns LtMatrix4 that is applied with rotation and translation
 */
export function getHomogeneousTransformMatrix({
  angle,
  translation = { tx: 0, ty: 0, tz: 0 },
  order = "zyx",
}: {
  angle: { yaw: number; roll: number; pitch: number };
  translation?: { tx: number; ty: number; tz: number };
  order?: string;
}) {
  const { tx, ty, tz } = translation;
  const { roll, pitch, yaw } = angle;

  const matrices = {
    x: rotationX(roll),
    y: rotationY(pitch),
    z: rotationZ(yaw),
  };

  const rotationMatrix = matrices[order[0] as keyof typeof matrices]
    .multiply(matrices[order[1] as keyof typeof matrices])
    .multiply(matrices[order[2] as keyof typeof matrices]);

  const matrix4: LtMatrix4 = new LtMatrix4().setFromMatrix3(rotationMatrix);

  return matrix4.translate(tx, ty, tz);
}

/**
 * Transpose N * K matrix to K * N matrix
 *
 * @param m N * K matrix
 * @param columnSize K which is the matrix column size
 * @returns K * N matrix
 */
export function transpose(m: number[], columnSize: number) {
  const rowSize = m.length / columnSize;

  const result: number[] = new Array(m.length);
  for (let i = 0; i < rowSize; i += 1) {
    for (let j = 0; j < columnSize; j += 1) {
      result[j * rowSize + i] = m[i * columnSize + j];
    }
  }

  return result;
}

export function assertMatrix3(matrix: number[]) {
  if (matrix.length % 3 !== 0) throw new Error("matrix is not N * 3 matrix");
}

export function assertSquareMatrix3(matrix: number[]) {
  if (matrix.length !== 9) throw new Error("matrix is not 3 * 3 matrix");
}

export function assertSquareMatrix4(matrix: number[]) {
  if (matrix.length !== 16) throw new Error("matrix is not 4 * 4 matrix");
}

export function assertMatrix4(matrix: number[]) {
  if (matrix.length % 4 !== 0) throw new Error("matrix is not N * 4 matrix");
}
