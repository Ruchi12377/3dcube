export class Plane {
  constructor(pos, normal) {
    this.pos = pos;
    this.normal = normal;
    this.normal.normalize();
  }

  intersect(startPos, endPos) {
    const dot = -this.normal.dot(this.pos);
    const ad = startPos.dot(this.normal);
    const bd = endPos.dot(this.normal);
    const t = (-dot - ad) / (bd - ad);
    const lineStartToEnd = endPos;
    lineStartToEnd.minus(startPos);
    const lineToIntersect = lineStartToEnd;
    lineToIntersect.multiply(t);

    const intersectPos = startPos;
    intersectPos.add(lineToIntersect);

    return intersectPos;
  }
}
