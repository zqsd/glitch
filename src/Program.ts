import { isDevelopment } from "./development" with { type: 'macro' };

function getTextShaderType(type: number): string {
    if(type === WebGLRenderingContext.FRAGMENT_SHADER) return 'Fragment';
    if(type === WebGLRenderingContext.VERTEX_SHADER) return 'Vertex';
    throw new Error('Unknown');
}

function shaderLines(source: string): string[] {
    const lines = source.split(/\r?\n|\r|\n/g);
    const res: string[] = [];

    for(let i = 0, l = 1; i < lines.length; i++ , l++) {
        const lineNumber = l.toString().padStart(lines.length / 10 + 1, ' ');
        res.push(`${lineNumber} ${lines[i]}`);
    }

    return res;
}

function logShaderErrors(source: string, type: number, info: string) {
    const lines = shaderLines(source);

    for(const error of info.trim().split(/(\r\n|\n)/)) {
        const match = error.match(/^ERROR: 0:(\d+): (.*)/);
        if(match) {
            const lineNumber = parseInt(match[1]);
            const context = [
                lines[lineNumber - 2],
                '>' + lines[lineNumber - 1].substring(1),
                lines[lineNumber],
            ].join('\n');
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
    constructor(private gl: WebGLRenderingContext, public program: WebGLProgram) {

    }

    private getUniformLocation(name: string): WebGLUniformLocation {
        const loc = this.gl.getUniformLocation(this.program, name);
        if(!loc) throw new Error(`Can't find uniform : ${name}`);
        return loc;
    }

    setUniformFloat(name: string, x: GLfloat | Float32Array, y?: GLfloat, z?: GLfloat, w?: GLfloat) {
        if(x instanceof Float32Array) {
            this.gl.uniform1fv(this.getUniformLocation(name), x);
        } else if(y === undefined) {
            this.gl.uniform1f(this.getUniformLocation(name), x);
        } else if(z === undefined) {
            this.gl.uniform2f(this.getUniformLocation(name), x, y);
        } else if(w === undefined) {
            this.gl.uniform3f(this.getUniformLocation(name), x, y, z);
        } else {
            this.gl.uniform4f(this.getUniformLocation(name), x, y, z, w);
        }
    }

    setUniformInt(name: string, value: GLint | Int32Array) {
        if(value instanceof Int32Array) {
            this.gl.uniform1iv(this.getUniformLocation(name), value);
        } else {
            this.gl.uniform1i(this.getUniformLocation(name), value);
        }
    }

    setUniformMat(name: string, value: [GLfloat, GLfloat, GLfloat, GLfloat] | [GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat] | [GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat, GLfloat]) {
        if(value.length === 4) {
            this.gl.uniformMatrix2fv(this.getUniformLocation(name), false, value);
        } else if(value.length === 9) {
            this.gl.uniformMatrix3fv(this.getUniformLocation(name), false, value);
        } else if(value.length === 12) {
            this.gl.uniformMatrix4fv(this.getUniformLocation(name), false, value);
        }
    }
}
