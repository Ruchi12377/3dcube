export class Geometry {
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