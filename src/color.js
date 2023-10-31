import { Mathf } from "./math.js";
import { Vector3 } from "./vector3.js";

export class Color {
  constructor(red, green, blue, alpha) {
    this.red = Mathf.clamp(red, 0, 255);
    this.green = Mathf.clamp(green, 0, 255);
    this.blue = Mathf.clamp(blue, 0, 255);
    this.alpha = Mathf.clamp(alpha, 0, 255);
  }

  toColorCode() {
    return (
      "#" +
      ((1 << 24) | (this.red << 16) | (this.green << 8) | this.blue)
        .toString(16)
        .slice(1)
    );
  }

  toColor32() {
    return (
      (this.alpha << 24) | (this.blue << 16) | (this.green << 8) | this.red
    );
  }

  toLinear() {
    const lr = this.red / 255.0;
    const lg = this.green / 255.0;
    const lb = this.blue / 255.0;

    return new Vector3(lr, lg, lb);
  }

  shadedColor(intensity) {
    return new Color(
      this.red * intensity,
      this.green * intensity,
      this.blue * intensity,
      this.alpha
    );
  }

  blendColor(color) {
    return new Color(
      (this.red * color.red) / 2,
      (this.green * color.green) / 2,
      (this.blue * color.blue) / 2,
      (this.alpha * color.alpha) / 2
    );
  }
}
