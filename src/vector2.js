export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    copy() {
        return new Vector2(this.x, this.y);
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
    }

    minus(v) {
        this.x -= v.x;
        this.y -= v.y;
    }

    multiply(n) {
        this.x *= n;
        this.y *= n;
    }

    division(n) {
        this.x /= n;
        this.y /= n;
    }

    scale(v) {
        this.x *= v.x;
        this.y *= v.y;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    sqrtMagnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    //正規化を行う
    normalize() {
        this.division(this.sqrtMagnitude());
    }

    //正規化を行い、新しいベクトルを返す
    normalized() {
        const v = this.copy();
        v.normalize();

        return v;
    }
}