import { Input } from "./input.js";
import { Renderer } from "./renderer.js";
import { Time } from "./time.js";

export class Engine {
  constructor(
    canvasWidth,
    canvasHeight,
    camera,
    userUpdate,
    userDrawUI,
    wireFrame
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.camera = camera;

    this.userUpdate = userUpdate;
    this.userDrawUI = userDrawUI;

    this.render = new Renderer(
      this.canvasWidth,
      this.canvasHeight,
      this.camera,
      this.userDrawUI,
      wireFrame
    );

    this.geometries = [];
    this.bindedUpdate = this.update.bind(this);
  }

  start() {
    Input.start();
    this.render.start();
    this.bindedUpdate();
  }

  update() {
    Time.update();
    Input.update();

    //ユーザーのアップデートコールバックを呼ぶ
    if (this.userUpdate) {
      this.userUpdate();
    }

    this.render.render(this.geometries);

    requestAnimationFrame(this.bindedUpdate);
  }
}
