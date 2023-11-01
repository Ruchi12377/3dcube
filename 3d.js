import { Camera } from "./src/camera.js";
import { Color } from "./src/color.js";
import { Geometry } from "./src/geometry.js";
import { Mathf } from "./src/math.js";
import { Matrix4x4 } from "./src/matrix4x4.js";
import { Texture } from "./src/texture.js";
import { Vector2 } from "./src/vector2.js";
import { Vector3 } from "./src/vector3.js";
import { Vector4 } from "./src/vector4.js";

//定数宣言
const FrameRate = 60;
const CanvasWidth = 600;
const CanvasHeight = 600;
const DirectionalLight = new Vector3(0, 0, 1);
const CameraControlSensitively = 35;

const camera = new Camera(
  60,
  0.3,
  20,
  new Vector3(0, 0, 0),
  new Vector3(0, 0, 0)
);

//必要な変数たち
let context;

const depthEmpty = Array.from(new Array(CanvasWidth), () =>
  new Array(CanvasHeight).fill(Number.MAX_VALUE)
);

const Alpha = new Color(0, 0, 0, 255);

//描画したい者たち
const size = 100;
let mainTexture = new Texture(512, 512);
mainTexture.loadTexture("./images/texture.png");

let maskTexture = new Texture(32, 32);
maskTexture.loadTexture("./images/noiseTexture.png");

let threshold = 0.8;

/*
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
  [
    new Vector2(0, 1),
    new Vector2(1, 1),
    new Vector2(0, 0),

    new Vector2(0, 0),
    new Vector2(0, 1),
    new Vector2(1, 0),

    new Vector2(0, 1),
    new Vector2(1, 1),
    new Vector2(1, 0),

    new Vector2(1, 0),
    new Vector2(0, 0),
    new Vector2(0, 1),

    new Vector2(0, 1),
    new Vector2(1, 1),
    new Vector2(1, 0),

    new Vector2(1, 0),
    new Vector2(0, 0),
    new Vector2(0, 1),

    //てきとう
    new Vector2(1, 0),
    new Vector2(0, 0),
    new Vector2(0, 1),
    new Vector2(1, 0),
    new Vector2(0, 0),
    new Vector2(0, 1),
    new Vector2(1, 0),
    new Vector2(0, 0),
    new Vector2(0, 1),
    new Vector2(1, 0),
    new Vector2(0, 0),
    new Vector2(0, 1),
    new Vector2(1, 0),
    new Vector2(0, 0),
    new Vector2(0, 1),
    new Vector2(1, 0),
    new Vector2(0, 0),
    new Vector2(0, 1),
  ],
  tex,
  (color = new Color(0, 127, 255, 255))
);*/

function dissolve(uv) {
  const color = mainTexture.getPixelColor(uv);
  const mask = maskTexture.getPixelColor(uv);
  const gray =
    (mask.red / 255) * 0.2 + (mask.green / 255) * 0.7 + (mask.blue / 255) * 0.1;

  if (gray < threshold) {
    return color;
  }
  return;
}

let cube = new Geometry(
  new Vector3(0, 0, 2),
  new Vector3(0, 0, 0),
  new Vector3(1, 1, 1),
  [
    new Vector3(-0.5, -0.5, 0.5),
    new Vector3(0.5, -0.5, 0.5),
    new Vector3(-0.5, 0.5, 0.5),
    new Vector3(0.5, 0.5, 0.5),
    new Vector3(-0.5, -0.5, -0.5),
    new Vector3(0.5, -0.5, -0.5),
    new Vector3(-0.5, 0.5, -0.5),
    new Vector3(0.5, 0.5, -0.5),
  ],
  [
    [1, 7, 3],
    [1, 5, 7],
    [0, 6, 4],
    [0, 2, 6],
    [0, 4, 1],
    [1, 4, 5],
    [2, 3, 6],
    [3, 7, 6],
    [0, 1, 3],
    [0, 3, 2],
    [4, 7, 5],
    [4, 6, 7],
  ],
  [
    [new Vector2(1, 0), new Vector2(0, 1), new Vector2(1, 1)],
    [new Vector2(1, 0), new Vector2(0, 0), new Vector2(0, 1)],
    [new Vector2(0, 0), new Vector2(1, 1), new Vector2(1, 0)],
    [new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1)],
    [new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 0)],
    [new Vector2(1, 0), new Vector2(0, 1), new Vector2(1, 1)],
    [new Vector2(1, 0), new Vector2(0, 0), new Vector2(1, 1)],
    [new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1)],
    [new Vector2(1, 0), new Vector2(0, 0), new Vector2(0, 1)],
    [new Vector2(1, 0), new Vector2(0, 1), new Vector2(1, 1)],
    [new Vector2(0, 0), new Vector2(1, 1), new Vector2(1, 0)],
    [new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1)],
  ],
  dissolve,
  new Color(0, 127, 255, 255)
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
  [],
  dissolve,
  new Color(255, 170, 0, 255)
);

const geometries = [cube /*, cube2*/];

window.onload = () => {
  const canvas = document.getElementById("canvas");
  canvas.width = CanvasWidth;
  canvas.height = CanvasHeight;

  context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;

  updateValue("posX");
  updateValue("posY");
  updateValue("posZ");
  updateValue("rotX");
  updateValue("rotY");
  updateValue("rotZ");
  updateValue("scaleX");
  updateValue("scaleY");
  updateValue("scaleZ");
  updateValue("threshold");
};

window.setInterval(draw, 1000 / FrameRate);

function draw() {
  let imageData = context.getImageData(0, 0, CanvasWidth, CanvasHeight);
  let buf = new ArrayBuffer(imageData.data.length);
  let buf8 = new Uint8ClampedArray(buf);
  let data = new Uint32Array(buf);

  let depthBuffer = JSON.parse(JSON.stringify(depthEmpty));

  const after = new Array();

  for (let i = 0; i < geometries.length; i++) {
    let geometry = geometries[i];
    context.strokeStyle = geometry.color;
    const vertices = geometry.copiedVertices();
    for (let j = 0; j < vertices.length; j++) {
      const v = vertices[j];
      vertices[j] = new Vector3(v.x, -v.y, v.z);
    }

    const mVertices = model(vertices, geometry);
    const vVertices = view(mVertices, camera.pos, camera.rot);
    const pVertices = project(vVertices);
    //各面の描画
    for (let index = 0; index < geometry.triangles.length; index++) {
      const tri = geometry.triangles[index];

      const p1 = vVertices[tri[0]];
      const p2 = vVertices[tri[1]];
      const p3 = vVertices[tri[2]];

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

      //lightに関しての定数kなのでkl
      const kl = lightDirectness(normal);

      //特定のジオメトリだけ頂点に番号を表示する
      if (i == 0) {
        for (let j = 0; j < 3; j++) {
          after.push([tri[j], pVertices[tri[j]].x, pVertices[tri[j]].y]);
        }
      }

      //vertices sortedの略
      let vs = [
        [pVertices[tri[0]], geometry.uvs[index][0]],
        [pVertices[tri[1]], geometry.uvs[index][1]],
        [pVertices[tri[2]], geometry.uvs[index][2]],
      ];
      //小さい順に並べる
      vs.sort((a, b) => (a[0].y < b[0].y ? -1 : 1));
      const uvs = [vs[0][1].copy(), vs[1][1].copy(), vs[2][1].copy()];

      //vsのソートされた順番に合わせる
      vs = vs.map((x) => x[0]);

      for (let j = 0; j < 3; j++) {
        uvs[j] = new Vector3(
          uvs[j].x / vs[j].w,
          uvs[j].y / vs[j].w,
          1 / vs[j].w
        );
      }

      for (let y = parseInt(Math.ceil(vs[0].y)); y < vs[2].y; y++) {
        if (y < 0 || y >= CanvasHeight) continue;

        const p = Math.abs(vs[0].y - vs[1].y) < 0.1 || y >= vs[1].y ? 1 : 0;
        let x1 = Mathf.clamp(
          vs[p].x,
          vs[p + 1].x,
          vs[p].x +
            ((y - vs[p].y) * (vs[p + 1].x - vs[p].x)) / (vs[p + 1].y - vs[p].y)
        );
        const z1 =
          vs[p].z +
          ((y - vs[p].y) * (vs[p + 1].z - vs[p].z)) / (vs[p + 1].y - vs[p].y);

        let x2 = Mathf.clamp(
          vs[0].x,
          vs[2].x,
          vs[0].x + ((y - vs[0].y) * (vs[2].x - vs[0].x)) / (vs[2].y - vs[0].y)
        );
        const z2 =
          vs[0].z + ((y - vs[0].y) * (vs[2].z - vs[0].z)) / (vs[2].y - vs[0].y);

        const u1 =
          uvs[p].x +
          ((y - vs[p].y) * (uvs[p + 1].x - uvs[p].x)) / (vs[p + 1].y - vs[p].y);
        const v1 =
          uvs[p].y +
          ((y - vs[p].y) * (uvs[p + 1].y - uvs[p].y)) / (vs[p + 1].y - vs[p].y);
        const w1 =
          uvs[p].z +
          ((y - vs[p].y) * (uvs[p + 1].z - uvs[p].z)) / (vs[p + 1].y - vs[p].y);

        const u2 =
          uvs[0].x +
          ((y - vs[0].y) * (uvs[2].x - uvs[0].x)) / (vs[2].y - vs[0].y);
        const v2 =
          uvs[0].y +
          ((y - vs[0].y) * (uvs[2].y - uvs[0].y)) / (vs[2].y - vs[0].y);
        const w2 =
          uvs[0].z +
          ((y - vs[0].y) * (uvs[2].z - uvs[0].z)) / (vs[2].y - vs[0].y);

        //事前計算したほうが早いので
        //x1 == x2のときは
        //z1 + (x - x1) * 0 = z1
        //それ以外は
        //z1 + (x - x1) * kzなので
        const kz = x1 == x2 ? 0 : (z2 - z1) / (x2 - x1);

        for (
          let x = parseInt(Math.floor(Math.min(x1, x2)));
          x < Math.ceil(Math.max(x1, x2));
          x++
        ) {
          //x2 == x1のときは0で割ることになるので
          const z = z1 + (x - x1) * kz;
          if (z < camera.nearClip || z > camera.farClip) continue;

          //描画しようとしているピクセルが、奥にある場合
          if (x < 0 || x >= CanvasWidth || z > depthBuffer[x][y]) {
            continue;
          }

          let u = x2 == x1 ? u1 : u1 + ((x - x1) * (u2 - u1)) / (x2 - x1);
          let v = x2 == x1 ? v1 : v1 + ((x - x1) * (v2 - v1)) / (x2 - x1);
          let w = x2 == x1 ? w1 : w1 + ((x - x1) * (w2 - w1)) / (x2 - x1);
          u /= w;
          v /= w;
          u = Mathf.clamp(u, 0, 1); // 計算誤差対策
          v = 1 - Mathf.clamp(v, 0, 1);

          const color = geometry.pixelShader(new Vector2(u, v));

          if (color instanceof Color == false) {
            data[y * CanvasWidth + x] = Alpha;
            continue;
          }

          //手前にあるのでデプスを更新
          depthBuffer[x][y] = z;

          data[y * CanvasWidth + x] = color.shadedColor(kl).toColor32();
        }
      }
    }
  }

  function getCanvasPixelColor(uv) {
    const x = parseInt(parseInt(uv.x) % CanvasWidth);
    const y = parseInt(parseInt(uv.y) % CanvasHeight);

    const color32 = data[y * CanvasWidth + x];

    const alpha = (color32 >> 24) & 0xff;
    const blue = (color32 >> 16) & 0xff;
    const green = (color32 >> 8) & 0xff;
    const red = color32 & 0xff;

    return new Color(red, green, blue, alpha);
  }

  imageData.data.set(buf8);
  context.putImageData(imageData, 0, 0);

  {
    context.save();
    for (let i = 0; i < after.length; i++) {
      const element = after[i];
      context.font = "24px Sans-serif";
      context.textAlign = "center";
      context.strokeStyle = "black";
      context.lineWidth = 5;
      context.strokeText(element[0], element[1], element[2]);
      context.fillStyle = "white";
      context.fillText(element[0], element[1], element[2]);
    }
    context.restore();
  }
}

function model(vertices, geometry) {
  let mat = Matrix4x4.identity;
  const pos = geometry.pos;
  const posYInv = new Vector3(pos.x, -pos.y, pos.z);
  mat.setTRS(posYInv, geometry.rot, geometry.scale);
  const modeledVertices = new Array(vertices.length);

  //拡大縮小、頂点の回転、平行移動
  for (let index = 0; index < vertices.length; index++) {
    const v = vertices[index];
    const m = mat.multiplyVector(new Vector4(v.x, v.y, v.z, 1));

    modeledVertices[index] = new Vector3(m.x, m.y, m.z);
  }

  return modeledVertices;
}

function view(vertices, camPos, camRot) {
  const viewedVertices = new Array(vertices.length);
  let mat = Matrix4x4.identity;
  mat.setTRS(camPos, camRot, new Vector3(1, 1, 1));
  mat.inverse();

  for (let index = 0; index < vertices.length; index++) {
    const v = vertices[index];
    const m = mat.multiplyVector(new Vector4(v.x, v.y, v.z, 1));

    viewedVertices[index] = new Vector3(m.x, m.y, m.z);
  }

  return viewedVertices;
}

//透視投影変換を用いて3次元の頂点を2次元の画面に変換する
function project(vertices) {
  const projectedVertices = new Array(vertices.length);
  //カメラの視野
  const f = 1 / Math.tan(Mathf.toRad(camera.viewableAngle / 2));
  const a = (CanvasWidth > CanvasHeight ? CanvasWidth : CanvasHeight) / 2;
  const q = camera.farClip / (camera.farClip - camera.nearClip);

  for (let i = 0; i < vertices.length; i++) {
    const p = vertices[i];
    //以下の式を行列に直したもの
    // const f = 1 / Math.tan(Mathf.toRad(ViewableAngle / 2));
    // const x = (a * f * p.x) / p.z + CanvasWidth / 2;
    // const y = (a * f * p.y) / p.z + CanvasHeight / 2;
    // const z = p.z * q - NearClip * q;
    // const w = p.z;
    const mat = new Matrix4x4(
      a * f,
      0,
      CanvasWidth / 2,
      0,
      0,
      a * f,
      CanvasHeight / 2,
      0,
      0,
      0,
      q,
      -camera.nearClip * q,
      0,
      0,
      1,
      0
    );

    const p4 = mat.multiplyVector(new Vector4(p.x, p.y, p.z, 1));
    p4.x /= p4.w;
    p4.y /= p4.w;
    projectedVertices[i] = p4;
  }

  return projectedVertices;
}

function lightDirectness(normal) {
  let n = normal.copy();
  n.normalize();

  //法線ベクトルを視点(Z方向)から見て正の方向になるようにする
  if (n.z < 0) {
    n.multiply(-1);
  }

  //光が三角形に真っすぐに当たっている割合
  return Mathf.clamp(DirectionalLight.dot(n), 0, 1);
}

document.addEventListener(
  "keydown",
  () => {
    if (event.key === "a") {
      camera.pos.x -= 0.1;
    }
    if (event.key === "d") {
      camera.pos.x += 0.1;
    }
    if (event.key === "w") {
      camera.pos.z += 0.1;
    }
    if (event.key === "s") {
      camera.pos.z -= 0.1;
    }

    if (event.key === "q") {
      camera.rot.y -= 1;
    }
    if (event.key === "e") {
      camera.rot.y += 1;
    }
  },
  false
);

addEventListener("mousemove", (event) => {
  const x = event.pageX;
  const y = event.pageY;

  const dx = x - CanvasWidth / 2;
  const dy = y - CanvasHeight / 2;

  const cameraLimit = camera.viewableAngle / 2;
  camera.rot.x = Mathf.clamp(
    (dy / CanvasHeight) * CameraControlSensitively,
    -cameraLimit,
    cameraLimit
  );
  camera.rot.y = Mathf.clamp(
    (dx / CanvasWidth) * CameraControlSensitively,
    -cameraLimit,
    cameraLimit
  );
});

export function updateValue(sliderId) {
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
    case "threshold":
      threshold = value;
      break;
  }
}

window.updateValue = updateValue;
