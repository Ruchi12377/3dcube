export class Vector3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
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
    return `(${this.x}, ${this.y}, ${this.z})`;
  }
}
