import { Matrix4x4 } from "./matrix4x4.js";
import { Vector3 } from "./vector3.js";
import { Vector4 } from "./vector4.js";

export class Camera {
  constructor(viewableAngle, nearClip, farClip, pos, rot) {
    this.viewableAngle = viewableAngle;
    this.nearClip = nearClip;
    this.farClip = farClip;
    this.pos = pos;
    this.rot = rot;
  }

  get forward() {
    const rMat = new Matrix4x4().rotation(this.rot);
    const forward = new Vector4(0, 0, 1, 1);
    const v4 = rMat.multiplyVector(forward);
    return new Vector3(v4.x, v4.y, v4.z);
  }

  get right() {
    const rMat = new Matrix4x4().rotation(this.rot);
    const right = new Vector4(1, 0, 0, 1);
    const v4 = rMat.multiplyVector(right);

    return new Vector3(v4.x, v4.y, v4.z);
  }
}
