import { createShader, linkProgram, Program } from './Program';
import { Texture } from './Texture';

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (e) => reject(e);
        image.src = src;
    });
}

export interface CanvasOptions {
}

export class Canvas {
    protected parent: HTMLElement;
    protected canvas: HTMLCanvasElement;
    protected gl: WebGL2RenderingContext | WebGLRenderingContext;
    protected pixelRatio!: number;
    protected width!: number;
    protected height!: number;

    constructor(options?: CanvasOptions);
    constructor(canvas: HTMLCanvasElement, options?: CanvasOptions);
    constructor(element: HTMLElement, options?: CanvasOptions);
    constructor(selector: string, options?: CanvasOptions);
    constructor(element?: HTMLCanvasElement | HTMLElement | string | CanvasOptions, options?: CanvasOptions) {
        // handle selector
        if(typeof element === 'string') {
            element = document.querySelector(element) as HTMLElement;
            if(!(element instanceof HTMLElement)) {
                throw new Error('invalid selector');
            }
        }

        // element canvas
        if(element instanceof HTMLCanvasElement) {
            this.parent = this.canvas = element;
        }
        // parent element
        else if(element instanceof HTMLElement) {
            this.parent = element || document.body;
            if(this.parent.style.position !== '' && this.parent.style.position !== 'relative') {
                throw new Error('parent element must be relative');
            }
            this.parent.style.position = 'relative';
            this.canvas = document.createElement('canvas');
            this.canvas.classList.add('canvas-loading');
            this.canvas.style.position = 'absolute';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.parent.appendChild(this.canvas);
        }
        // fullscreen
        else {
            this.parent = document.body;
            this.canvas = document.createElement('canvas');
            this.canvas.classList.add('canvas-loading');
            this.canvas.style.position = 'fixed';
            this.canvas.style.left = '0px';
            this.canvas.style.top = '0px';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.zIndex = '-1';
            document.body.appendChild(this.canvas);
            options = element;
        }

        // auto resize
        new ResizeObserver(() => {
            this.run();
        }).observe(this.parent);

        // get webgl context
        this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext;
        if(!this.gl) {
            this.gl = this.canvas.getContext('webgl') as WebGLRenderingContext;
            if(!this.gl) {
                throw new Error('WebGL context could not be initialized. Your browser may not support WebGL.');
            }
        }

        this.updateSize(this.canvas.width, this.canvas.height);
    }

    private updateSize(width: number, height: number) {
        this.pixelRatio = window?.devicePixelRatio || 1;

        if(this.parent === document.body) {
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
        } else if(this.canvas !== this.parent) {
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';
        }
        this.canvas.width = this.width = width * this.pixelRatio;
        this.canvas.height = this.height = height * this.pixelRatio;
        this.gl.viewport(0, 0, this.width, this.height);
    }

    createProgram({vertex, fragment}: {vertex: string, fragment: string}): Program {
        const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, vertex);
        const fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragment);
        const program = linkProgram(this.gl, [vertexShader, fragmentShader]);
        return new Program(program);
    }

    createBuffer(data: number[]): WebGLBuffer {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        return buffer;
    }

    render() {
        if(this.parent.clientWidth !== this.canvas.width || this.parent.clientHeight !== this.canvas.height) {
            this.updateSize(this.parent.clientWidth, this.parent.clientHeight);
        }

        //this.gl.clearColor(0, 0, 0, 1);
        //this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    run() {
        // TODO: render now, or use requestAnimationFrame
        this.render();

        
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