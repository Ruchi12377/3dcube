import { Mathf } from "./math.js";
import { Vector4 } from "./vector4.js";

export class Matrix4x4 {
  //m11 m12 m13 m14
  //m21 m22 m23 m24
  //m31 m32 m33 m34
  //m41 m42 m43 m44

  constructor(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {
    this.m11 = m11;
    this.m12 = m12;
    this.m13 = m13;
    this.m14 = m14;

    this.m21 = m21;
    this.m22 = m22;
    this.m23 = m23;
    this.m24 = m24;

    this.m31 = m31;
    this.m32 = m32;
    this.m33 = m33;
    this.m34 = m34;

    this.m41 = m41;
    this.m42 = m42;
    this.m43 = m43;
    this.m44 = m44;
  }

  static get identity() {
    return new Matrix4x4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    )
  }

  static translation(t){
    return new Matrix4x4(
      1, 0, 0, t.x,
      0, 1, 0, t.y,
      0, 0, 1, t.z,
      0, 0, 0, 1,
    );
  }

  static rotation(r) {
    const matX = this.rotationX(r.x);
    const matY = this.rotationY(r.y);
    const matZ = this.rotationZ(r.z);
    return matY.multiply(matX.multiply(matZ))
  }
  
  static rotationX(x) {
    const xRad = Mathf.toRad(-x);
    return new Matrix4x4(
      1, 0, 0, 0,
      0, Math.cos(xRad), -Math.sin(xRad), 0,
      0, Math.sin(xRad), Math.cos(xRad), 0,
      0, 0, 0, 1
    );
  }

  static rotationY(y) {
    const yRad = Mathf.toRad(y);
    return new Matrix4x4(
      Math.cos(yRad), 0, Math.sin(yRad), 0,
      0, 1, 0, 0,
      -Math.sin(yRad), 0, Math.cos(yRad), 0,
      0, 0, 0, 1
    );
  }

  static rotationZ(z) {
    const zRad = Mathf.toRad(-z);
    return new Matrix4x4(
      Math.cos(zRad), -Math.sin(zRad), 0, 0,
      Math.sin(zRad), Math.cos(zRad), 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
  }

  static scaling(s){
    return new Matrix4x4(
      s.x, 0, 0, 0,
      0, s.y, 0, 0,
      0, 0, s.z, 0,
      0, 0, 0, 1,
    );
  }

  static projection(angle, windowWidth, windowHeight, farClip, nearClip) {
    const f = 1 / Math.tan(Mathf.toRad(angle / 2));
    const a = windowHeight / windowWidth;
    //カメラの視野
    const q = farClip / (farClip - nearClip);

    return new Matrix4x4(
      a * f, 0, 0, 0,
      0, f, 0, 0,
      0, 0, q, -nearClip * q,
      0, 0, 1, 0
    );
  }

  static viewport(pVertex, windowWidth, windowHeight) {
    pVertex.x = pVertex.x / pVertex.w + windowWidth * 0.5;
    pVertex.y = pVertex.y / pVertex.w + windowHeight * 0.5;

    return pVertex;
  }

  setTRS(t, r, s) {
    const tMat = Matrix4x4.translation(t);
    const rMat = Matrix4x4.rotation(r);
    const sMat = Matrix4x4.scaling(s);

    //拡大、ZXYの回転、平行の順番でかける
    const mat = tMat.multiply(rMat.multiply(sMat));
    this.set(mat);
  }

  multiply(m) {
    const matrix = Matrix4x4.identity;

    matrix.m11 = this.m11 * m.m11 + this.m12 * m.m21 + this.m13 * m.m31 + this.m14 * m.m41;
    matrix.m21 = this.m21 * m.m11 + this.m22 * m.m21 + this.m23 * m.m31 + this.m24 * m.m41;
    matrix.m31 = this.m31 * m.m11 + this.m32 * m.m21 + this.m33 * m.m31 + this.m34 * m.m41;
    matrix.m41 = this.m41 * m.m11 + this.m42 * m.m21 + this.m43 * m.m31 + this.m44 * m.m41;

    matrix.m12 = this.m11 * m.m12 + this.m12 * m.m22 + this.m13 * m.m32 + this.m14 * m.m42;
    matrix.m22 = this.m21 * m.m12 + this.m22 * m.m22 + this.m23 * m.m32 + this.m24 * m.m42;
    matrix.m32 = this.m31 * m.m12 + this.m32 * m.m22 + this.m33 * m.m32 + this.m34 * m.m42;
    matrix.m42 = this.m41 * m.m12 + this.m42 * m.m22 + this.m43 * m.m32 + this.m44 * m.m42;

    matrix.m13 = this.m11 * m.m13 + this.m12 * m.m23 + this.m13 * m.m33 + this.m14 * m.m43;
    matrix.m23 = this.m21 * m.m13 + this.m22 * m.m23 + this.m23 * m.m33 + this.m24 * m.m43;
    matrix.m33 = this.m31 * m.m13 + this.m32 * m.m23 + this.m33 * m.m33 + this.m34 * m.m43;
    matrix.m43 = this.m41 * m.m13 + this.m42 * m.m23 + this.m43 * m.m33 + this.m44 * m.m43;

    matrix.m14 = this.m11 * m.m14 + this.m12 * m.m24 + this.m13 * m.m34 + this.m14 * m.m44;
    matrix.m24 = this.m21 * m.m14 + this.m22 * m.m24 + this.m23 * m.m34 + this.m24 * m.m44;
    matrix.m34 = this.m31 * m.m14 + this.m32 * m.m24 + this.m33 * m.m34 + this.m34 * m.m44;
    matrix.m44 = this.m41 * m.m14 + this.m42 * m.m24 + this.m43 * m.m34 + this.m44 * m.m44;

    return matrix;
  }

  determinant() {
    const detM = 
      this.m11 * this.m22 * this.m33 * this.m44 + 
      this.m11 * this.m23 * this.m34 * this.m42 + 
      this.m11 * this.m24 * this.m32 * this.m43 + 
      this.m12 * this.m21 * this.m34 * this.m43 + 
      this.m12 * this.m23 * this.m31 * this.m44 + 
      this.m12 * this.m24 * this.m33 * this.m41 +
      this.m13 * this.m21 * this.m32 * this.m44 + 
      this.m13 * this.m22 * this.m34 * this.m41 + 
      this.m13 * this.m24 * this.m31 * this.m42 +
      this.m14 * this.m21 * this.m33 * this.m42 + 
      this.m14 * this.m22 * this.m31 * this.m43 + 
      this.m14 * this.m23 * this.m32 * this.m41 -
      this.m11 * this.m22 * this.m34 * this.m43 -
      this.m11 * this.m23 * this.m32 * this.m44 - 
      this.m11 * this.m24 * this.m33 * this.m42 -
      this.m12 * this.m21 * this.m33 * this.m44 -
      this.m12 * this.m23 * this.m34 * this.m41 - 
      this.m12 * this.m24 * this.m31 * this.m43 -
      this.m13 * this.m21 * this.m34 * this.m42 -
      this.m13 * this.m22 * this.m31 * this.m44 - 
      this.m13 * this.m24 * this.m32 * this.m41 -
      this.m14 * this.m21 * this.m32 * this.m43 -
      this.m14 * this.m22 * this.m33 * this.m41 - 
      this.m14 * this.m23 * this.m31 * this.m42;

    return detM;
  }

  inverse() {
    const mat = Matrix4x4.identity;
    const d = this.determinant();

    //とりあえず単位行列を返す
    if(d == 0) throw new Error(`determinant is 0.`);;

    mat.m11 = (this.m22 * this.m33 * this.m44 + this.m23 * this.m34 * this.m42 + this.m24 * this.m32 * this.m43 - this.m22 * this.m34 * this.m43 - this.m23 * this.m32 * this.m44 - this.m24 * this.m33 * this.m42) / d;
    mat.m12 = (this.m12 * this.m34 * this.m43 + this.m13 * this.m32 * this.m44 + this.m14 * this.m33 * this.m42 - this.m12 * this.m33 * this.m44 - this.m13 * this.m34 * this.m42 - this.m14 * this.m32 * this.m43) / d;
    mat.m13 = (this.m12 * this.m23 * this.m44 + this.m13 * this.m24 * this.m42 + this.m14 * this.m22 * this.m43 - this.m12 * this.m24 * this.m43 - this.m13 * this.m22 * this.m44 - this.m14 * this.m23 * this.m42) / d;
    mat.m14 = (this.m12 * this.m24 * this.m33 + this.m13 * this.m22 * this.m34 + this.m14 * this.m23 * this.m32 - this.m12 * this.m23 * this.m34 - this.m13 * this.m24 * this.m32 - this.m14 * this.m22 * this.m33) / d;
    mat.m21 = (this.m21 * this.m34 * this.m43 + this.m23 * this.m31 * this.m44 + this.m24 * this.m33 * this.m41 - this.m21 * this.m33 * this.m44 - this.m23 * this.m34 * this.m41 - this.m24 * this.m31 * this.m43) / d;
    mat.m22 = (this.m11 * this.m33 * this.m44 + this.m13 * this.m34 * this.m41 + this.m14 * this.m31 * this.m43 - this.m11 * this.m34 * this.m43 - this.m13 * this.m31 * this.m44 - this.m14 * this.m33 * this.m41) / d;
    mat.m23 = (this.m11 * this.m24 * this.m43 + this.m13 * this.m21 * this.m44 + this.m14 * this.m23 * this.m41 - this.m11 * this.m23 * this.m44 - this.m13 * this.m24 * this.m41 - this.m14 * this.m21 * this.m43) / d;
    mat.m24 = (this.m11 * this.m23 * this.m34 + this.m13 * this.m24 * this.m31 + this.m14 * this.m21 * this.m33 - this.m11 * this.m24 * this.m33 - this.m13 * this.m21 * this.m34 - this.m14 * this.m23 * this.m31) / d;
    mat.m31 = (this.m21 * this.m32 * this.m44 + this.m22 * this.m34 * this.m41 + this.m24 * this.m31 * this.m42 - this.m21 * this.m34 * this.m42 - this.m22 * this.m31 * this.m44 - this.m24 * this.m32 * this.m41) / d;
    mat.m32 = (this.m11 * this.m34 * this.m42 + this.m12 * this.m31 * this.m44 + this.m14 * this.m32 * this.m41 - this.m11 * this.m32 * this.m44 - this.m12 * this.m34 * this.m41 - this.m14 * this.m31 * this.m42) / d;
    mat.m33 = (this.m11 * this.m22 * this.m44 + this.m12 * this.m24 * this.m41 + this.m14 * this.m21 * this.m42 - this.m11 * this.m24 * this.m42 - this.m12 * this.m21 * this.m44 - this.m14 * this.m22 * this.m41) / d;
    mat.m34 = (this.m11 * this.m24 * this.m32 + this.m12 * this.m21 * this.m34 + this.m14 * this.m22 * this.m31 - this.m11 * this.m22 * this.m34 - this.m12 * this.m24 * this.m31 - this.m14 * this.m21 * this.m32) / d;
    mat.m41 = (this.m21 * this.m33 * this.m42 + this.m22 * this.m31 * this.m43 + this.m23 * this.m32 * this.m41 - this.m21 * this.m32 * this.m43 - this.m22 * this.m33 * this.m41 - this.m23 * this.m31 * this.m42) / d;
    mat.m42 = (this.m11 * this.m32 * this.m43 + this.m12 * this.m33 * this.m41 + this.m13 * this.m31 * this.m42 - this.m11 * this.m33 * this.m42 - this.m12 * this.m31 * this.m43 - this.m13 * this.m32 * this.m41) / d;
    mat.m43 = (this.m11 * this.m23 * this.m42 + this.m12 * this.m21 * this.m43 + this.m13 * this.m22 * this.m41 - this.m11 * this.m22 * this.m43 - this.m12 * this.m23 * this.m41 - this.m13 * this.m21 * this.m42) / d;
    mat.m44 = (this.m11 * this.m22 * this.m33 + this.m12 * this.m23 * this.m31 + this.m13 * this.m21 * this.m32 - this.m11 * this.m23 * this.m32 - this.m12 * this.m21 * this.m33 - this.m13 * this.m22 * this.m31) / d;

    this.set(mat);
  }
  
  multiplyVector(v) {
    const x = v.x * this.m11 + v.y * this.m12 + v.z * this.m13 + v.w * this.m14;
    const y = v.x * this.m21 + v.y * this.m22 + v.z * this.m23 + v.w * this.m24;
    const z = v.x * this.m31 + v.y * this.m32 + v.z * this.m33 + v.w * this.m34;
    const w = v.x * this.m41 + v.y * this.m42 + v.z * this.m43 + v.w * this.m44;

    return new Vector4(x, y, z, w);
  }

  set(mat) {
    this.m11 = mat.m11;
    this.m12 = mat.m12;
    this.m13 = mat.m13;
    this.m14 = mat.m14;

    this.m21 = mat.m21;
    this.m22 = mat.m22;
    this.m23 = mat.m23;
    this.m24 = mat.m24;

    this.m31 = mat.m31;
    this.m32 = mat.m32;
    this.m33 = mat.m33;
    this.m34 = mat.m34;

    this.m41 = mat.m41;
    this.m42 = mat.m42;
    this.m43 = mat.m43;
    this.m44 = mat.m44;
  }

  toString() {
    return `((${this.m11.toFixed(5)}, ${this.m12.toFixed(5)}, ${this.m13.toFixed(5)}, ${this.m14.toFixed(5)}), (${this.m21.toFixed(5)}, ${this.m22.toFixed(5)}, ${this.m23.toFixed(5)}, ${this.m24.toFixed(5)}), (${this.m31.toFixed(5)}, ${this.m32.toFixed(5)}, ${this.m33.toFixed(5)}, ${this.m34.toFixed(5)}), (${this.m41.toFixed(5)}, ${this.m42.toFixed(5)}, ${this.m43.toFixed(5)}, ${this.m44.toFixed(5)})`;
  }
}
