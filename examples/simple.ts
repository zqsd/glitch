import type { BaseCanvas } from '../src/BaseCanvas';
import { Canvas } from '../src/Canvas';
import { ElementCanvas } from '../src/ElementCanvas';
import { FullscreenCanvas } from '../src/FullscreenCanvas';
import { Renderer } from '../src/Renderer';
import { ShaderRenderer, type ShaderRendererOptions } from '../src/ShaderRenderer';
import fragment from './waves.frag';

class DemoRenderer extends ShaderRenderer {
    constructor(canvas: BaseCanvas, options?: ShaderRendererOptions) {
        super(canvas, Object.assign(options || {}, {fragment}));
    }

    async init(): Promise<void> {
        super.init();
    }

    render() {
        this.program.setUniformFloat('u_time', this.time);
        this.program.setUniformFloat('u_size', this.canvas.width, this.canvas.height);
        super.render();
    }
};

new DemoRenderer(new Canvas('#canvas')).run();
new DemoRenderer(new FullscreenCanvas()).run();
new DemoRenderer(new ElementCanvas('#block')).run();

/*
new (class extends Renderer {
    async init(): Promise<void> {
       ...
    }
    render() {
    }
    sayHello() { console.log("Hello!"); }
})().run();
*/