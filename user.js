import { Camera } from "./src/camera.js";
import { Engine } from "./src/engine.js";
import { Geometry } from "./src/geometry.js";
import { Input } from "./src/input.js";
import { KeyCode } from "./src/keyCode.js";
import { Mathf } from "./src/math.js";
import { ObjFile } from "./src/objFile.js";
import { Texture } from "./src/texture.js";
import { Time } from "./src/time.js";
import { Vector3 } from "./src/vector3.js";

const CameraControlSensitively = 0.1;
const CanvasWidth = 600;
const CanvasHeight = 600;

const speed = 5;

const camera = new Camera(
  60,
  0.3,
  20,
  new Vector3(0, 1, 0),
  new Vector3(0, 0, 0)
);

const engine = new Engine(CanvasWidth, CanvasHeight, camera, update, drawUI);
let fps = 0;
let latestTime = 0;

//描画したい者たち
const mainTexture = new Texture(256, 256);
mainTexture.loadTexture("./images/wood.png");

const maskTexture = new Texture(256, 256);
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

function standard(u, v) {
  return mainTexture.getPixelColor(u, v);
}

let bunny;
const bunnyFile = new ObjFile();
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

  engine.geometries.push(bunny);
});

const arrowFile = new ObjFile();
arrowFile.loadFromObjFile("./arrow.obj", () => {
  const arrow = new Geometry(
    new Vector3(0, 2, 2),
    new Vector3(0, 0, 180),
    new Vector3(0.1, 0.1, 0.1),
    arrowFile.vertices,
    arrowFile.uvs,
    arrowFile.faces,
    standard
  );

  engine.geometries.push(arrow);
});

window.onload = () => {
  engine.start();
  fps = Time.fps;
};

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
  const cameraLimit = camera.viewableAngle / 2;
  camera.rot.x += movementY * CameraControlSensitively;
  camera.rot.x = Mathf.clamp(camera.rot.x, -cameraLimit, cameraLimit);
  camera.rot.y += movementX * CameraControlSensitively;
  camera.rot.y = Mathf.clamp(camera.rot.y, -cameraLimit, cameraLimit);
}

function update() {
  threshold = Math.abs(Math.sin(Time.currentFrame * 0.005));

  if (bunny) {
    bunny.rot.y += 0.5;
  }

  if (Input.getKey(KeyCode.KeyA)) {
    camera.pos.x -= speed * Time.deltaTime;
  }
  if (Input.getKey(KeyCode.KeyD)) {
    camera.pos.x += speed * Time.deltaTime;
  }
  if (Input.getKey(KeyCode.KeyW)) {
    camera.pos.z += speed * Time.deltaTime;
  }
  if (Input.getKey(KeyCode.KeyS)) {
    camera.pos.z -= speed * Time.deltaTime;
  }

  if (camera.pos.y < 1) {
    camera.pos.y = 1;
  }

  //1秒に一回FPS更新
  if (Time.time - latestTime >= 1) {
    fps = Time.fps;
    latestTime = Time.time;
  }
}

function drawUI(context) {
  context.font = "32px sans-serif";
  context.fillStyle = "#555";
  context.fillText(fps.toFixed(0) + " FPS", 5, 30);
  // context.fillText("Camera Pos : " + camera.pos.toString(), 5, 60);
  // context.fillText("Camera Rot : " + camera.rot.toString(), 5, 90);
}
