import { Vector2 } from "./vector2.js";
import { Vector3 } from "./vector3.js";
import { Vertex } from "./vertex.js";

export class ObjFile {
  constructor() {
    this.vertices = [];
    this.uvs = [];
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
                  face.push(new Vertex(values[0] - 1, values[1] - 1));
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

        if (loaded) {
          loaded();
        }
      }
    };

    xhr.send();
  }
}
