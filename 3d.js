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
}

class Geometry {
  constructor(posX, posY, posZ, rotX, rotY, vertices, triangles) {
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.rotX = rotX;
    this.rotY = rotY;

    this.vertices = vertices;

    this.triangles = triangles;
  }
}

const LengthFocal = 200;
const CanvasWidth = 600;
const CanvasHeight = 600;
const FrameRate = 60;

const size = 100;
let cube = new Geometry(
  0,
  0,
  0,
  0,
  0,
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
    [0, 1, 2, 3],
    [0, 4, 5, 1],
    [1, 5, 6, 2],
    [3, 2, 6, 7],
    [0, 3, 7, 4],
    [4, 7, 6, 5],
  ]
);
let context;

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

window.setInterval(function () {
  context.fillStyle = "#ffffff"; //背景色
  context.fillRect(0, 0, CanvasWidth, CanvasHeight);

  context.strokeStyle = "#000000"; //辺の色

  // cube.rotateX(pointer.y * 0.0001);

  context.fillStyle = "#007FFF"; //面の色

  const vertices = JSON.parse(JSON.stringify(cube.vertices));

  //Y軸回転
  const cosY = Math.cos(toDeg(-cube.rotY));
  const sinY = Math.sin(toDeg(-cube.rotY));

  for (let index = vertices.length - 1; index > -1; --index) {
    const p = vertices[index];

    const x = p.z * sinY + p.x * cosY;
    const z = p.z * cosY - p.x * sinY;

    p.x = x;
    p.z = z;
  }

  //X軸回転
  const cosX = Math.cos(toDeg(cube.rotX));
  const sinX = Math.sin(toDeg(cube.rotX));

  for (let index = vertices.length - 1; index > -1; --index) {
    const p = vertices[index];

    const y = p.y * cosX - p.z * sinX;
    const z = p.y * sinX + p.z * cosX;

    p.y = y;
    p.z = z;
  }

  //移動
  for (let i = 0; i < vertices.length; i++) {
    vertices[i].x += cube.posX;
    vertices[i].y -= cube.posY;
    vertices[i].z += cube.posZ;
  }
  const drawVertices = project(vertices, CanvasWidth, CanvasHeight);

  //各面の描画
  for (let index = cube.triangles.length - 1; index > -1; --index) {
    const tri = cube.triangles[index];

    //外積を求める
    const p1 = vertices[tri[0]];
    const p2 = vertices[tri[1]];
    const p3 = vertices[tri[2]];

    const v1 = new Vector3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
    const v2 = new Vector3(p3.x - p1.x, p3.y - p1.y, p3.z - p1.z);

    //求めた値
    const n = new Vector3(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    );

    //内積で表裏判断
    //表だったら描画
    if (-p1.x * n.x + -p1.y * n.y + -p1.z * n.z <= 0) {
      context.beginPath();
      context.moveTo(drawVertices[tri[0]].x, drawVertices[tri[0]].y);
      context.lineTo(drawVertices[tri[1]].x, drawVertices[tri[1]].y);
      context.lineTo(drawVertices[tri[2]].x, drawVertices[tri[2]].y);
      context.lineTo(drawVertices[tri[3]].x, drawVertices[tri[3]].y);
      context.closePath();
      context.fill();
      context.stroke();
    }
  }
}, 1000 / FrameRate);

//透視投影変換を用いて3次元の頂点を2次元の画面に変換する
function project(vertices, width, height) {
  const uv = new Array(vertices.length);

  for (let i = 0; i < vertices.length; i++) {
    const angle = 60;
    const p = vertices[i];
    const size =
      (CanvasWidth > CanvasHeight ? CanvasWidth : CanvasHeight) * 0.5;
    //カメラの視野
    const fov = 1 / Math.tan(toDeg(angle * 0.5));
    const x = (p.x / p.z) * fov * size + width * 0.5;
    const y = (p.y / p.z) * fov * size + height * 0.5;

    uv[i] = new Vector2(x, y);
  }

  return uv;
}

function updateValue(sliderId) {
  var slider = document.getElementById(sliderId);
  var output = document.getElementById(
    sliderId.replace(/[^a-zA-Z]/g, "") + "Value"
  );
  output.innerHTML = slider.value;
  const value = parseInt(slider.value);
  switch (sliderId) {
    case "posX":
      cube.posX = value;
      break;
    case "posY":
      cube.posY = value;
      break;
    case "posZ":
      cube.posZ = value;
      break;
    case "rotX":
      cube.rotX = value;
      break;
    case "rotY":
      cube.rotY = value;
      break;
  }
}

function toDeg(x) {
  return (x * Math.PI) / 180;
}
