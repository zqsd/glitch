import { Renderer, type CanvasOptions } from './Renderer';
import { Program } from './Program';
import vertexDefault from './default.vert';
import fragmentDefault from './default.frag';
import type { BaseCanvas } from './BaseCanvas';

export interface ShaderRendererOptions extends CanvasOptions {
    vertex?: string;
    fragment?: string;
}

export class ShaderRenderer extends Renderer {
    public program: Program;
    private buffer: WebGLBuffer;
    private timeLast: number;
    public time: number = 0;

    constructor(canvas: BaseCanvas, options?: ShaderRendererOptions) {
        super(canvas, options);

        this.program = this.createProgram({
            vertex: options?.vertex || vertexDefault,
            fragment: options?.fragment || fragmentDefault
        });
        /*
        this.gl.finish();
        const pixels = new Uint8Array(4);
        this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
        */
    }

    async init() {
        super.init();

        this.timeLast = performance.now();
        this.program.build();

        this.gl.useProgram(this.program.id);

        this.buffer = this.createBuffer([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]);

        const positionLoc = this.gl.getAttribLocation(this.program.id, "a_position");
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.vertexAttribPointer(positionLoc, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionLoc);
    }

    render() {
        super.render();

        const now = performance.now();
        this.time += (now - this.timeLast) * 0.001;
        this.timeLast = now;

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
}