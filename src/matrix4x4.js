import { Mathf } from "./math.js";

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

    static get identify() {
        return new Matrix4x4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        )
    }

    SetTRS(t, r, s) {
        const tMat = new Matrix4x4(
            1, 0, 0, t.x,
            0, 1, 0, t.y,
            0, 0, 1, t.z,
            0, 0, 0, 1,
        );

        const xRad = Mathf.toRad(r.x);
        const yRad = Mathf.toRad(r.y);
        const zRad = Mathf.toRad(r.z);

        const rMatX = new Matrix4x4(
            1, 0, 0, 0,
            0, Math.cos(xRad), -Math.sin(xRad), 0,
            0, Math.sin(xRad), Math.cos(xRad), 0,
            0, 0, 0, 1
        )

        const rMatY = new Matrix4x4(
            Math.cos(yRad), 0, Math.sin(yRad), 0,
            0, 1, 0, 0,
            -Math.sin(yRad), 0, Math.cos(yRad), 0,
            0, 0, 0, 1
        )

        const rMatZ = new Matrix4x4(
            Math.cos(zRad), -Math.sin(zRad), 0, 0,
            Math.sin(zRad), Math.cos(zRad), 0,
            0, 1, 0, 0,
            0, 0, 0, 1
        )

        const sMat = new Matrix4x4(
            s.x, 0, 0, 1,
            0, s.y, 0, 1,
            0, 0, s.z, 1,
            0, 0, 0, 1,
        );

        //拡大、回転、平行の順番でかける
        const mat = tMat.multiply(rMatY.multiply(rMatX.multiply(rMatZ.multiply(sMat))));
        return mat;
    }

    multiply(m1) {
        const matrix = Matrix4x4.identify;

        matrix.m11 = this.m11 * m1.m11 + this.m12 * m1.m21 + this.m13 * m1.m31 + this.m14 * m1.m41;
        matrix.m21 = this.m21 * m1.m11 + this.m22 * m1.m21 + this.m23 * m1.m31 + this.m24 * m1.m41;
        matrix.m31 = this.m31 * m1.m11 + this.m32 * m1.m21 + this.m33 * m1.m31 + this.m34 * m1.m41;
        matrix.m41 = this.m41 * m1.m11 + this.m42 * m1.m21 + this.m43 * m1.m31 + this.m44 * m1.m41;

        matrix.m12 = this.m11 * m1.m12 + this.m12 * m1.m22 + this.m13 * m1.m32 + this.m14 * m1.m42;
        matrix.m22 = this.m21 * m1.m12 + this.m22 * m1.m22 + this.m23 * m1.m32 + this.m24 * m1.m42;
        matrix.m32 = this.m31 * m1.m12 + this.m32 * m1.m22 + this.m33 * m1.m32 + this.m34 * m1.m42;
        matrix.m42 = this.m41 * m1.m12 + this.m42 * m1.m22 + this.m43 * m1.m32 + this.m44 * m1.m42;

        matrix.m13 = this.m11 * m1.m13 + this.m12 * m1.m23 + this.m13 * m1.m33 + this.m14 * m1.m43;
        matrix.m23 = this.m21 * m1.m13 + this.m22 * m1.m23 + this.m23 * m1.m33 + this.m24 * m1.m43;
        matrix.m33 = this.m31 * m1.m13 + this.m32 * m1.m23 + this.m33 * m1.m33 + this.m34 * m1.m43;
        matrix.m43 = this.m41 * m1.m13 + this.m42 * m1.m23 + this.m43 * m1.m33 + this.m44 * m1.m43;

        matrix.m14 = this.m11 * m1.m14 + this.m12 * m1.m24 + this.m13 * m1.m34 + this.m14 * m1.m44;
        matrix.m24 = this.m21 * m1.m14 + this.m22 * m1.m24 + this.m23 * m1.m34 + this.m24 * m1.m44;
        matrix.m34 = this.m31 * m1.m14 + this.m32 * m1.m24 + this.m33 * m1.m34 + this.m34 * m1.m44;
        matrix.m44 = this.m41 * m1.m14 + this.m42 * m1.m24 + this.m43 * m1.m34 + this.m44 * m1.m44;

        return matrix;
    }

    toString() {
        return `((${this.m11}, ${this.m12}, ${this.m13}, ${this.m14}), (${this.m21}, ${this.m22}, ${this.m23}, ${this.m24}), (${this.m31}, ${this.m32}, ${this.m33}, ${this.m34}), (${this.m41}, ${this.m42}, ${this.m43}, ${this.m44})`;
    }
}
