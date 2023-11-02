export class ObjFile {
  constructor() {}

  loadFromObjFile(src, loaded) {
    const vertices = new Array();
    const triangles = new Array();

    const xhr = new XMLHttpRequest();
    xhr.open("GET", src, true);

    xhr.onload = () => {
      if (xhr.status === 200) {
        //objファイルを行ごとに読み込む
        const data = xhr.response.split("\n");

        for (let i = 0; i < data.length; i++) {}

        if (loaded) {
          loaded();
        }
      }
    };

    xhr.send();
  }
}
