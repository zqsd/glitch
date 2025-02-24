import type { Renderer } from "./Renderer";

type ResizeCallback = (width: number, height: number) => void;

export class BaseCanvas {
    protected renderer?: Renderer;
    protected gl: WebGL2RenderingContext | WebGLRenderingContext;
    protected onResizeCallbacks: ResizeCallback[] = [];

    get context() { return this.gl; }
    get width() { return this.canvas.width; }
    get height() { return this.canvas.height; }
    get element() { return this.canvas; }
    set width(pixels: number) { this.canvas.width = pixels; }
    set height(pixels: number) { this.canvas.height = pixels; }

    constructor(public canvas: HTMLCanvasElement) {
        // get webgl context
        this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext;
        if(!this.gl) {
            this.gl = this.canvas.getContext('webgl') as WebGLRenderingContext;
            if(!this.gl) {
                throw new Error('WebGL context could not be initialized. Your browser may not support WebGL.');
            }
        }

        // delayed appear because of frame blit
        requestAnimationFrame(() => {
            this.canvas.classList.remove('canvas-loading');
        });
    }

    public onResize(callback: ResizeCallback) {
        this.onResizeCallbacks.push(callback);
    }

    protected fireResize(width: number, height: number) {
        for(const callback of this.onResizeCallbacks) {
            callback(width, height);
        }
    }
}