import { Canvas } from "./Canvas";

export interface CanvasOptions {
}

export class FullscreenCanvas extends Canvas {
    constructor(options?: CanvasOptions) {
        const canvas = document.createElement('canvas');
        canvas.classList.add('canvas-loading');
        canvas.style.position = 'fixed';
        canvas.style.left = '0px';
        canvas.style.top = '0px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        document.body.appendChild(canvas);
        super(canvas);
    }
}