import { Canvas, type CanvasOptions } from './Canvas';
import type { Program } from './Program';
import vertexDefault from './default.vert';
import fragmentDefault from './default.frag';

export interface ShaderCanvasOptions extends CanvasOptions {
    vertex?: string;
    fragment?: string;
}

export class ShaderCanvas extends Canvas {
    program: Program;
    buffer: WebGLBuffer;

    constructor(options?: ShaderCanvasOptions);
    constructor(canvas: HTMLCanvasElement, options?: ShaderCanvasOptions);
    constructor(element: HTMLElement, options?: ShaderCanvasOptions);
    constructor(selector: string, options?: ShaderCanvasOptions);
    constructor(element?: HTMLCanvasElement | HTMLElement | string | ShaderCanvasOptions, options?: ShaderCanvasOptions) {
        super(element, options);

        this.program = this.createProgram({
            vertex: options?.vertex || vertexDefault,
            fragment: options?.fragment || fragmentDefault
        });
        this.buffer = this.createBuffer([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]);

        const positionLoc = this.gl.getAttribLocation(this.program.program, "a_position");
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.vertexAttribPointer(positionLoc, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionLoc);

        this.init();
        this.run();

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
        //await super.init();
        //await this.fence();
    }

    render() {
        super.render();

        this.gl.useProgram(this.program.program);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4); 
    }
}