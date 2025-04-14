import type { BaseCanvas } from './BaseCanvas';
import { Program } from './Program';

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (e) => reject(e);
        image.src = src;
    });
}

export interface RendererOptions {
}

export class Renderer {
    protected gl: WebGL2RenderingContext | WebGLRenderingContext;
    private animationFrameRequested: boolean = false;
    private initialized: boolean = false;
    private needResize: boolean = true;

    constructor(protected canvas: BaseCanvas, options?: RendererOptions) {
        this.gl = canvas.context;
        canvas.onResize(() => {
            this.needResize = true;
            // delegate resize at next frame to prevent flashing
            this.run();
        });
    }

    public createProgram({vertex, fragment}: {vertex: string, fragment: string}): Program {
        return new Program(this.gl, {vertex, fragment});
    }

    public createBuffer(data: number[]): WebGLBuffer {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        return buffer;
    }

    public render() {
        if(this.needResize) {
            const pixelRatio = window?.devicePixelRatio || 1;
            const bounds = this.canvas.canvas.getBoundingClientRect();
            const width = bounds.width * pixelRatio,
                height = bounds.height * pixelRatio;
            this.canvas.width = width;
            this.canvas.height = height;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    public async init(): Promise<void> {
        this.initialized = true;
    }

    public async run(): Promise<void> {
        if(!this.initialized) {
            await this.init();
        }
        this.requestAnimationFrame();
    }

    private animationFrame() {
        this.render();

        this.requestAnimationFrame();
    }

    protected requestAnimationFrame() {
        if(!this.animationFrameRequested) {
            this.animationFrameRequested = true;
            requestAnimationFrame(() => {
                this.animationFrameRequested = false;

                this.animationFrame();
            });
        }
    }

    /*async loadProgram(): Promise<Program> {
        
    }*/
/*
    async loadTexture({src}: {src: string}) : Promise<Texture>;
    async loadTexture({image}: {image: HTMLImageElement}) : Promise<Texture>;
    async loadTexture({src, image}: {src?: string, image?: HTMLImageElement}): Promise<Texture> {
        if(src) {
            const image = await loadImage(src);
            return this.loadTexture({image});
        } else {
            return new Texture();
        }
    }

    createTexture({src: string}): Promise<Program>;
    createTexture({image: Image, src: string}): Texture | Promise<Texture> {
        if(src) {
            
        }
        if (sync) {
            return new Texture("Synchronous Texture");
        } else {
            return new Promise((resolve) => {
                setTimeout(() => resolve(new Texture("Asynchronous Texture")), 1000);
            });
        }
    }*/
}