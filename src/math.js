export class Mathf {
    static toDeg(x) {
        return (x * Math.PI) / 180;
    }

    static clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }
}