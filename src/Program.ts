import { isDevelopment } from "./development" with { type: 'macro' };

function getTextShaderType(type: number): string {
    if(type === WebGLRenderingContext.FRAGMENT_SHADER) return 'Fragment';
    if(type === WebGLRenderingContext.VERTEX_SHADER) return 'Vertex';
    throw new Error('Unknown');
}

interface Line {
    num: number;
    code: string;
}

function shaderLines(source: string): Line[] {
    const lines = source.split(/\r?\n|\r|\n/g);
    const res: Line[] = [];

    
    const tens = lines.length.toString().length;
    for(let i = 0, l = 1; i < lines.length; i++ , l++) {
        if(lines[i].startsWith('#line ')) {
            l = parseInt(lines[i].substring(6)) - 1;
        }
        const prepend = l.toString().padStart(tens, ' ');
        res.push({num: l, code: prepend + '  ' + lines[i]});
    }
    //console.log(res.map(l => l.code).join('\n'));

    return res;
}

function logShaderErrors(source: string, type: ShaderType, info: string) {
    const lines = shaderLines(source);

    for(const error of info.trim().split(/(\r\n|\n)/)) {
        const match = error.match(/^ERROR: 0:(\d+): (.*)/);
        if(match) {
            const lineNumber = parseInt(match[1]);
            const i = lines.findIndex(({num}) => num === lineNumber)!;
            const context = [
                '  ' + lines[i - 1].code,
                '>>' + lines[i].code,
                '  ' + lines[i + 1].code,
            ].join('\n');
            console.error(getTextShaderType(type).toUpperCase() + ' SHADER ' + error.replace('ERROR: 0:', 'ERROR: L') + '\r\n\r\n' + context);
        } else {
            console.warn(error);
        }
    }
}

/*export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
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
}*/


export type ShaderType = WebGLRenderingContext['VERTEX_SHADER'] | WebGLRenderingContext['FRAGMENT_SHADER'];

class Shader {
    id: WebGLShader;

    constructor(private gl: WebGLRenderingContext, public type: ShaderType, public source: string) {
        this.id = this.gl.createShader(type)!;
        if(!this.id) throw new Error('Failed to create shader');
    }

    compile(prepend: string) {
        const source = prepend + '\n#line 0\n' + this.source;
        this.gl.shaderSource(this.id, source);
        this.gl.compileShader(this.id);

        if(isDevelopment()) {
            const info = this.gl.getShaderInfoLog(this.id)!;
            if(info && info.trim() !== '') {
                logShaderErrors(source, this.type, info);
            }
        }

        if(!this.gl.getShaderParameter(this.id, this.gl.COMPILE_STATUS)) {
            this.gl.deleteShader(this);
            throw new Error(`${getTextShaderType(this.type)} shader compilation error`);
        }
    }
}

export class Program {
    id: WebGLProgram;
    shaders: Shader[] = [];
    defines: Map<string, any> = new Map();
    dirty: boolean = true;

    constructor(private gl: WebGLRenderingContext, {vertex, fragment}: {vertex?: string, fragment?: string}) {
        if(vertex) {
            this.shaders.push(new Shader(this.gl, gl.VERTEX_SHADER, vertex));
        }
        if(fragment) {
            this.shaders.push(new Shader(this.gl, gl.FRAGMENT_SHADER, fragment));
        }
        this.id = gl.createProgram();
    }

    set(name: string, value: any) {
        this.defines.set(name, value);
        this.dirty = true;
    }

    unset(name: string) {
        this.defines.delete(name);
        this.dirty = true;
    }

    build() {
        if(!this.dirty) return;
        this.compile();
        this.link();
    }

    private compile() {
        const defines = this.getDefines();
        for(const shader of this.shaders) {
            shader.compile(defines);
        }
    }

    private link() {
        for(const shader of this.shaders) {
            this.gl.attachShader(this.id, shader.id);
        }
        this.gl.linkProgram(this.id);
        if(!this.gl.getProgramParameter(this.id, this.gl.LINK_STATUS)) {
            let message = 'Failed to link program';
            if(isDevelopment()) {
                const info = this.gl.getProgramInfoLog(this.id);
                message += ': ' + info;
            }
            this.gl.deleteProgram(this.id);
            throw new Error(message);
        }
    }

    private getDefines(): string {
        return Object.entries(this.defines).map((name, value) => {
            return `#define $name $value`;
        }).join('\n');
    }

    private getUniformLocation(name: string): WebGLUniformLocation {
        const loc = this.gl.getUniformLocation(this.id, name);
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
