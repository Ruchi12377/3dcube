export class Geometry {
  constructor(transform, vertices, uvs, normals, faces, material) {
    this.transform = transform;

    this.vertices = vertices;
    this.uvs = uvs;
    this.normals = normals;
    this.faces = faces;
    this.material = material;
  }

  copiedVertices() {
    const length = this.vertices.length;
    const newVertices = new Array(length);
    for (let i = 0; i < length; i++) {
      newVertices[i] = this.vertices[i].copy();
    }

    return newVertices;
  }

  copiedNormals() {
    const length = this.normals.length;
    const newNormals = new Array(length);
    for (let i = 0; i < length; i++) {
      newNormals[i] = this.normals[i].copy();
    }

    return newNormals;
  }
}
