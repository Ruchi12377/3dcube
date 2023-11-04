import { Time } from "./time.js";

export class Input {
  static keyDown;
  static keyUp;

  static inputMap = new Map();
  static start(canvas) {
    document.addEventListener(
      "keydown",
      () => {
        if (this.inputMap.has(event.key) == false) {
          this.inputMap.set(event.key, "down@" + Time.currentFrame);
        }
        if (this.keyDown) {
          this.keyDown(event.key);
        }
      },
      false
    );

    document.addEventListener(
      "keyup",
      () => {
        this.inputMap.set(event.key, "up@" + Time.currentFrame);
        if (this.keyUp) {
          this.keyDown(event.key);
        }
      },
      false
    );

    this.canvas = canvas;
  }

  static getKeyInfo(key) {
    if (this.inputMap.has(key) == false) return { state: "none", frame: "-1" };

    const values = this.inputMap.get(key).split("@");

    //hold状態
    if (values.length == 1) return { state: "hold", frame: "-1" };

    const state = values[0];
    const frame = values[1];

    return { state: state, frame: frame };
  }

  static update() {
    this.inputMap.forEach((value, key) => {
      const { state, frame } = this.getKeyInfo(key);
      if (state == "hold") return;

      const currentFrame = Time.currentFrame;

      if (frame == currentFrame) return;

      if (currentFrame - frame > 1) {
        if (state == "down") {
          this.inputMap.set(key, "hold");
        }
        if (state == "up") {
          this.inputMap.delete(key);
        }
      }
    });
  }

  static getKeyDown(key) {
    const { state, _ } = this.getKeyInfo(key);
    if (state != "down") return false;
    return true;
  }

  static getKey(key) {
    const { state, _ } = this.getKeyInfo(key);
    if (state != "hold") return false;
    return true;
  }

  static getKeyUp(key) {
    const { state, _ } = this.getKeyInfo(key);
    if (state != "up") return false;
    return true;
  }
}
