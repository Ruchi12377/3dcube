import { Input } from "./input.js";
import { Renderer } from "./renderer.js";
import { Time } from "./time.js";

export class Engine {
  constructor(canvasWidth, canvasHeight, camera, userUpdate, userDrawUI) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.camera = camera;

    this.userUpdate = userUpdate;
    this.userDrawUI = userDrawUI;

    this.rederer = new Renderer(
      this.canvasWidth,
      this.canvasHeight,
      this.camera,
      this.userDrawUI
    );

    this.geometries = [];
    this.bindedUpdate = this.update.bind(this);
  }

  start() {
    Input.start();
    this.rederer.start();
    this.bindedUpdate();
  }

  update() {
    Time.update();
    Input.update();

    //ユーザーのアップデートコールバックを呼ぶ
    if (this.userUpdate) {
      this.userUpdate();
    }

    // function getCanvasPixelColor(uv) {
    //   const x = parseInt(parseInt(uv.x) % CanvasWidth);
    //   const y = parseInt(parseInt(uv.y) % CanvasHeight);

    //   const color32 = data[y * CanvasWidth + x];

    //   const alpha = (color32 >> 24) & 0xff;
    //   const blue = (color32 >> 16) & 0xff;
    //   const green = (color32 >> 8) & 0xff;
    //   const red = color32 & 0xff;

    //   return new Color(red, green, blue, alpha);
    // }

    this.rederer.render(this.geometries);

    requestAnimationFrame(this.bindedUpdate);
  }
}
