/**
 * 3D Simplex Noise, 3-Octave FBM (Fractional Brownian Motion),
 * and Fast Divergence-Free 3D Curl Noise for real-time 60fps GPU shaders.
 */
export const simplexNoise3D = /* glsl */ `
vec3 mod289_3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289_4(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289_4(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.7928429 - 0.8537347 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(0.1666667, 0.3333333);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g0 = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g0;
  vec3 i1 = min(g0.xyz, l.zxy);
  vec3 i2 = max(g0.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289_3(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.1428571;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x4 = x_ * ns.x + ns.yyyy;
  vec4 y4 = y_ * ns.x + ns.yyyy;
  vec4 h  = 1.0 - abs(x4) - abs(y4);

  vec4 b0 = vec4(x4.xy, y4.xy);
  vec4 b1 = vec4(x4.zw, y4.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Fractional Brownian Motion — 3 octaves (sweet spot for 60fps vertex displacement)
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 3; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

// Fast 3D Curl-like rotational flow using forward differences (4 snoise calls instead of 18)
vec3 fastCurl(vec3 p) {
  const float e = 0.08;
  float n0 = snoise(p);
  float nx = snoise(p + vec3(e, 0.0, 0.0)) - n0;
  float ny = snoise(p + vec3(0.0, e, 0.0)) - n0;
  float nz = snoise(p + vec3(0.0, 0.0, e)) - n0;
  vec3 grad = vec3(nx, ny, nz) / e;
  // Cross gradient with an offset axis to produce divergence-free swirling vectors
  return cross(grad, normalize(vec3(0.58, -0.71, 0.40)));
}
`
