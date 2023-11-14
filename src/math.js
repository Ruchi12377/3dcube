export class Mathf {
  static toRad(x) {
    return (x * Math.PI) / 180;
  }

  static toDeg(x) {
    return (x * 180) / Math.PI;
  }

  static clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  static sign(n) {
    return n >= 0 ? 1 : -1;
  }
}
