precision lowp float;

uniform int
maxRayBounces
;

uniform float
u_time
;

uniform vec2
u_resolution,
u_mouse
;

uniform sampler2D
tex0,
tex1,
spectrum
;

varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vPosition;

//---- Math Constant ----//

const float
E = 2.7182818284,
K = 2.6854520010,
PI = 3.1415926536,
TAU = 6.2831853072,
PHI = 1.6180339887,
SQRT075 = 0.8660254038,
SQRT2 = 1.4142135623,
SQRT3 = 1.7320508075;


//---- Math Equation ----//

#define nsin(n)(sin(n) * .5 + .5)
#define ncos(n)(cos(n) * .5 + .5)
#define ntan(n)(tan(n) * .5 + .5)
#define rad(deg)(deg * PI / 180.)


//---- Math Function ----//

float ndot(vec2 a, vec2 b) {
    return a.x * b.x - a.y * b.y;
}

// float mod(float a, float b){ return a - b * floor(a / b); }

float loop(float n) {
    return fract(n / TAU) * TAU;
}

vec2 ratio(vec2 n) {
    return vec2(min(n.x, n.y) / max(n.x, n.y), 1.0);
}

vec2 scale(vec2 pos, vec2 scale) {
    scale = max(scale, vec2(1.0 / 1024.0));
    return pos * mat2(1.0 / scale.x, 0.0, 0.0, 1.0 / scale.y);
}

vec2 scale(vec2 pos, vec2 scale, vec2 dimension) {
    scale = max(scale, vec2(1.0 / 1024.0));
    vec2 R = ratio(dimension);
    R = dimension.x > dimension.y ? R.xy : R.yx;
    return pos / scale * R * 0.5 + 0.5;
}

float angle(vec2 origin, vec2 target) {
    return atan(target.y - origin.y, target.x - origin.x);
}

vec2 rotate(vec2 p, float angle) {
    return p * mat2(
                    cos(angle), sin(angle),
                    -sin(angle), cos(angle)
                    );
}

vec2 rotate(vec2 p, vec2 origin, vec2 target) {
    return rotate(p - origin, angle(origin, target));
}


//---- Random Number ----//

float random21(vec2 n) {
    n = fract(n * vec2(278.91, 530.46));
    n += dot(n, n + (TAU * E));
    return fract(n.x * n.y);
}

vec3 hash3(vec2 p) {
    vec3 q = vec3(dot(p, vec2(127.1, 311.7)),
                  dot(p, vec2(269.5, 183.3)),
                  dot(p, vec2(419.2, 371.9)));
    return fract(sin(q) * 43758.5453);
}

float voronoise( in vec2 p, float u, float v) {
    float k = 1.0 + 63.0 * pow(1.0 - v, 6.0);
    
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    vec2 a = vec2(0.0, 0.0);
    for (int y = -2; y <= 2; y++)
        for (int x = -2; x <= 2; x++) {
            vec2 g = vec2(x, y);
            vec3 o = hash3(i + g) * vec3(u, u, 1.0);
            vec2 d = g - f + o.xy;
            float w = pow(1.0 - smoothstep(0.0, 1.414, length(d)), k);
            a += vec2(o.z * w, w);
        }
    
    return a.x / a.y;
}

//---- 2D mapping ----//

vec2 square2circle(vec2 p) {
    return vec2(
                sqrt(2.0 + 2.0 * SQRT2 * p.x + p.x * p.x - p.y * p.y) / 2.0 - sqrt(2.0 - 2.0 * SQRT2 * p.x + p.x * p.x - p.y * p.y) / 2.0,
                sqrt(2.0 + 2.0 * SQRT2 * p.y - p.x * p.x + p.y * p.y) / 2.0 - sqrt(2.0 - 2.0 * SQRT2 * p.y - p.x * p.x + p.y * p.y) / 2.0
                );
}

vec2 circle2square(vec2 p) {
    return vec2(
                p.x * sqrt(1.0 - 0.5 * p.y * p.y),
                p.y * sqrt(1.0 - 0.5 * p.x * p.x)
                );
}

vec2 cartesian2polar(vec2 p) {
    float angle = atan(p.y, p.x);
    float radius = length(p);
    return vec2(angle, radius);
}


//---- 2D Render Tools ----//

const float sN = 512.0;
float draw(float sdf) {
    return smoothstep(1.0 / sN, -1.0 / sN, sdf);
}

vec3 draw(vec3 sdf) {
    return smoothstep(1.0 / sN, -1.0 / sN, sdf);
}


//---- 2D SDF ----//

float circle(vec2 p, float r) {
    return length(p) - r;
}

float vesica(vec2 p, float r) {
    r /= SQRT075;
    return circle(abs(p) + vec2(r / 2.0, 0.0), r);
}

float vesica(vec2 p, vec2 a, vec2 b) {
    float r = distance(a, b) / 2.0 / SQRT075;
    p = rotate(p - mix(a, b, 0.5), angle(a, b));
    return circle(abs(p) + vec2(0.0, r / 2.0), r);
}

float line(vec2 p, vec2 a, vec2 b, float w) {
    float
    t = clamp(dot(p - a, b - a) / dot(b - a, b - a), 0.0, 1.0),
    d = length((p - a) - (b - a) * t);
    return d - w;
}

float rect(vec2 p, vec2 s) {
    vec2 d = abs(p) - s;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float rect(vec2 p, vec2 s, float r) {
    r *= min(s.x, s.y);
    vec2 d = abs(p) - s + r;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

float squircle(vec2 p, vec2 s, float r) {
    return length(pow(abs(p / s), 1.0 / r / min(s.x, s.y) * s)) - 1.0;
}

float rhombus(vec2 p, vec2 s, float r) {
    p = abs(p);
    r = min(min(s.x, s.y) - 1.0 / 1024.0, min(s.x, s.y) * r);
    s -= r;
    float
    h = clamp((-2.0 * ndot(p, s) + ndot(s, s)) / dot(s, s), -1.0, 1.0),
    d = length(p - 0.5 * s * vec2(1.0 - h, 1.0 + h));
    return d * sign(p.x * s.y + p.y * s.x - s.x * s.y) - r;
}

float poly(vec2 p, float ap, float n) {
    p = rotate(p, PI);
    ap *= cos(PI / n);
    n = PI * 2.0 / n;
    float a = atan(p.x, p.y);
    return cos(floor(0.5 + a / n) * n - a) * length(p) - ap;
}

//---- other 2D shapes ----//

float wave(vec2 p, float f, float a) {
    return p.y + cos(p.x * f) * a;
}

vec3 wave(vec2 p, vec3 f, vec3 a) {
    return p.y + cos(p.x * f) * a;
}

//---- Color Formulas ----//

#define uRGB(r, g, b) vec3(r, g, b) / 255.0

vec3 rgb2hsv(vec3 c) {
    vec4
    K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0),
    p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g)),
    q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float
    d = q.x - min(q.w, q.y),
    e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

#define uHSV(h, s, v) vec3(h / 360.0, s / 100.0, b / 100.0)

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


//---- Color Definitions ----//

#define grey vec3(0.5)
#define red vec3(1.0, 0.0, 0.0)
#define green vec3(0.0, 1.0, 0.0)
#define blue vec3(0.0, 0.0, 1.0)


//---- Blend Modes ----//

vec4 normal(vec4 a, vec4 b) {
    return mix(a, b, b.a);
}
vec4 multiply(vec4 a, vec4 b) {
    return vec4((a * b).rgb, b.a);
}
vec4 linearBurn(vec4 a, vec4 b) {
    return vec4(((a + b) - 1.0).rgb, b.a);
}
vec4 colorBurn(vec4 a, vec4 b) {
    return vec4((1.0 - (1.0 - a) / b).rgb, b.a);
}
vec4 darken(vec4 a, vec4 b) {
    return vec4(min(a, b).rgb, b.a);
}
vec4 lighten(vec4 a, vec4 b) {
    return vec4(max(a, b).rgb, b.a);
}
vec4 screen(vec4 a, vec4 b) {
    return vec4((1.0 - (1.0 - a) * (1.0 - b)).rgb, b.a);
}
vec4 add(vec4 a, vec4 b) {
    return vec4((a + b).rgb, b.a);
}
vec4 colorDodge(vec4 a, vec4 b) {
    return vec4((a / (1.0 - b)).rgb, b.a);
}
vec4 overlay(vec4 a, vec4 b) {
    vec4 c = vec4(0.0);
    c.r = a.r < 0.5 ? multiply(a, 2.0 * b).r : screen(a, 2.0 * (b - 0.5)).r;
    c.g = a.g < 0.5 ? multiply(a, 2.0 * b).g : screen(a, 2.0 * (b - 0.5)).g;
    c.b = a.b < 0.5 ? multiply(a, 2.0 * b).b : screen(a, 2.0 * (b - 0.5)).b;
    c.a = b.a;
    return normal(a, c);
}
vec4 hardLight(vec4 a, vec4 b) {
    vec4 c = vec4(0.0);
    c.r = b.r < 0.5 ? multiply(a, 2.0 * b).r : screen(a, 2.0 * (b - 0.5)).r;
    c.g = b.g < 0.5 ? multiply(a, 2.0 * b).g : screen(a, 2.0 * (b - 0.5)).g;
    c.b = b.b < 0.5 ? multiply(a, 2.0 * b).b : screen(a, 2.0 * (b - 0.5)).b;
    c.a = b.a;
    return normal(a, c);
}

vec4 softLight(vec4 a, vec4 b) {
    return normal(a, vec4(((1.0 - 2.0 * b) * a * a + 2.0 * b * a).rgb, b.a));
}
vec4 vividLight(vec4 a, vec4 b) {
    vec4 c = vec4(0.0);
    c.r = b.r < 0.5 ? colorBurn(a, 2.0 * b).r : colorDodge(a, 2.0 * (b - 0.5)).r;
    c.g = b.g < 0.5 ? colorBurn(a, 2.0 * b).g : colorDodge(a, 2.0 * (b - 0.5)).g;
    c.b = b.b < 0.5 ? colorBurn(a, 2.0 * b).b : colorDodge(a, 2.0 * (b - 0.5)).b;
    c.a = b.a;
    return normal(a, c);
}
vec4 linearLight(vec4 a, vec4 b) {
    vec4 c = vec4(0.0);
    c.r = b.r < 0.5 ? linearBurn(a, 2.0 * b).r : add(a, 2.0 * (b - 0.5)).r;
    c.g = b.g < 0.5 ? linearBurn(a, 2.0 * b).g : add(a, 2.0 * (b - 0.5)).g;
    c.b = b.b < 0.5 ? linearBurn(a, 2.0 * b).b : add(a, 2.0 * (b - 0.5)).b;
    c.a = b.a;
    return c;
}
vec4 pinLight(vec4 a, vec4 b) {
    vec4 c = vec4(0.0);
    c.r = b.r < 0.5 ? darken(a, 2.0 * b).r : lighten(a, 2.0 * (b - 0.5)).r;
    c.g = b.g < 0.5 ? darken(a, 2.0 * b).g : lighten(a, 2.0 * (b - 0.5)).g;
    c.b = b.b < 0.5 ? darken(a, 2.0 * b).b : lighten(a, 2.0 * (b - 0.5)).b;
    c.a = b.a;
    return normal(a, c);
}
vec4 hardMix(vec4 a, vec4 b) {
    return normal(a, vec4(ceil(linearLight(a, b)).rgb, b.a));
}
vec4 exclusion(vec4 a, vec4 b) {
    return normal(a, vec4(max(a + b - 2.0 * a * b, b.a).rgb, b.a));
}
vec4 difference(vec4 a, vec4 b) {
    return normal(a, vec4(max(abs(a - b), b.a).rgb, b.a));
}
vec4 subtract(vec4 a, vec4 b) {
    return normal(a, vec4(((a + max(1.0 - b, b.a)) - 1.0).rgb, b.a));
}
vec4 vivid(vec4 a, vec4 b) {
    return normal(a, vec4((a / b).rgb, b.a));
}

#define multiply(a, b) normal(a, multiply(a, b))
#define linearBurn(a, b) normal(a, linearBurn(a, b))
#define colorBurn(a, b) normal(a, colorBurn(a, b))
#define darken(a, b) normal(a, darken(a, b))
#define lighten(a, b) normal(a, lighten(a, b))
#define screen(a, b) normal(a, screen(a, b))
#define add(a, b) normal(a, add(a, b))
#define colorDodge(a, b) normal(a, colorDodge(a, b))
#define linearLight(a, b) normal(a, linearLight(a, b))


//--------//

//---- 3D Projections ----//

float map(float v, float low1, float high1, float low2, float high2) {
    return (v - low1) / (high1 - low1) * (high2 - low2);
}

vec2 cubemap(vec3 p) {
    vec3
    b = abs(p),
    v = (b.x > b.y && b.x > b.z) ? p.xyz :
    (b.y > b.x && b.y > b.z) ? p.yzx :
    p.zxy;
    vec2 q = v.yx / v.x;
    q *= 1.25 - 0.25 * q * q;
    return q;
}

vec2 equimap(vec3 p) {
    p = normalize(p);
    return
    vec2(
         map(atan(p.x, -p.z), 0.0, PI, 0.0, 1.0),
         map(asin(p.y), 0.0, -PI / 2.0, 0.0, 1.0)
         );
}

vec3 equiunwrap(vec2 p) {
    float
    lon = map(p.x, 0.0, 1.0, -PI, PI),
    lat = map(p.y, 0.0, 1.0, -PI / 2.0, PI / 2.0),
    x = sin(lat) * sin(lon),
    y = cos(lat),
    z = sin(lat) * cos(lon);
    return vec3(x, -y, z);
}

//---- input value ----//

float spectrumValue(int value) {
    float x = mod(float(value), 8.0);
    float y = float(value) / 8.0;
    return texture2D(spectrum, vec2(x, y) / 8.0).x / 0.625;
}

//----//

#define reso u_resolution
#define time u_time
#define spec u_spectrum

void main() {
    vec2
    ratio = vec2(min(reso.x, reso.y) / max(reso.x, reso.y), 1.0),
    st = vTexCoord,
    uv = st / 0.5 - 1.0;
    uv /= reso.x > reso.y ? ratio.xy : ratio.yx;
    vec3
    normal = normalize(vNormal),
    position = normalize(vPosition);
    vec4 col = vec4(1.0);
    
    
    col.rgb = abs(position);
    
    col.rgb *= sin(position.z / 0.5 + time);
    
    if(spectrumValue(12) > 0.4) col = texture2D(tex0, st);
    
    col.a = 0.5;
    gl_FragColor = vec4(col.rgb, 1.0);
}
