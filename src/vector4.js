export class Vector4 {
  constructor(x, y, z, w) {
    this.x = Number(x);
    this.y = Number(y);
    this.z = Number(z);
    this.w = Number(w);
  }

  copy() {
    return new Vector4(this.x, this.y, this.z, this.w);
  }

  division(n) {
    this.x /= n;
    this.y /= n;
    this.z /= n;
    this.w /= n;
  }

  sqrtMagnitude() {
    return Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    );
  }

  //正規化を行う
  normalize() {
    this.division(sqrtMagnitude());
  }

  toString() {
    return `(${this.x}, ${this.y}, ${this.z}, ${this.w})`;
  }
}
