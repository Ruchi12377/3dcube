import { Camera } from "./src/camera.js";
import { Color } from "./src/color.js";
import { Geometry } from "./src/geometry.js";
import { Mathf } from "./src/math.js";
import { Matrix4x4 } from "./src/matrix4x4.js";
import { ObjFile } from "./src/objFile.js";
import { Texture } from "./src/texture.js";
import { Vector3 } from "./src/vector3.js";
import { Vector4 } from "./src/vector4.js";

//定数宣言
const CanvasWidth = 600;
const CanvasHeight = 600;
const DirectionalLight = new Vector3(0, 0, 1);
const CameraControlSensitively = 0.1;

const camera = new Camera(
  60,
  0.3,
  20,
  new Vector3(0, 1, 0),
  new Vector3(0, 0, 0)
);

//必要な変数たち
let context;

const depthEmpty = new Uint8ClampedArray(CanvasWidth * CanvasHeight);

for (let i = 0; i < depthEmpty.length; i++) {
  depthEmpty[i] = 255;
}

const Alpha = new Color(0, 0, 0, 255);

//描画したい者たち
const size = 100;
let mainTexture = new Texture(256, 256);
mainTexture.loadTexture("./images/wood.png");

let maskTexture = new Texture(256, 256);
maskTexture.loadTexture("./images/noiseTexture.png");

let threshold = 1;
let previousTouch;

function dissolve(u, v) {
  const color = mainTexture.getPixelColor(u, v);
  const mask = maskTexture.getPixelColor(u, v);
  const gray =
    (mask.red / 255) * 0.2 + (mask.green / 255) * 0.7 + (mask.blue / 255) * 0.1;

  if (gray < threshold) {
    return color;
  }
  return;
}

const geometries = [];

let imageData;

let defaultBuf;
let buf;
let buf8;
let data;
let startTime, endTime;
let fps = 0;
let frame = 0;
let currentFrame = 0;

const bunnyFile = new ObjFile();
let bunny;
bunnyFile.loadFromObjFile("./bunny.obj", () => {
  bunny = new Geometry(
    new Vector3(0, 0, 2),
    new Vector3(0, 0, 0),
    new Vector3(1, 1, 1),
    bunnyFile.vertices,
    bunnyFile.uvs,
    bunnyFile.faces,
    dissolve
  );

  geometries.push(bunny);
});

window.onload = () => {
  const canvas = document.getElementById("canvas");
  canvas.width = CanvasWidth;
  canvas.height = CanvasHeight;

  context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;

  imageData = context.getImageData(0, 0, CanvasWidth, CanvasHeight);
  buf = new ArrayBuffer(imageData.data.length);
  defaultBuf = structuredClone(buf);

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

  startTime = new Date().getTime();
  draw();
};

function draw() {
  if (imageData == undefined) return;
  frame++;
  currentFrame++;
  threshold = Math.abs(Math.sin(currentFrame * 0.005));

  if (bunny) {
    bunny.rot.y += 0.5;
  }

  buf = structuredClone(defaultBuf);
  buf8 = new Uint8ClampedArray(buf);
  data = new Uint32Array(buf);

  const depthBuffer = structuredClone(depthEmpty);

  const after = new Array();

  for (let i = 0; i < geometries.length; i++) {
    let geometry = geometries[i];
    const shader = geometry.pixelShader;

    const vertices = geometry.copiedVertices();
    for (let j = 0; j < vertices.length; j++) {
      const v = vertices[j];
      vertices[j] = new Vector3(v.x, -v.y, v.z);
    }

    const mVertices = model(vertices, geometry);
    const vVertices = view(mVertices, camera.pos, camera.rot);
    const pVertices = project(vVertices);

    //各面の描画
    for (let index = 0; index < geometry.faces.length; index++) {
      const face = geometry.faces[index];
      if (face.length != 3) {
        console.log("面が三角形ではありません");
      }

      const p1 = vVertices[face[0].vIndex];
      const p2 = vVertices[face[1].vIndex];
      const p3 = vVertices[face[2].vIndex];

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
      // if (i == 0) {
      //   for (let j = 0; j < 3; j++) {
      //     after.push([
      //       face[j].vIndex,
      //       pVertices[face[j].vIndex].x,
      //       pVertices[face[j].vIndex].y,
      //     ]);
      //   }
      // }

      //vertices sortedの略
      let vs = [
        [pVertices[face[0].vIndex], geometry.uvs[face[0].uvIndex]],
        [pVertices[face[1].vIndex], geometry.uvs[face[1].uvIndex]],
        [pVertices[face[2].vIndex], geometry.uvs[face[2].uvIndex]],
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
          const zUInt8 = parseInt(
            Mathf.clamp(z / (camera.farClip - camera.nearClip), 0, 1) * 255
          );
          if (z < camera.nearClip || z > camera.farClip) continue;

          //描画しようとしているピクセルが、奥にある場合
          if (
            x < 0 ||
            x >= CanvasWidth ||
            zUInt8 > depthBuffer[y * CanvasWidth + x]
          ) {
            continue;
          }

          let u = x2 == x1 ? u1 : u1 + ((x - x1) * (u2 - u1)) / (x2 - x1);
          let v = x2 == x1 ? v1 : v1 + ((x - x1) * (v2 - v1)) / (x2 - x1);
          let w = x2 == x1 ? w1 : w1 + ((x - x1) * (w2 - w1)) / (x2 - x1);
          u /= w;
          v /= w;
          u = Mathf.clamp(u, 0, 1); // 計算誤差対策
          v = 1 - Mathf.clamp(v, 0, 1);

          const color = shader(u, v);
          const index = y * CanvasWidth + x;

          if (color instanceof Color == false) {
            data[index] = Alpha;
            continue;
          }

          //手前にあるのでデプスを更新
          depthBuffer[index] = zUInt8;

          // data[index] = color.shadedColor(kl).toColor32();
          data[index] = color.shadedColor(kl).toColor32();
        }
      }
    }
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

  imageData.data.set(buf8);
  context.putImageData(imageData, 0, 0);

  {
    context.save();
    // for (let i = 0; i < after.length; i++) {
    //   const element = after[i];
    //   context.font = "24px Sans-serif";
    //   context.textAlign = "center";
    //   context.strokeStyle = "black";
    //   context.lineWidth = 5;
    //   context.strokeText(element[0], element[1], element[2]);
    //   context.fillStyle = "white";
    //   context.fillText(element[0], element[1], element[2]);
    // }

    context.font = "32px sans-serif";
    context.fillStyle = "#555";
    context.fillText(fps + " FPS", 5, 30);
    context.fillText("Camera Pos : " + camera.pos.toString(), 5, 60);
    context.fillText("Camera Rot : " + camera.rot.toString(), 5, 90);

    endTime = new Date().getTime();
    if (endTime - startTime >= 1000) {
      fps = frame;
      frame = 0;
      startTime = new Date().getTime();
    }

    context.restore();
  }

  requestAnimationFrame(draw);
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
  const posYInv = new Vector3(camPos.x, -camPos.y, camPos.z);
  mat.setTRS(posYInv, camRot, new Vector3(1, 1, 1));
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
  },
  false
);

canvas.addEventListener("click", async () => {
  await canvas.requestPointerLock();
});

canvas.addEventListener("mousemove", (event) => {
  moveCamera(event.movementX, event.movementY);
});

canvas.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];
    if (previousTouch) {
      // be aware that these only store the movement of the first touch in the touches array
      const x = touch.pageX - previousTouch.pageX;
      const y = touch.pageY - previousTouch.pageY;

      moveCamera(x, y);
    }

    previousTouch = touch;
  },
  false
);

canvas.addEventListener(
  "touchend",
  (event) => {
    previousTouch = undefined;
  },
  false
);

function moveCamera(movementX, movementY) {
  const x = movementX;
  const y = movementY;

  const dx = x - CanvasWidth / 2;
  const dy = y - CanvasHeight / 2;

  const cameraLimit = camera.viewableAngle / 2;
  camera.rot.x += movementY * CameraControlSensitively;
  camera.rot.x = Mathf.clamp(camera.rot.x, -cameraLimit, cameraLimit);
  camera.rot.y += movementX * CameraControlSensitively;
  camera.rot.y = Mathf.clamp(camera.rot.y, -cameraLimit, cameraLimit);
}

export function updateValue(sliderId) {
  // var slider = document.getElementById(sliderId);
  // var output = document.getElementById(
  //   sliderId.replace(/[^a-zA-Z]/g, "") + "Value"
  // );
  // output.innerHTML = slider.value;
  // const value = parseFloat(slider.value);
  // if (geometries[0] == undefined) return;
  // switch (sliderId) {
  //   case "posX":
  //     geometries[0].pos.x = value;
  //     break;
  //   case "posY":
  //     geometries[0].pos.y = value;
  //     break;
  //   case "posZ":
  //     geometries[0].pos.z = value;
  //     break;
  //   case "rotX":
  //     cube.rot.x = value;
  //     break;
  //   case "rotY":
  //     cube.rot.y = value;
  //     break;
  //   case "rotZ":
  //     cube.rot.z = value;
  //     break;
  //   case "scaleX":
  //     cube.scale.x = value;
  //     break;
  //   case "scaleY":
  //     cube.scale.y = value;
  //     break;
  //   case "scaleZ":
  //     cube.scale.z = value;
  //     break;
  //   case "threshold":
  //     threshold = value;
  //     break;
  // }
}

window.updateValue = updateValue;
