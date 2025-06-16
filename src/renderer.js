import { Color } from "./color.js";
import { Mathf } from "./math.js";
import { Matrix4x4 } from "./matrix4x4.js";
import { Vector3 } from "./vector3.js";

export class Renderer {
  constructor(canvasWidth, canvasHeight, camera, drawUI, wireFrame) {
    //なんにも描画されてないキャンバスのバッファ
    this.defaultBuf = [];
    //キャンバスに表示するための描画用バッファ
    this.buf = [];
    this.buf8 = [];
    this.data = [];

    this.imageData;
    this.context;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.camera = camera;
    this.drawUI = drawUI;
    this.wireFrame = wireFrame;

    //デプスのコピー元の配列を初期化
    this.depthEmpty = new Uint16Array(this.canvasWidth * this.canvasHeight);
    for (let i = 0; i < this.depthEmpty.length; i++) {
      this.depthEmpty[i] = 65535;
    }

    this.directionalLight = new Vector3(0.3, 0.1, 0.7);
  }

  start() {
    const canvas = document.getElementById("canvas");
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    canvas.addEventListener("click", async () => {
      canvas.requestPointerLock();
    });

    this.context = canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false;

    this.imageData = this.context.getImageData(
      0,
      0,
      this.canvasWidth,
      this.canvasHeight
    );
    this.buf = new ArrayBuffer(this.imageData.data.length);
    this.defaultBuf = structuredClone(this.buf);
  }

  render(geometries) {
    if (this.camera == undefined) return;

    if (this.wireFrame) {
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    this.buf = structuredClone(this.defaultBuf);
    this.buf8 = new Uint8ClampedArray(this.buf);
    this.data = new Uint32Array(this.buf);

    const depthBuffer = structuredClone(this.depthEmpty);

    for (let i = 0; i < geometries.length; i++) {
      const geometry = geometries[i];
      const shader = geometry.material.pixelShader;

      //頂点とノーマルのY軸反転
      const vertices = geometry
        .copiedVertices()
        .map((v) => new Vector3(v.x, -v.y, v.z));
      const normals = geometry
        .copiedNormals()
        .map((n) => new Vector3(n.x, -n.y, n.z));

      const mVertices = this.model(vertices, geometry);
      const vVertices = this.view(
        mVertices,
        this.camera.transform.pos,
        this.camera.transform.rot
      );
      const pVertices = this.project(vVertices);

      const mNormals = this.modelNormal(normals, geometry);

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

        if (this.wireFrame) {
          const pDraw1 = pVertices[face[0].vIndex];
          const pDraw2 = pVertices[face[1].vIndex];
          const pDraw3 = pVertices[face[2].vIndex];

          this.context.beginPath();
          this.context.moveTo(pDraw1.x, pDraw1.y);
          this.context.lineTo(pDraw2.x, pDraw2.y);
          this.context.lineTo(pDraw3.x, pDraw3.y);
          this.context.lineTo(pDraw1.x, pDraw1.y);
          this.context.stroke();

          // this.context.font = "10pt Calibri";
          // this.context.fillStyle = "blue";
          // this.context.fillText(face[0].vIndex, pDraw1.x, pDraw1.y);
          // this.context.fillText(face[1].vIndex, pDraw2.x, pDraw2.y);
          // this.context.fillText(face[2].vIndex, pDraw3.x, pDraw3.y);
        } else {
          //vertices sortedの略
          let vs = [];
          for (let j = 0; j < 3; j++) {
            vs.push([
              pVertices[face[j].vIndex],
              geometry.uvs[face[j].uvIndex],
              mNormals[face[j].nIndex],
            ]);
          }

          //小さい順に並べる
          vs.sort((a, b) => (a[0].y < b[0].y ? -1 : 1));
          const uvs = [vs[0][1].copy(), vs[1][1].copy(), vs[2][1].copy()];
          const pns = [vs[0][2].copy(), vs[1][2].copy(), vs[2][2].copy()];

          //vsのソートされた順番に合わせる
          vs = vs.map((x) => x[0]);

          for (let j = 0; j < 3; j++) {
            uvs[j] = new Vector3(uvs[j].x, uvs[j].y, 1);
            uvs[j].division(vs[j].w);
          }

          for (let y = parseInt(Math.ceil(vs[0].y)); y < vs[2].y; y++) {
            if (y < 0 || y >= this.canvasHeight) continue;

            const p =
              Math.abs(vs[0].y - vs[1].y) < 0.001 || y >= vs[1].y ? 1 : 0;
            const ky1 = Mathf.invLerp(vs[p].y, vs[p + 1].y, y);
            const ky2 = Mathf.invLerp(vs[0].y, vs[2].y, y);
            const x1 = Mathf.lerp(vs[p].x, vs[p + 1].x, ky1);
            const z1 = Mathf.lerp(vs[p].z, vs[p + 1].z, ky1);
            const x2 = Mathf.lerp(vs[0].x, vs[2].x, ky2);
            const z2 = Mathf.lerp(vs[0].z, vs[2].z, ky2);

            const u1 = Mathf.lerp(uvs[p].x, uvs[p + 1].x, ky1);
            const v1 = Mathf.lerp(uvs[p].y, uvs[p + 1].y, ky1);
            const w1 = Mathf.lerp(uvs[p].z, uvs[p + 1].z, ky1);
            const u2 = Mathf.lerp(uvs[0].x, uvs[2].x, ky2);
            const v2 = Mathf.lerp(uvs[0].y, uvs[2].y, ky2);
            const w2 = Mathf.lerp(uvs[0].z, uvs[2].z, ky2);

            const nx1 = Mathf.lerp(pns[p].x, pns[p + 1].x, ky1);
            const ny1 = Mathf.lerp(pns[p].y, pns[p + 1].y, ky1);
            const nz1 = Mathf.lerp(pns[p].z, pns[p + 1].z, ky1);
            const nx2 = Mathf.lerp(pns[0].x, pns[2].x, ky2);
            const ny2 = Mathf.lerp(pns[0].y, pns[2].y, ky2);
            const nz2 = Mathf.lerp(pns[0].z, pns[2].z, ky2);

            for (
              let x = parseInt(Math.floor(Math.min(x1, x2)));
              x < Math.ceil(Math.max(x1, x2));
              x++
            ) {
              //x2 == x1のときは0で割ることになるので
              const kx = Mathf.invLerp(x1, x2, x);
              const z = Mathf.lerp(z1, z2, kx);
              const zUInt16 = parseInt(Mathf.clamp(z * 65535, 0, 65535));
              if (z < 0 || z > 1) continue;

              const index = y * this.canvasWidth + x;

              //描画しようとしているピクセルが、奥にある場合
              if (
                x < 0 ||
                x >= this.canvasWidth ||
                zUInt16 > depthBuffer[index]
              ) {
                continue;
              }

              const w = Mathf.lerp(w1, w2, kx);
              const u = Mathf.lerp(u1, u2, kx) / w;
              const v = 1 - Mathf.lerp(v1, v2, kx) / w;
              const color = shader(u, v);

              if (color instanceof Color == false) {
                this.data[index] = Color.Alpha;
                continue;
              }

              //手前にあるのでデプスを更新
              depthBuffer[index] = zUInt16;

              //lightに関しての定数kなのでkl
              const nx = Mathf.lerp(nx1, nx2, kx);
              const ny = Mathf.lerp(ny1, ny2, kx);
              const nz = Mathf.lerp(nz1, nz2, kx);
              const kl = this.lightDirectness(new Vector3(nx, ny, nz));
              this.data[index] = color.shadedColor(kl).toColor32();
            }
          }
        }
      }
    }

    if (this.wireFrame == false) {
      this.imageData.data.set(this.buf8);
      this.context.putImageData(this.imageData, 0, 0);
    }

    //UserのUI描画
    if (this.drawUI) {
      this.context.save();
      this.drawUI(this.context);
      this.context.restore();
    }
  }

  model(vertices, geometry) {
    const mat = Matrix4x4.identity;
    const pos = geometry.transform.pos;
    const posYInv = new Vector3(pos.x, -pos.y, pos.z);
    mat.setTRS(posYInv, geometry.transform.rot, geometry.transform.scale);

    //拡大縮小、頂点の回転、平行移動
    const modeledVertices = vertices.map((v) => {
      const m = mat.multiplyVector(v.toVector4(1));
      return m.toVector3();
    });

    return modeledVertices;
  }

  modelNormal(normals, geometry) {
    const mat = Matrix4x4.rotation(geometry.transform.rot);
    //ノーマル
    //頂点の回転
    const modeledNormals = normals.map((n) => {
      const m = mat.multiplyVector(n.toVector4(1));
      return m.toVector3();
    });

    return modeledNormals;
  }

  view(vertices, camPos, camRot) {
    let mat = Matrix4x4.identity;
    const posXYInv = new Vector3(-camPos.x, -camPos.y, camPos.z);
    const rotYInv = new Vector3(camRot.x, -camRot.y, camRot.z);
    mat.setTRS(posXYInv, rotYInv, Vector3.one);
    mat.inverse();

    const viewedVertices = vertices.map((v) => {
      const m = mat.multiplyVector(v.toVector4(1));

      return m.toVector3();
    });

    return viewedVertices;
  }

  //透視投影変換を用いて3次元の頂点を2次元の画面に変換する
  project(vertices) {
    const projectMat = Matrix4x4.projection(
      this.camera.viewableAngle,
      this.canvasHeight,
      this.canvasWidth,
      this.camera.farClip,
      this.camera.nearClip
    );

    const projectedVertices = vertices.map((p) => {
      const p4 = projectMat.multiplyVector(p.toVector4(1));

      //ここはビューポート変換
      //X, Y軸それぞれ反転しているので反転する必要がある
      //しかし、JavaScriptのCanvasのYがすでに反転しているため、ここでは反転しない
      //w除算で-1 ~ 1にする
      //x, yは+1することで0 ~ 2にして、
      //0.5をかけて0 ~ 1にして縦横の大きさを掛けることで
      //0 ~ width, 0 ~ heightにしている。
      const rw = 1 / p4.w;
      p4.x = (-p4.x * rw + 1) * 0.5 * this.canvasWidth;
      p4.y = (p4.y * rw + 1) * 0.5 * this.canvasHeight;
      p4.z = p4.z * rw;
      return p4;
    });

    return projectedVertices;
  }

  lightDirectness(normal) {
    const n = normal.copy();
    n.normalize();
    n.multiply(-1);
    const l = this.directionalLight.copy();
    l.normalize();

    //光が三角形に真っすぐに当たっている割合
    //光が真横、裏から当たってる場合は-1 ~ 0の値になるので
    //clampで0になる
    return Mathf.clamp(l.dot(n), 0, 1);
  }
}
