import { BaseCanvas } from "./BaseCanvas";
import type { Renderer } from "./Renderer";

export class Canvas extends BaseCanvas {
    protected renderer?: Renderer;

    constructor(selector: string);
    constructor(canvas: HTMLCanvasElement);
    constructor(canvas: HTMLCanvasElement | string) {
        if(typeof canvas === 'string') {
            canvas = document.querySelector(canvas) as HTMLCanvasElement;
        }
        if(!(canvas instanceof HTMLCanvasElement)) {
            throw new Error('invalid canvas');
        }
        new ResizeObserver(() => {
            const pixelRatio = window?.devicePixelRatio || 1;
            const bounds = this.canvas.getBoundingClientRect();
            const width = bounds.width * pixelRatio,
                  height = bounds.height * pixelRatio;
            this.fireResize(width, height);
        }).observe(canvas);
        super(canvas);
    }
}