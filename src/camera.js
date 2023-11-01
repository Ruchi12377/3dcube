export class Camera {
  constructor(viewableAngle, nearClip, farClip, pos, rot) {
    this.viewableAngle = viewableAngle;
    this.nearClip = nearClip;
    this.farClip = farClip;
    this.pos = pos;
    this.rot = rot;
  }
}
