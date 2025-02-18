precision mediump float;

varying vec2 uv;

void main() {
    //gl_FragColor = vec4(uv.x, uv.y, 0.75, 1.0);
    gl_FragColor = mix(vec4(0.1, 0.62, 1.0, 1.0), vec4(uv.x, uv.y, 0.0, 1.0), length(uv));
}