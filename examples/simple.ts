import { ShaderCanvas } from '../src/ShaderCanvas';
import fragment from './red.frag';

//const canvas = document.querySelector('canvas') as HTMLCanvasElement;

//console.log('>'+fragment+'<')

const background = new ShaderCanvas({fragment});
const foreground = new ShaderCanvas('#pouet', {fragment});
const canvas = new ShaderCanvas('#canvas', {});

// TODO: defines
// TODO: uniforms (uniform buffer object ? https://gist.github.com/jialiang/2880d4cc3364df117320e8cb324c2880)
// TODO: webgl2 only ?
