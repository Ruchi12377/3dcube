import { Vector2 } from "./vector2.js";
import { Vector3 } from "./vector3.js";
import { Vertex } from "./vertex.js";

export class ObjFile {
  constructor() {
    this.vertices = [];
    this.uvs = [];
    this.normals = [];
    this.faces = [];
  }

  loadFromObjFile(src, loaded) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", src, true);

    xhr.onload = () => {
      if (xhr.status === 200) {
        //objファイルを行ごとに読み込む
        const lines = xhr.response.split("\n");

        for (let i = 0; i < lines.length; i++) {
          const data = lines[i].split(" ");
          if (data[0] == "v") {
            this.vertices.push(new Vector3(data[1], data[2], data[3]));
          } else if (data[0] == "vt") {
            this.uvs.push(new Vector2(data[1], data[2]));
          } else if (data[0] == "vn") {
            this.normals.push(new Vector3(data[1], data[2], data[3]));
          } else if (data[0] == "f") {
            const face = [];
            for (let j = 1; j < data.length; j++) {
              const values = data[j].split("/");
              if (values.length == 1) {
                //頂点インデックス
              } else if (values.length == 2) {
                //頂点インデックス、テクスチャインデックス
              } else if (values.length == 3) {
                if (values[1] != "") {
                  //頂点インデックス、テクスチャインデックス、頂点法線ベクトル番号
                  face.push(
                    new Vertex(values[0] - 1, values[1] - 1, values[2] - 1)
                  );
                } else {
                  //頂点インデックス、、頂点法線ベクトル番号
                }
              }
            }

            this.faces.push(face);
          } else {
            // console.log(lines[i]);
          }
        }

        this.checkFaces();

        if (loaded) {
          loaded();
        }
      }
    };

    xhr.send();
  }

  checkFaces() {
    for (let i = 0; i < this.faces.length; i++) {
      const face = this.faces[i];
      const vCount = face.length;

      //三角形なら処理しなくて良い
      if (vCount == 3) continue;

      this.faces.splice(i, 1);

      //それぞれの要素にvIndexが入ってるので、それを取り出して配列にする
      const newFaces = this.divisionFace(face);
      newFaces.forEach((x) => {
        this.faces.push(x);
      });
    }
  }

  //todo 全ての点が含まれていない三角形
  divisionFace(face) {
    const leftVertices = structuredClone(face);
    const faces = [];

    let previous = 0;
    //一番遠い点の手前を指定しておくことで、moveToNextをしたときにfindFarの値になる
    let current = this.findFar(leftVertices) - 1;
    let next = 0;
    //それぞれの値を設定する
    [previous, current, next] = this.moveToNext(
      previous,
      current,
      next,
      leftVertices.length
    );

    while (leftVertices.length > 3) {
      const previousVIndex = leftVertices[previous].vIndex;
      const currentVIndex = leftVertices[current].vIndex;
      const nextVIndex = leftVertices[next].vIndex;

      const previousVertex = this.vertices[previousVIndex];
      const currentVertex = this.vertices[currentVIndex];
      const nextVertex = this.vertices[nextVIndex];

      const a = currentVertex.copy();
      a.minus(previousVertex);
      const b = nextVertex.copy();
      b.minus(currentVertex);

      const normal = a.cross(b);
      const d = currentVertex.dot(normal);

      let inside = false;

      for (let i = 0; i < leftVertices.length; i++) {
        const vIndex = leftVertices[i].vIndex;
        //三角形の点は絶対含まれているので調査しない
        if (
          vIndex == previousVIndex ||
          vIndex == currentVIndex ||
          vIndex == nextVIndex
        )
          continue;

        const point = this.vertices[vIndex];
        inside =
          inside ||
          this.isPointInsideTriangle(
            previousVertex,
            currentVertex,
            nextVertex,
            point
          );
        if (inside) {
          break;
        }
      }

      //裏向いてるので、三角形を作れない
      if (d < 0 || inside) {
        [previous, current, next] = this.moveToNext(
          previous,
          current,
          next,
          leftVertices.length
        );
        continue;
      }

      faces.push([
        leftVertices[previous],
        leftVertices[current],
        leftVertices[next],
      ]);

      leftVertices.splice(current, 1);
      [previous, current, next] = this.moveToNext(
        previous,
        current,
        next,
        leftVertices.length
      );
    }

    faces.push([
      leftVertices[previous],
      leftVertices[current],
      leftVertices[next],
    ]);

    return faces;
  }

  moveToNext(previous, current, next, leftVertexCount) {
    current = (current + 1) % leftVertexCount;
    next = (current + 1) % leftVertexCount;
    previous = current - 1 >= 0 ? current - 1 : leftVertexCount - 1;

    return [previous, current, next];
  }

  findFar(vertices) {
    let farIndex = vertices[0].vIndex;
    const zero = new Vector3(0, 0, 0);

    for (let i = 0; i < vertices.length; i++) {
      const vIndex = vertices[i].vIndex;
      const point = this.vertices[vIndex];
      const farPoint = this.vertices[farIndex];
      const pDistance = point.distance(zero);
      const fDistance = farPoint.distance(zero);

      if (pDistance > fDistance) {
        farIndex = i;
        continue;
      }
    }

    return farIndex;
  }

  isPointInsideTriangle(p0, p1, p2, p) {
    const v0v1 = p1.copy();
    v0v1.minus(p0);
    const v1v2 = p2.copy();
    v1v2.minus(p1);
    const v2v0 = p0.copy();
    v2v0.minus(p2);

    const v0v2 = p2.copy();
    v0v2.minus(p0);

    const n = v0v1.cross(v0v2);

    const v0p = p.copy();
    v0p.minus(p0);
    const v1p = p.copy();
    v1p.minus(p1);
    const v2p = p.copy();
    v2p.minus(p2);

    const c0 = v0v1.cross(v0p);
    const c1 = v1v2.cross(v1p);
    const c2 = v2v0.cross(v2p);

    if (c0.dot(n) > 0 && c1.dot(n) > 0 && c2.dot(n) > 0) return true;

    return false;
  }
}
