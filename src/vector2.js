import { Mathf } from "./math.js";

export class Vector2 {
  constructor(x, y) {
    this.x = Number(x);
    this.y = Number(y);
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

  lerp(v, t) {
    return new Vector2(Mathf.lerp(this.x, v.x, t), Mathf.lerp(this.y, v.y, t));
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

  toString() {
    return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }
}
