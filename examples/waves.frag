precision highp float;

uniform float u_time;
uniform vec2 u_size;
//uniform float resolution;
float resolution = 1.0 / 378.0;
float speed = 0.125;
float scroll = 0.05;
float width = 1.0;
vec4 color_a = vec4(vec3(1.0, 0.5, 0.0) * 0.75, 1.0);
vec4 color_b = vec4(0.0, 0.75, 0.0, 1.0);
vec4 color_c = vec4(0.5, 0.0, 0.75, 1.0);

varying vec2 uv;

vec4 srgbToLinear(vec4 srgb) {
    return vec4(mix(srgb.rgb / 12.92, pow((srgb.rgb + 0.055) / 1.055, vec3(2.4)), step(0.04045, srgb.rgb)), 1.0);
}

vec4 linearToSrgb(vec4 linear) {
    return vec4(mix(linear.rgb * 12.92, 1.055 * pow(linear.rgb, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, linear.rgb)), 1.0);
}

vec3 hash(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 123.7)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    vec3 u = f * f * (3.0 - 2.0 * f);
    
    float n000 = dot(hash(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0));
    float n100 = dot(hash(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0));
    float n010 = dot(hash(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0));
    float n110 = dot(hash(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0));
    float n001 = dot(hash(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0));
    float n101 = dot(hash(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0));
    float n011 = dot(hash(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0));
    float n111 = dot(hash(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0));
    
    return mix(mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
               mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y), u.z);
}

float fbm2(int id) {
    vec3 inn = vec3(uv.x * width + u_time * scroll, u_time * speed, float(id) * 5.0);
    // maybe + sin ?
    //float n = cos(uv.x * width + u_time * scroll + float(id) * 3.14159 / 3.0) * 0.75;
    float n = 1.0 * noise(1.0 * inn + vec3(0.0, 0.0, 0.0)) + //1.0 * sin(uv.x * width + u_time * scroll + float(id) * 3.14159 / 3.0) * 0.75;/* +
              0.5 * noise(2.0 * inn + vec3(0.0, 0.0, 1.0));
    n = (n / (1.0 + 0.5)) * 0.5 + 0.5; // normalize
    return n;
}

vec4 blend(vec4 a, vec4 b) {
    if(a.a > 0.0 && b.a > 0.0) {
        float alpha = max(a.a, b.a);
        vec3 rgb = a.rgb * (a.a / (a.a + b.a)) + 
                   b.rgb * (b.a / (a.a + b.a));
        return vec4(rgb, alpha);
    }
    return a + b;
}

float linearstep(float edge0, float edge1, float x) {
    return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float edge(vec2 uv, float y0, float y1) {
    float m = (uv.y - y0) / (y1 - y0);
    if(m < 0.0) {
        return 0.0;
    } else if(m > 1.0) { // antialiasing
        float dd = 1.0 / u_size.y;
        float aa = linearstep(y1 + (y0 > y1 ? -dd : dd), y1, uv.y);
        return aa;
    } else { // fill
        return m;
    }
}

vec4 wave(vec4 color, int id) {
    float n_a = fbm2(id * 6 + 0);
    float n_b = fbm2(id * 6 + 2);
    float n_c = fbm2(id * 6 + 4);

    return blend(
        color * edge(uv, n_b, n_a),
        vec4(0.0) //color * edge(uv, n_b, n_c)
    );
}

void main() {
    vec4 c;
    c = wave(srgbToLinear(color_b), 1);
    for(int i = 0; i < 10; i++) {
        c = blend(c, c);
    }
    c = blend(c, wave(srgbToLinear(color_c), 2));
    c = blend(c, wave(srgbToLinear(color_a), 3));
    gl_FragColor = linearToSrgb(c);
}