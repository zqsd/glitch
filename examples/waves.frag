precision highp float;

uniform float u_time;
uniform vec2 u_size;
//uniform float resolution;
float resolution = 1.0 / 378.0;
float speed = 0.25;
float scroll = 0.125;
float width = 1.0;
vec3 color_a = vec3(1.0, 0.5, 0.0);
vec3 color_b = vec3(0.0, 0.75, 0.0);
vec3 color_c = vec3(0.5, 0.0, 0.75);


varying vec2 uv;

/*
vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    float n00 = dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
    float n10 = dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float n01 = dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float n11 = dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
    
    return mix(mix(n00, n10, u.x), mix(n01, n11, u.x), u.y);
}
*/
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
    float n = 1.0 * noise(1.0 * inn + vec3(0.0, 0.0, 0.0)); //1.0 * sin(uv.x * width + u_time * scroll + float(id) * 3.14159 / 3.0) * 0.75;/* +
              //0.5 * noise(2.0 * inn + vec3(0.0, 0.0, 1.0));*/
    n = (n / (1.0/* + 0.5*/)) * 0.5 + 0.5; // normalize
    return n;
}

vec4 blend(vec4 a, vec4 b) {
    if(a.a > 0.0 && b.a > 0.0) {
        return vec4(a.rgb + b.rgb, a.a * b.a);
    }
    //return a + b * (1.0 - a.a);
}

float linearstep(float edge0, float edge1, float x) {
    return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float edge(vec2 uv, float y0, float y1) {
    //float b = 0.001 * u_size.x;
    //return vec4(smoothstep(y0, y1, uv.y)) + b;

    float m = (uv.y - y0) / (y1 - y0);
    if(m < 0.0) {
        return 0.0;
    } else if(m > 1.0) {
        float dd = 1.0 / u_size.y;
        float aa = linearstep(y1 + (y0 > y1 ? -dd : dd), y1, uv.y);
        return aa;
    } else {
        return m;
    }
}

vec4 wave(vec4 color, int id) {
    /*float alpha = smoothstep(n - resolution, n + resolution, uv.y); // TODO: simpler AA
    if(alpha < 1.0 / 255.0) discard;
    return vec4(color_a * alpha, alpha);*/
    float n_a = fbm2(id * 3);
    float n_b = fbm2(id * 3 + 1);
    float n_c = fbm2(id * 3 + 2);

    vec4 c = vec4(0.0);
    //if(uv.y > min(n_a, n_b) && uv.y < max(n_a, n_b)) {
            //c = mix(color, vec4(0.0), clamp(smoothstep(n_a, n_b, uv.y), 0.0, 1.0));
    //}
    /*
    if(uv.y > min(n_c, n_b) && uv.y < max(n_c, n_b)) {
        c = blend(c, mix(color, vec4(0.0), clamp(smoothstep(n_c, n_b, uv.y), 0.0, 1.0)));
    }*/
    
    c = color * edge(uv, n_b, n_a);
    c += color * edge(uv, n_b, n_c);

    return c;
}

void main() {
    // sin(uv.x * 3.14159)
    /*if(uv.x < 0.5) {
        gl_FragColor = edge(uv, vec4(color_a, 1.0), 0.33, 0.66);
    } else {
        gl_FragColor = edge(uv, vec4(color_a, 1.0), 0.66, 0.33);
    }*/

    //gl_FragColor += wave(vec4(color_a, 1.0), 0);
    gl_FragColor += wave(vec4(color_b, 1.0), 1);
    gl_FragColor += wave(vec4(color_c, 1.0), 2);

    //gl_FragColor += wave(uv, vec4(color_b, 1.0), 1);
    //gl_FragColor += wave(uv, vec4(color_a, 1.0), 2);
    /*
        float a = clamp(smoothstep(n_a + 0.1, n_a, uv.y), 0.0, 1.0);
        gl_FragColor = vec4(color_a * a, a);
    }
    else if(n_b < uv.y) gl_FragColor = vec4(color_b, 1.0);
    else if(n_c < uv.y) gl_FragColor = vec4(color_c, 1.0);*/

    //noise(vec3(uv * 378.0 - u_time * scroll, 0.0)) * 0.25

    //float alpha = smoothstep(n - resolution, n + resolution, uv.y); // TODO: simpler AA
    //if(alpha < 1.0 / 255.0) discard;
    //gl_FragColor = vec4(color_a * alpha, alpha);
}