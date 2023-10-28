class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  copy() {
    return new Vector2(this.x, this.y);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
  }

  multiply(n) {
    this.x *= n;
    this.y *= n;
  }

  division(n) {
    this.x /= n;
    this.y /= n;
  }

  scale(v) {
    this.x *= v.x;
    this.y *= v.y;
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
    if (length > 0) {
      this.division(length);
    }
  }

  normalized() {
    length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    if (length > 0) {
      this.division(length);
    }

    return new Vector3(x / n, y / n, z / n);
  }
}

class Vector4 {
  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  copy() {
    return new Vector3(this.x, this.y, this.z, this.w);
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

  toColor32() {
    return (
      (this.alpha << 24) | (this.blue << 16) | (this.green << 8) | this.red
    );
  }

  toLinear() {
    let lr = this.red / 255;
    let lg = this.green / 255;
    let lb = this.blue / 255;

    return new Vector3(lr, lg, lb);
  }
}

// class Camera {
//   constructor(viewableAngle, nearClip, farClip) {
//     this.viewableAngle = viewableAngle;
//     this.nearClip = nearClip;
//     this.farClip = farClip;
//   }
// }

class Texture {
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

  getPixelColor(uv) {
    if (this.imageData == null) {
      return new Color(255, 0, 255, 255);
    }

    const x = parseInt(uv.x * (this.width - 1));
    const y = parseInt(uv.y * (this.height - 1));

    const index = (y * this.width + x) * 4;
    const red = this.imageData.data[index];
    const green = this.imageData.data[index + 1];
    const blue = this.imageData.data[index + 2];
    const alpha = this.imageData.data[index + 3];

    const color = new Color(red, green, blue, alpha);

    return color;
  }
}

class Geometry {
  constructor(pos, rot, scale, vertices, triangles, uvs, pixelShader, color) {
    this.pos = pos;
    this.rot = rot;
    this.scale = scale;

    this.vertices = vertices;
    this.triangles = triangles;
    this.uvs = uvs;
    this.pixelShader = pixelShader;

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

//定数宣言
const FrameRate = 60;
const CanvasWidth = 600;
const CanvasHeight = 600;
const DirectionalLight = new Vector3(0, 0, 1);
const BackGroundColor = new Color(255, 255, 255, 255);
const NearClip = 0;
const FarClip = 400;
const ViewableAngle = 60;

//アンチエイリアス
function swap() {
  anti = anti == false;
}
let anti = true;

//必要な変数たち
let context;

const depthEmpty = Array.from(new Array(CanvasWidth), () =>
  new Array(CanvasHeight).fill(Number.MAX_VALUE)
);

const Alpha = new Color(0, 0, 0, 255);

//描画したい者たち
const size = 100;
let mainTexture = new Texture(600, 600);
mainTexture.loadTexture("./texture.png");

let maskTexture = new Texture(256, 256);
maskTexture.loadTexture("../noise/noiseTexture.png");

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

function tex2d(texture, uv) {
  return texture.getPixelColor(uv);
}

function dissolve(uv) {
  const color = tex2d(mainTexture, uv);
  // const mask = tex2d(maskTexture, uv);
  // const gray =
  // (mask.red / 255) * 0.2 + (mask.green / 255) * 0.7 + (mask.blue / 255) * 0.1;

  // if (gray < threshold) {
  return color;
  // }
  // return;
}

let cube = new Geometry(
  new Vector3(0, 0, 100),
  new Vector3(0, 0, 0),
  new Vector3(1, 1, 1),
  [
    new Vector3(-50, 50, 0),
    new Vector3(50, -50, 0),
    new Vector3(-50, -50, 0),
    new Vector3(50, 50, 0),
  ],
  [
    [0, 1, 2],
    [0, 3, 1],
  ],
  [
    [new Vector2(0, 1), new Vector2(1, 0), new Vector2(0, 0)],
    [new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0)],
  ],
  dissolve,
  (color = new Color(0, 127, 255, 255))
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
  (color = new Color(255, 170, 0, 255))
);

const geometries = [cube /*, cube2*/];

function toDeg(x) {
  return (x * Math.PI) / 180;
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

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

function shadedColor(color, intensity) {
  return new Color(
    color.red * intensity,
    color.green * intensity,
    color.blue * intensity,
    color.alpha
  );
}

function draw() {
  let imageData = context.getImageData(0, 0, CanvasWidth, CanvasHeight);
  let buf = new ArrayBuffer(imageData.data.length);
  let buf8 = new Uint8ClampedArray(buf);
  let data = new Uint32Array(buf);

  let depthBuffer = JSON.parse(JSON.stringify(depthEmpty));

  context.fillStyle = BackGroundColor.toColorCode();
  context.fillRect(0, 0, CanvasWidth, CanvasHeight);

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

    // const vVertices = view(
    //   vertices,
    //   NearClip,
    //   FarClip,
    //   CanvasWidth,
    //   CanvasHeight
    // );
    const pVertices = project(mVertices, CanvasWidth, CanvasHeight);
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
        let x1 = clamp(
          vs[p].x,
          vs[p + 1].x,
          vs[p].x +
            ((y - vs[p].y) * (vs[p + 1].x - vs[p].x)) / (vs[p + 1].y - vs[p].y)
        );
        const z1 =
          vs[p].z +
          ((y - vs[p].y) * (vs[p + 1].z - vs[p].z)) / (vs[p + 1].y - vs[p].y);

        let x2 = clamp(
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
        const countX = Math.ceil(Math.max(x1, x2));

        for (let x = parseInt(Math.floor(Math.min(x1, x2))); x < countX; x++) {
          //x2 == x1のときは0で割ることになるので
          const z = z1 + (x - x1) * kz;
          if (z < NearClip || z > FarClip) continue;

          //描画しようとしているピクセルが、奥にある場合
          if (x < 0 || x >= CanvasWidth || z > depthBuffer[x][y]) {
            continue;
          }

          //lightに関しての定数kなのでkl
          const kl = lightDirectness(normal);

          // let u = u1 + (x - x1) * ku;
          // let v = v1 + (x - x1) * kv;

          let u = x2 == x1 ? u1 : u1 + ((x - x1) * (u2 - u1)) / (x2 - x1);
          let v = x2 == x1 ? v1 : v1 + ((x - x1) * (v2 - v1)) / (x2 - x1);
          let w = x2 == x1 ? w1 : w1 + ((x - x1) * (w2 - w1)) / (x2 - x1);
          u /= w;
          v /= w;
          u = clamp(u, 0, 1); // 計算誤差対策
          v = 1 - clamp(v, 0, 1);

          const color = geometry.pixelShader(new Vector2(u, v));

          if (color instanceof Color == false) {
            data[y * CanvasWidth + x] = Alpha;
            continue;
          }

          //手前にあるのでデプスを更新
          depthBuffer[x][y] = z;

          data[y * CanvasWidth + x] = color.toColor32();
        }
      }
    }
  }

  function getCanvasPixelColor(uv) {
    x = parseInt(clamp(uv.x, 0, CanvasWidth));
    y = parseInt(clamp(uv.y, 0, CanvasHeight));

    const color32 = data[y * CanvasWidth + x];

    const alpha = (color32 >> 24) & 0xff;
    const blue = (color32 >> 16) & 0xff;
    const green = (color32 >> 8) & 0xff;
    const red = color32 & 0xff;

    return new Color(red, green, blue, alpha);
  }

  if (anti) {
    function RGBToLuminance(c) {
      const x = new Vector3(c.red, c.green, c.blue);
      return x.dot(new Vector3(0.2126729, 0.7151522, 0.072175)) / 255;
    }

    function Sample(uv) {
      return getCanvasPixelColor(uv);
    }

    function SampleLuminance(uv, uOffset, vOffset) {
      return RGBToLuminance(
        Sample(new Vector2(uv.x + uOffset, uv.y + vOffset))
      );
    }

    for (let y = 0; y < CanvasHeight; y++) {
      for (let x = 0; x < CanvasWidth; x++) {
        const uv = new Vector2(x, y);

        const m = SampleLuminance(uv, 0, 0);
        const n = SampleLuminance(uv, 0, 1);
        const e = SampleLuminance(uv, 1, 0);
        const s = SampleLuminance(uv, 0, -1);
        const w = SampleLuminance(uv, -1, 0);
        const highest = Math.max(Math.max(Math.max(Math.max(n, e), s), w), m);
        const lowest = Math.min(Math.min(Math.min(Math.min(n, e), s), w), m);
        const contrast = highest - lowest;

        data[y * CanvasWidth + x] = new Color(
          contrast * 255,
          contrast * 255,
          contrast * 255,
          255
        ).toColor32();
      }
    }
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

  return vertices;
}

/*
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
}*/

//透視投影変換を用いて3次元の頂点を2次元の画面に変換する
function project(vertices, width, height) {
  const projectedVertices = new Array(vertices.length);

  for (let i = 0; i < vertices.length; i++) {
    const p = vertices[i];
    const a = (CanvasWidth > CanvasHeight ? CanvasWidth : CanvasHeight) / 2;
    const q = FarClip / (FarClip - NearClip);
    //カメラの視野
    const f = 1 / Math.tan(toDeg(ViewableAngle / 2));
    const x = (a * f * p.x) / p.z + width / 2;
    const y = (a * f * p.y) / p.z + height / 2;
    const z = p.z * q - NearClip * q;
    const w = p.z;

    projectedVertices[i] = new Vector4(x, y, z, w);
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
    case "threshold":
      threshold = value;
      break;
  }
}
