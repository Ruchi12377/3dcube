export class Time {
  //開始時からのフレーム
  static currentFrame = 0;
  static previousMilliTime = 0;
  static _deltaMilliTime = 1000 / 60;

  static get fps() {
    return 1000 / this._deltaMilliTime;
  }

  static get deltaTime() {
    return this._deltaMilliTime / 1000;
  }

  static get time() {
    return new Date().getTime() / 1000;
  }

  static update() {
    this.currentFrame++;

    const latestMilliTime = new Date().getTime();
    this._deltaMilliTime = latestMilliTime - this.previousMilliTime;
    this.previousMilliTime = latestMilliTime;
  }
}
