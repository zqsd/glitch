import { isDevelopment } from "./development" with { type: 'macro' };

function getTextShaderType(type: number): string {
    if(type === WebGLRenderingContext.FRAGMENT_SHADER) return 'Fragment';
    if(type === WebGLRenderingContext.VERTEX_SHADER) return 'Vertex';
    throw new Error('Unknown');
}

function shaderLines(source: string): string[] {
    const lines = source.split(/[\r\n]/);
    const res: string[] = [];

    for(let i = 0, l = 1; i < lines.length; i++ , l++) {
        const lineNumber = l.toString();
        res.push(`${lineNumber} ${lines[i]}`);
    }

    return res;
}

function logShaderErrors(source: string, type: number, info: string) {
    const lines = shaderLines(source);

    for(const error of info.trim().split(/[\r\n]/)) {
        const match = error.match(/^ERROR: 0:(\d+): (.*)/);
        if(match) {
            const lineNumber = match[1] as number;
            const context = lines.slice(lineNumber - 2, lineNumber + 1).join('\n');
            console.error(getTextShaderType(type).toUpperCase() + ' SHADER ' + error.replace('ERROR: 0:', 'ERROR: L') + '\r\n\r\n' + context);
        } else {
            console.warn(error);
        }
    }
}

export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if(!shader) throw new Error('Failed to create shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if(isDevelopment()) {
        const info = gl.getShaderInfoLog(shader)!;
        if(info && info.trim() !== '') {
            logShaderErrors(source, type, info);
        }
    }

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error(`${getTextShaderType(type)} shader compilation error`);
    }
    return shader;
}

export function linkProgram(gl: WebGLRenderingContext, shaders: WebGLShader[]): WebGLProgram {
    const program = gl.createProgram();
    for(const shader of shaders) {
        gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        if(isDevelopment()) {
            const info = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`Failed to link program: ${info}`);
        } else {
            gl.deleteProgram(program);
            throw new Error(`Failed to link program`);
        }
    }
    return program;
}

export class Program {
    constructor(public program: WebGLProgram) {

    }
}
