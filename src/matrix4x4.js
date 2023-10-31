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

    setTRS(t, r, s) {
        const tMat = new Matrix4x4(
            1, 0, 0, t.x,
            0, 1, 0, t.y,
            0, 0, 1, t.z,
            0, 0, 0, 1,
        );

        const xRad = Mathf.toRad(-r.x);
        const yRad = Mathf.toRad(r.y);
        const zRad = Mathf.toRad(-r.z);

        const rMatX = new Matrix4x4(
            1, 0, 0, 0,
            0, Math.cos(xRad), -Math.sin(xRad), 0,
            0, Math.sin(xRad), Math.cos(xRad), 0,
            0, 0, 0, 1
        );

        const rMatY = new Matrix4x4(
            Math.cos(yRad), 0, Math.sin(yRad), 0,
            0, 1, 0, 0,
            -Math.sin(yRad), 0, Math.cos(yRad), 0,
            0, 0, 0, 1
        );

        const rMatZ = new Matrix4x4(
            Math.cos(zRad), -Math.sin(zRad), 0, 0,
            Math.sin(zRad), Math.cos(zRad), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

        const sMat = new Matrix4x4(
            s.x, 0, 0, 0,
            0, s.y, 0, 0,
            0, 0, s.z, 0,
            0, 0, 0, 1,
        );

        //拡大、ZXYの回転、平行の順番でかける
        const mat = tMat.multiply(rMatY.multiply(rMatX.multiply(rMatZ.multiply(sMat))));

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

    multiplyVector(v) {
        const x = v.x * this.m11 + v.y * this.m12 + v.z * this.m13 + v.w * this.m14;
        const y = v.x * this.m21 + v.y * this.m22 + v.z * this.m23 + v.w * this.m24;
        const z = v.x * this.m31 + v.y * this.m32 + v.z * this.m33 + v.w * this.m34;
        const w = v.x * this.m41 + v.y * this.m42 + v.z * this.m43 + v.w * this.m44;

        return new Vector4(x, y, z, w);
    }

    toString() {
        return `((${this.m11}, ${this.m12}, ${this.m13}, ${this.m14}), (${this.m21}, ${this.m22}, ${this.m23}, ${this.m24}), (${this.m31}, ${this.m32}, ${this.m33}, ${this.m34}), (${this.m41}, ${this.m42}, ${this.m43}, ${this.m44})`;
    }
}
