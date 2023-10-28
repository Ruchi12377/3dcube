import { Mathf } from "./math.js";

export class Color {
    constructor(red, green, blue, alpha) {
        this.red = Mathf.clamp(red, 0, 255);
        this.green = Mathf.clamp(green, 0, 255);
        this.blue = Mathf.clamp(blue, 0, 255);
        this.alpha = Mathf.clamp(alpha, 0, 255);
    }

    toColorCode() {
        return (
            "#" +
            ((1 << 24) | (this.red << 16) | (this.green << 8) | this.blue)
                .toString(16)
                .slice(1)
        );
    }

    toColor32() {
        return (
            (this.alpha << 24) | (this.blue << 16) | (this.green << 8) | this.red
        );
    }

    toLinear() {
        let lr = this.red / 255;
        let lg = this.green / 255;
        let lb = this.blue / 255;

        return new Vector3(lr, lg, lb);
    }
}