class Point2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Point3D {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Cube {
  constructor(posX, posY, posZ, rotX, rotY, size) {
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.rotX = rotX;
    this.rotY = rotY;
    this.size = size;

    this.vertices = [
      new Point3D(-size / 2, -size / 2, -size / 2),
      new Point3D(+size / 2, -size / 2, -size / 2),
      new Point3D(+size / 2, +size / 2, -size / 2),
      new Point3D(-size / 2, +size / 2, -size / 2),
      new Point3D(-size / 2, -size / 2, +size / 2),
      new Point3D(+size / 2, -size / 2, +size / 2),
      new Point3D(+size / 2, +size / 2, +size / 2),
      new Point3D(-size / 2, +size / 2, +size / 2),
    ];

    this.faces = [
      [0, 1, 2, 3],
      [0, 4, 5, 1],
      [1, 5, 6, 2],
      [3, 2, 6, 7],
      [0, 3, 7, 4],
      [4, 7, 6, 5],
    ];
  }
}

const LengthFocal = 200;
const CanvasWidth = 600;
const CanvasHeight = 600;
const FrameRate = 60;

let cube = new Cube(0, 0, 0, 0, 0, 100);
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

  let vertices = JSON.parse(JSON.stringify(cube.vertices));

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
  let drawVertices = project(vertices, CanvasWidth, CanvasHeight);

  //各面の描画
  for (let index = cube.faces.length - 1; index > -1; --index) {
    let face = cube.faces[index];

    //外積を求める
    let p1 = vertices[face[0]];
    let p2 = vertices[face[1]];
    let p3 = vertices[face[2]];

    let v1 = new Point3D(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
    let v2 = new Point3D(p3.x - p1.x, p3.y - p1.y, p3.z - p1.z);

    //求めた値
    let n = new Point3D(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    );

    //内積で表裏判断
    //表だったら描画
    if (-p1.x * n.x + -p1.y * n.y + -p1.z * n.z <= 0) {
      context.beginPath();
      context.moveTo(drawVertices[face[0]].x, drawVertices[face[0]].y);
      context.lineTo(drawVertices[face[1]].x, drawVertices[face[1]].y);
      context.lineTo(drawVertices[face[2]].x, drawVertices[face[2]].y);
      context.lineTo(drawVertices[face[3]].x, drawVertices[face[3]].y);
      context.closePath();
      context.fill();
      context.stroke();
    }
  }
}, 1000 / FrameRate);

//透視変換を用いて3次元の頂点を2次元の画面に変換する
function project(points3D, width, height) {
  let point2D = new Array(points3D.length);

  for (let i = 0; i < points3D.length; i++) {
    const angle = 60;
    let p = points3D[i];
    let size = (CanvasWidth > CanvasHeight ? CanvasWidth : CanvasHeight) * 0.5;
    let fov = 1 / Math.tan((angle * 0.5 * Math.PI) / 180);
    let x = (p.x / p.z) * fov * size + width * 0.5;
    let y = (p.y / p.z) * fov * size + height * 0.5;

    point2D[i] = new Point2D(x, y);
  }

  return point2D;
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
