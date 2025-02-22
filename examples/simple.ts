import { ShaderCanvas } from '../src/ShaderCanvas';
import fragment from './waves.frag';

//const background = new ShaderCanvas({fragment});
//const canvas = new ShaderCanvas('#canvas', {});
new ShaderCanvas('#canvas', {fragment}).onRender((canvas) => {
    canvas.program.setUniformFloat('u_time', canvas.time);
    canvas.program.setUniformFloat('u_size', canvas.width, canvas.height);
}).run();

// TODO: defines
// TODO: uniforms (uniform buffer object ? https://gist.github.com/jialiang/2880d4cc3364df117320e8cb324c2880)
// TODO: webgl2 only ?
