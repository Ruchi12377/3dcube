export class Vector4 {
  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
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
    return `(${this.x}, ${this.y}, ${this.z}), ${this.w})`;
  }
}
