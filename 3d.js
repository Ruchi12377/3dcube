class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Vector3 {
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

  normalize() {
    length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    this.division(length);
  }
}

class Color {
  constructor(red, green, blue, alpha) {
    this.red = clamp(red, 0, 255);
    this.green = clamp(green, 0, 255);
    this.blue = clamp(blue, 0, 255);
    this.alpha = clamp(alpha, 0, 255);
  }

  toColorCode() {
    return (
      "#" +
      ((1 << 24) | (this.red << 16) | (this.green << 8) | this.blue)
        .toString(16)
        .slice(1)
    );
  }
}

// class Camera {
//   constructor(viewableAngle, nearClip, farClip) {
//     this.viewableAngle = viewableAngle;
//     this.nearClip = nearClip;
//     this.farClip = farClip;
//   }
// }

class Geometry {
  constructor(pos, rot, scale, vertices, triangles, color) {
    this.pos = pos;
    this.rot = rot;
    this.scale = scale;

    this.vertices = vertices;

    this.triangles = triangles;
    this.color = color;
  }

  copiedVertices() {
    const length = this.vertices.length;
    const newVertices = new Array(length);
    for (let i = 0; i < length; i++) {
      newVertices[i] = this.vertices[i].copy();
    }

    return newVertices;
  }
}

const CanvasWidth = 600;
const CanvasHeight = 600;
const FrameRate = 60;
const DirectionalLight = new Vector3(0, 0, 1);
const BackGroundColor = new Color(255, 255, 255, 255);
const NearClip = 0;
const FarClip = 200;

const ViewableAngle = 60;

const size = 100;

let cube = new Geometry(
  new Vector3(0, 0, 0),
  new Vector3(0, 0, 0),
  new Vector3(1, 1, 1),
  [
    new Vector3(-size / 2, -size / 2, -size / 2),
    new Vector3(+size / 2, -size / 2, -size / 2),
    new Vector3(+size / 2, +size / 2, -size / 2),
    new Vector3(-size / 2, +size / 2, -size / 2),
    new Vector3(-size / 2, -size / 2, +size / 2),
    new Vector3(+size / 2, -size / 2, +size / 2),
    new Vector3(+size / 2, +size / 2, +size / 2),
    new Vector3(-size / 2, +size / 2, +size / 2),
  ],
  [
    [0, 1, 3],
    [3, 1, 2],
    [1, 5, 6],
    [6, 2, 1],
    [0, 4, 5],
    [5, 1, 0],
    [3, 7, 4],
    [4, 0, 3],
    [2, 6, 7],
    [7, 3, 2],
    [5, 4, 7],
    [7, 6, 5],
  ],
  (color = new Color(0, 127, 255))
);

let cube2 = new Geometry(
  new Vector3(0, 0, 200),
  new Vector3(45, 45, 0),
  new Vector3(0.1, 0.1, 0.1),
  [
    new Vector3(-size / 2, -size / 2, -size / 2),
    new Vector3(+size / 2, -size / 2, -size / 2),
    new Vector3(+size / 2, +size / 2, -size / 2),
    new Vector3(-size / 2, +size / 2, -size / 2),
    new Vector3(-size / 2, -size / 2, +size / 2),
    new Vector3(+size / 2, -size / 2, +size / 2),
    new Vector3(+size / 2, +size / 2, +size / 2),
    new Vector3(-size / 2, +size / 2, +size / 2),
  ],
  [
    [0, 1, 3],
    [3, 1, 2],
    [1, 5, 6],
    [6, 2, 1],
    [0, 4, 5],
    [5, 1, 0],
    [3, 7, 4],
    [4, 0, 3],
    [2, 6, 7],
    [7, 3, 2],
    [5, 4, 7],
    [7, 6, 5],
  ],
  (color = new Color(255, 170, 0))
);

const geometries = [cube, cube2];
let context;

let depthEmpty = Array.from(new Array(CanvasWidth), () =>
  new Array(CanvasHeight).fill(Number.MAX_VALUE)
);

function toDeg(x) {
  return (x * Math.PI) / 180;
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

window.onload = () => {
  context = document.querySelector("canvas").getContext("2d");

  const canvas = document.getElementById("Canvas");
  canvas.width = CanvasWidth;
  canvas.height = CanvasHeight;

  updateValue("posX");
  updateValue("posY");
  updateValue("posZ");
  updateValue("rotX");
  updateValue("rotY");
};

window.setInterval(draw, 1000 / FrameRate);

let per = 0;

function draw() {
  let imageData = context.getImageData(0, 0, CanvasWidth, CanvasHeight);
  let buf = new ArrayBuffer(imageData.data.length);
  let buf8 = new Uint8ClampedArray(buf);
  let data = new Uint32Array(buf);

  let depthBuffer = JSON.parse(JSON.stringify(depthEmpty));

  context.fillStyle = BackGroundColor.toColorCode();
  context.fillRect(0, 0, CanvasWidth, CanvasHeight);
  per = (per + 1) % 110;

  for (let i = 0; i < geometries.length; i++) {
    let geometry = geometries[i];
    context.strokeStyle = geometry.color;
    const vertices = geometry.copiedVertices();

    //回転
    const cosX = Math.cos(toDeg(-geometry.rot.x));
    const sinX = Math.sin(toDeg(-geometry.rot.x));
    const cosY = Math.cos(toDeg(geometry.rot.y));
    const sinY = Math.sin(toDeg(geometry.rot.y));
    const cosZ = Math.cos(toDeg(-geometry.rot.z));
    const sinZ = Math.sin(toDeg(-geometry.rot.z));

    //頂点の回転、拡大縮小、平行移動
    for (let index = vertices.length - 1; index > -1; --index) {
      v = vertices[index];
      //拡大縮小
      v.scale(geometry.scale);
      //ZXYの回転のほうが都合が良い
      //Z軸回転
      v = new Vector3(v.x * cosZ - v.y * sinZ, v.x * sinZ + v.y * cosZ, v.z);
      //X軸回転
      v = new Vector3(v.x, v.y * cosX - v.z * sinX, v.y * sinX + v.z * cosX);
      //Y軸回転
      v = new Vector3(v.z * sinY + v.x * cosY, v.y, v.z * cosY - v.x * sinY);
      //平行移動
      //yだけ逆になってる
      v.add(new Vector3(geometry.pos.x, -geometry.pos.y, geometry.pos.z));
      vertices[index] = v;
    }

    // const vVertices = view(
    //   vertices,
    //   NearClip,
    //   FarClip,
    //   CanvasWidth,
    //   CanvasHeight
    // );
    const pVertices = project(vertices, CanvasWidth, CanvasHeight);

    //各面の描画
    for (let index = 0; index < geometry.triangles.length; index++) {
      const tri = geometry.triangles[index];

      const p1 = vertices[tri[0]];
      const p2 = vertices[tri[1]];
      const p3 = vertices[tri[2]];

      const v1 = p2.copy();
      v1.minus(p1);
      const v2 = p3.copy();
      v2.minus(p1);

      const normal = v1.cross(v2);

      //内積で表裏判断
      const d = p1.dot(normal);
      //d > 0 表
      //d < 0 裏
      //d = 0 横
      //真横と裏は描画しない
      if (d <= 0) continue;

      //vertices sortedの略
      const vs = [pVertices[tri[0]], pVertices[tri[1]], pVertices[tri[2]]];
      //小さい順に並べる
      vs.sort((a, b) => (a.y < b.y ? -1 : 1));
      //lightに関しての定数kなのでkl
      const kl = lightDirectness(normal);
      const color =
        (255 << 24) | // alpha
        ((geometry.color.blue * kl) << 16) | // blue
        ((geometry.color.green * kl) << 8) | // green
        (geometry.color.red * kl); // red

      for (let y = parseInt(Math.ceil(vs[0].y)); y < vs[2].y; y++) {
        if (y < 0 || y > CanvasHeight) continue;
        // if (y / vs[2].y > per / 100) continue;

        let p = Math.abs(vs[0].y - vs[1].y) < 0.1 || y >= vs[1].y ? 1 : 0;
        let x1 =
          vs[p].x +
          ((y - vs[p].y) * (vs[p + 1].x - vs[p].x)) / (vs[p + 1].y - vs[p].y);
        let z1 =
          vs[p].z +
          ((y - vs[p].y) * (vs[p + 1].z - vs[p].z)) / (vs[p + 1].y - vs[p].y);

        let x2 =
          vs[0].x + ((y - vs[0].y) * (vs[2].x - vs[0].x)) / (vs[2].y - vs[0].y);
        let z2 =
          vs[0].z + ((y - vs[0].y) * (vs[2].z - vs[0].z)) / (vs[2].y - vs[0].y);
        x1 = Math.min(
          Math.max(vs[p].x, vs[p + 1].x),
          Math.max(Math.min(vs[p].x, vs[p + 1].x), x1)
        );
        x2 = Math.min(
          Math.max(vs[0].x, vs[2].x),
          Math.max(Math.min(vs[0].x, vs[2].x), x2)
        );

        //事前計算したほうが早いので
        //x1 == x2のときは
        //z1 + (x - x1) * 0 = z1
        //それ以外は
        //z1 + (x - x1) * kzなので
        const kz = x1 == x2 ? 0 : (z2 - z1) / (x2 - x1);
        const countX = Math.ceil(Math.max(x1, x2));

        for (let x = parseInt(Math.floor(Math.min(x1, x2))); x < countX; x++) {
          //x2 == x1のときは0で割ることになるので
          const z = z1 + (x - x1) * kz;
          const depth = (z - NearClip) / (FarClip - NearClip);

          //描画しようとしているピクセルが、奥にある場合
          if (x < 0 || x >= CanvasWidth || depth > depthBuffer[x][y]) {
            continue;
          }

          //手前にあるのでデプスを更新
          depthBuffer[x][y] = depth;

          data[y * CanvasWidth + x] = color;

          // console.log(depth);
          // context.beginPath();
          // context.moveTo(x, y);
          // context.lineTo(x + 1, y);
          // context.closePath();
          // context.fill();
          // context.stroke();
        }
      }
    }

    imageData.data.set(buf8);
    context.putImageData(imageData, 0, 0);

    // if (i == 0) {
    //   for (let index = geometry.triangles.length - 1; index > -1; --index) {
    //     const tri = geometry.triangles[index];
    //     const p1 = vertices[tri[0]];
    //     const p2 = vertices[tri[1]];
    //     const p3 = vertices[tri[2]];

    //     const v1 = p2.copy();
    //     v1.minus(p1);
    //     const v2 = p3.copy();
    //     v2.minus(p1);

    //     const n = v1.cross(v2);

    //     //内積で表裏判断
    //     const d = p1.dot(n);
    //     //d > 0 表
    //     //d < 0 裏
    //     //d = 0 横
    //     //真横と裏は描画しない
    //     if (d <= 0) continue;

    //     context.save();
    //     for (let j = 0; j < 3; j++) {
    //       context.font = "24px Sans-serif";
    //       context.textAlign = "center";
    //       context.strokeStyle = "black";
    //       context.lineWidth = 5;
    //       context.strokeText(
    //         tri[j],
    //         pVertices[tri[j]].x,
    //         pVertices[tri[j]].y
    //       );
    //       context.fillStyle = "white";
    //       context.fillText(
    //         tri[j],
    //         pVertices[tri[j]].x,
    //         pVertices[tri[j]].y
    //       );
    //     }
    //     context.restore();
    //   }
    // }
  }
}

function view(vertices, near, far, width, height) {
  const viewedVertices = new Array(vertices.length);

  for (let i = 0; i < vertices.length; i++) {
    const p = vertices[i];
    const x = ((2 * near) / width) * p.x;
    const y = ((2 * near) / height) * p.y;
    const z =
      (-(far + near) / (far - near)) * p.z - (2 * near * far) / (far - near);
    viewedVertices[i] = new Vector3(x, y, z);
    viewedVertices[i].division(-p.z);
  }

  return viewedVertices;
}

//透視投影変換を用いて3次元の頂点を2次元の画面に変換する
function project(vertices, width, height) {
  const projectedVertices = new Array(vertices.length);

  for (let i = 0; i < vertices.length; i++) {
    const p = vertices[i];
    const size = (CanvasWidth > CanvasHeight ? CanvasWidth : CanvasHeight) / 2;
    //カメラの視野
    const fov = 1 / Math.tan(toDeg(ViewableAngle / 2));
    const x = (p.x / p.z) * fov * size + width / 2;
    const y = (p.y / p.z) * fov * size + height / 2;

    projectedVertices[i] = new Vector3(x, y, p.z);
  }

  return projectedVertices;
}

function lightDirectness(normal) {
  let n = normal.copy();
  n.normalize();

  //法線ベクトルを視点(Z方向)から見て正の方向になるようにする
  n = n.z > 0 ? n : n.multiply(-1);

  //光が三角形に真っすぐに当たっている割合
  return clamp(0, 1, DirectionalLight.dot(n));
}

function updateValue(sliderId) {
  var slider = document.getElementById(sliderId);
  var output = document.getElementById(
    sliderId.replace(/[^a-zA-Z]/g, "") + "Value"
  );
  output.innerHTML = slider.value;
  const value = parseFloat(slider.value);
  switch (sliderId) {
    case "posX":
      cube.pos.x = value;
      break;
    case "posY":
      cube.pos.y = value;
      break;
    case "posZ":
      cube.pos.z = value;
      break;
    case "rotX":
      cube.rot.x = value;
      break;
    case "rotY":
      cube.rot.y = value;
      break;
    case "rotZ":
      cube.rot.z = value;
      break;
    case "scaleX":
      cube.scale.x = value;
      break;
    case "scaleY":
      cube.scale.y = value;
      break;
    case "scaleZ":
      cube.scale.z = value;
      break;
  }
}
