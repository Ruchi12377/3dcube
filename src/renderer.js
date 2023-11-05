import { Color } from "./color.js";
import { Mathf } from "./math.js";
import { Matrix4x4 } from "./matrix4x4.js";
import { Vector3 } from "./vector3.js";
import { Vector4 } from "./vector4.js";

export class Renderer {
  constructor(canvasWidth, canvasHeight, camera, drawUI) {
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

    //デプスのコピー元の配列を初期化
    this.depthEmpty = new Uint8ClampedArray(
      this.canvasWidth * this.canvasHeight
    );
    for (let i = 0; i < this.depthEmpty.length; i++) {
      this.depthEmpty[i] = 255;
    }

    this.directionalLight = new Vector3(0, 0, 1);
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

    this.buf = structuredClone(this.defaultBuf);
    this.buf8 = new Uint8ClampedArray(this.buf);
    this.data = new Uint32Array(this.buf);

    const depthBuffer = structuredClone(this.depthEmpty);

    for (let i = 0; i < geometries.length; i++) {
      let geometry = geometries[i];
      const shader = geometry.pixelShader;

      //頂点とノーマルのY軸反転
      const vertices = geometry.copiedVertices();
      for (let j = 0; j < vertices.length; j++) {
        const v = vertices[j];
        vertices[j] = new Vector3(v.x, -v.y, v.z);
      }

      const normals = geometry.copiedNormals();
      for (let j = 0; j < normals.length; j++) {
        const n = normals[j];
        normals[j] = new Vector3(n.x, -n.y, n.z);
      }

      const mVertices = this.model(vertices, geometry);
      const vVertices = this.view(mVertices, this.camera.pos, this.camera.rot);
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

        //vertices sortedの略
        let vs = [
          [
            pVertices[face[0].vIndex],
            geometry.uvs[face[0].uvIndex],
            mNormals[face[0].nIndex],
          ],
          [
            pVertices[face[1].vIndex],
            geometry.uvs[face[1].uvIndex],
            mNormals[face[1].nIndex],
          ],
          [
            pVertices[face[2].vIndex],
            geometry.uvs[face[2].uvIndex],
            mNormals[face[2].nIndex],
          ],
        ];
        //小さい順に並べる
        vs.sort((a, b) => (a[0].y < b[0].y ? -1 : 1));
        const uvs = [vs[0][1].copy(), vs[1][1].copy(), vs[2][1].copy()];
        const pns = [vs[0][2].copy(), vs[1][2].copy(), vs[2][2].copy()];

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
          if (y < 0 || y >= this.canvasHeight) continue;

          const p = Math.abs(vs[0].y - vs[1].y) < 0.1 || y >= vs[1].y ? 1 : 0;
          let x1 = Mathf.clamp(
            vs[p].x,
            vs[p + 1].x,
            vs[p].x +
              ((y - vs[p].y) * (vs[p + 1].x - vs[p].x)) /
                (vs[p + 1].y - vs[p].y)
          );
          const z1 =
            vs[p].z +
            ((y - vs[p].y) * (vs[p + 1].z - vs[p].z)) / (vs[p + 1].y - vs[p].y);

          let x2 = Mathf.clamp(
            vs[0].x,
            vs[2].x,
            vs[0].x +
              ((y - vs[0].y) * (vs[2].x - vs[0].x)) / (vs[2].y - vs[0].y)
          );
          const z2 =
            vs[0].z +
            ((y - vs[0].y) * (vs[2].z - vs[0].z)) / (vs[2].y - vs[0].y);

          const u1 =
            uvs[p].x +
            ((y - vs[p].y) * (uvs[p + 1].x - uvs[p].x)) /
              (vs[p + 1].y - vs[p].y);
          const v1 =
            uvs[p].y +
            ((y - vs[p].y) * (uvs[p + 1].y - uvs[p].y)) /
              (vs[p + 1].y - vs[p].y);
          const w1 =
            uvs[p].z +
            ((y - vs[p].y) * (uvs[p + 1].z - uvs[p].z)) /
              (vs[p + 1].y - vs[p].y);

          const u2 =
            uvs[0].x +
            ((y - vs[0].y) * (uvs[2].x - uvs[0].x)) / (vs[2].y - vs[0].y);
          const v2 =
            uvs[0].y +
            ((y - vs[0].y) * (uvs[2].y - uvs[0].y)) / (vs[2].y - vs[0].y);
          const w2 =
            uvs[0].z +
            ((y - vs[0].y) * (uvs[2].z - uvs[0].z)) / (vs[2].y - vs[0].y);

          const nx1 =
            pns[p].x +
            ((y - vs[p].y) * (pns[p + 1].x - pns[p].x)) /
              (vs[p + 1].y - vs[p].y);
          const ny1 =
            pns[p].y +
            ((y - vs[p].y) * (pns[p + 1].y - pns[p].y)) /
              (vs[p + 1].y - vs[p].y);
          const nz1 =
            pns[p].z +
            ((y - vs[p].y) * (pns[p + 1].z - pns[p].z)) /
              (vs[p + 1].y - vs[p].y);
          const nx2 =
            pns[0].x +
            ((y - vs[0].y) * (pns[2].x - pns[0].x)) / (vs[2].y - vs[0].y);
          const ny2 =
            pns[0].y +
            ((y - vs[0].y) * (pns[2].y - pns[0].y)) / (vs[2].y - vs[0].y);
          const nz2 =
            pns[0].z +
            ((y - vs[0].y) * (pns[2].z - pns[0].z)) / (vs[2].y - vs[0].y);

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
              Mathf.clamp(
                z / (this.camera.farClip - this.camera.nearClip),
                0,
                1
              ) * 255
            );
            if (z < this.camera.nearClip || z > this.camera.farClip) continue;

            //描画しようとしているピクセルが、奥にある場合
            if (
              x < 0 ||
              x >= this.canvasWidth ||
              zUInt8 > depthBuffer[y * this.canvasWidth + x]
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
            const index = y * this.canvasWidth + x;

            if (color instanceof Color == false) {
              this.data[index] = Color.Alpha;
              continue;
            }

            //手前にあるのでデプスを更新
            depthBuffer[index] = zUInt8;

            //lightに関しての定数kなのでkl
            const nx =
              x2 == x1 ? nx1 : nx1 + ((x - x1) * (nx2 - nx1)) / (x2 - x1);
            const ny =
              x2 == x1 ? ny1 : ny1 + ((x - x1) * (ny2 - ny1)) / (x2 - x1);
            const nz =
              x2 == x1 ? nz1 : nz1 + ((x - x1) * (nz2 - nz1)) / (x2 - x1);
            // const kl = this.lightDirectness(new Vector3(nx, ny, nz));
            const kl = this.lightDirectness(normal);
            this.data[index] = color.shadedColor(kl).toColor32();
          }
        }
      }
    }

    this.imageData.data.set(this.buf8);
    this.context.putImageData(this.imageData, 0, 0);

    //UserのUI描画
    if (this.drawUI) {
      this.context.save();
      this.drawUI(this.context);
      this.context.restore();
    }
  }

  model(vertices, geometry) {
    const mat = Matrix4x4.identity;
    const pos = geometry.pos;
    const posYInv = new Vector3(pos.x, -pos.y, pos.z);
    mat.setTRS(posYInv, geometry.rot, geometry.scale);
    const modeledVertices = new Array(vertices.length);

    //拡大縮小、頂点の回転、平行移動
    for (let i = 0; i < vertices.length; i++) {
      const v = vertices[i];
      const m = mat.multiplyVector(new Vector4(v.x, v.y, v.z, 1));

      modeledVertices[i] = new Vector3(m.x, m.y, m.z);
    }

    return modeledVertices;
  }

  modelNormal(normals, geometry) {
    const mat = Matrix4x4.identity;
    mat.rotation(geometry.rot);
    const modeledNormals = new Array(normals.length);

    //ノーマル
    //頂点の回転
    for (let i = 0; i < normals.length; i++) {
      const n = normals[i];
      const m = mat.multiplyVector(new Vector4(n.x, n.y, n.z, 1));

      modeledNormals[i] = new Vector3(m.x, m.y, m.z);
    }

    return modeledNormals;
  }

  view(vertices, camPos, camRot) {
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
  project(vertices) {
    const projectedVertices = new Array(vertices.length);
    //カメラの視野
    const f = 1 / Math.tan(Mathf.toRad(this.camera.viewableAngle / 2));
    const a =
      (this.canvasWidth > this.canvasHeight
        ? this.canvasWidth
        : this.canvasHeight) / 2;
    const q =
      this.camera.farClip / (this.camera.farClip - this.camera.nearClip);

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
        this.canvasWidth / 2,
        0,
        0,
        a * f,
        this.canvasHeight / 2,
        0,
        0,
        0,
        q,
        -this.camera.nearClip * q,
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

  lightDirectness(normal) {
    let n = normal.copy();
    n.normalize();

    //法線ベクトルを視点(Z方向)から見て正の方向になるようにする
    if (n.z < 0) {
      n.multiply(-1);
    }

    //光が三角形に真っすぐに当たっている割合
    return Mathf.clamp(this.directionalLight.dot(n), 0, 1);
  }
}
