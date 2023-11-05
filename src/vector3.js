export class Vector3 {
  constructor(x, y, z) {
    this.x = Number(x);
    this.y = Number(y);
    this.z = Number(z);
  }

  static get right() {
    return new Vector3(1, 0, 0);
  }

  static get up() {
    return new Vector3(0, 1, 0);
  }

  static get forward() {
    return new Vector3(0, 0, 1);
  }

  copy() {
    return new Vector3(this.x, this.y, this.z);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }

  minus(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
  }

  multiply(n) {
    this.x *= n;
    this.y *= n;
    this.z *= n;
  }

  division(n) {
    this.x /= n;
    this.y /= n;
    this.z /= n;
  }

  //ベクトル同士の掛け算
  scale(v) {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
  }

  //外積
  cross(v) {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  //内積
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  sqrtMagnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
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
    return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
  }
}
