import { Canvas, type CanvasOptions } from './Canvas';
import type { Program } from './Program';
import vertexDefault from './default.vert';
import fragmentDefault from './default.frag';

export interface ShaderCanvasOptions extends CanvasOptions {
    vertex?: string;
    fragment?: string;
}

export class ShaderCanvas extends Canvas {
    public program: Program;
    private buffer: WebGLBuffer;
    private timeLast: number;
    public time: number = 0;
    private onRenderCallback?: (shaderCanvas: ShaderCanvas) => void;

    constructor(options?: ShaderCanvasOptions);
    constructor(canvas: HTMLCanvasElement, options?: ShaderCanvasOptions);
    constructor(element: HTMLElement, options?: ShaderCanvasOptions);
    constructor(selector: string, options?: ShaderCanvasOptions);
    constructor(element?: HTMLCanvasElement | HTMLElement | string | ShaderCanvasOptions, options?: ShaderCanvasOptions) {
        super(element, options);

        if(!options) {
            options = element as ShaderCanvasOptions;
        }

        this.program = this.createProgram({
            vertex: options?.vertex || vertexDefault,
            fragment: options?.fragment || fragmentDefault
        });
        this.gl.useProgram(this.program.program);

        this.buffer = this.createBuffer([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]);

        const positionLoc = this.gl.getAttribLocation(this.program.program, "a_position");
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.vertexAttribPointer(positionLoc, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionLoc);

        this.init();
        this.render();

        /*
        this.gl.finish();
        const pixels = new Uint8Array(4);
        this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
        */

        // delayed appear because of frame blit
        requestAnimationFrame(() => {
            this.canvas.classList.remove('canvas-loading');
        });
    }

    async init() {
        this.timeLast = performance.now();
        //await super.init();
        //await this.fence();
    }

    render() {
        const now = performance.now();
        this.time += (now - this.timeLast) * 0.001;
        this.timeLast = now;

        super.render();

        if(this.onRenderCallback) {
            this.onRenderCallback(this);
        }

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4); 
    }

    onRender(f: (shaderCanvas: ShaderCanvas) => void): ShaderCanvas {
        this.onRenderCallback = f;
        return this;
    }
}