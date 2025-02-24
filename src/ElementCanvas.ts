import { BaseCanvas } from "./BaseCanvas";

export class ElementCanvas extends BaseCanvas {
    protected parent: HTMLElement;

    constructor(selector: string);
    constructor(element: HTMLElement);
    constructor(parent: HTMLElement | string) {
        if(typeof parent === 'string') {
            parent = document.querySelector(parent) as HTMLElement;
        }
        if(!(parent instanceof HTMLElement)) {
            throw new Error('invalid parent');
        }

        if(!(parent.style.position === '' || parent.style.position === 'relative')) {
            throw new Error('parent element must have position: relative');
        }

        const canvas = document.createElement('canvas');
        canvas.classList.add('loading-canvas');
        canvas.style.position = 'absolute';
        canvas.style.left = '0px';
        canvas.style.top = '0px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        parent.style.position = 'relative';
        parent.appendChild(canvas);
        super(canvas);
        this.parent = parent;

        new ResizeObserver(() => {
            const pixelRatio = window?.devicePixelRatio || 1;
            const bounds = this.canvas.getBoundingClientRect();
            const width = bounds.width * pixelRatio,
                  height = bounds.height * pixelRatio;
            this.fireResize(width, height);
        }).observe(canvas);
    }
}