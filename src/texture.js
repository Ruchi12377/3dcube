import { Color } from "./color.js";

export class Texture {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.drawingContext = this.canvas.getContext("2d");
    this.imageData = null;
  }

  loadTexture(src, loaded) {
    let img = new Image();
    img.crossOrigin = `Anonymous`;

    img.src = src;
    img.onload = () => {
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      this.drawingContext.drawImage(img, 0, 0);

      this.imageData = this.drawingContext.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      if (loaded) {
        loaded();
      }
    };
  }

  getPixelColor(u, v) {
    if (this.imageData == null) {
      return new Color(255, 0, 255, 255);
    }

    const x = parseInt(u * (this.width - 1));
    const y = parseInt(v * (this.height - 1));

    const index = (y * this.width + x) * 4;
    const red = this.imageData.data[index];
    const green = this.imageData.data[index + 1];
    const blue = this.imageData.data[index + 2];
    const alpha = this.imageData.data[index + 3];

    const color = new Color(red, green, blue, alpha);

    return color;
  }
}
