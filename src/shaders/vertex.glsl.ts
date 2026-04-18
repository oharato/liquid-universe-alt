import { simplexNoise3D } from './noise.glsl'

export const vertexShader = /* glsl */ `
${simplexNoise3D}

uniform float uTime;
uniform vec2  uMouse;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uSpeed;

varying float vDisplacement;  // pass normalised 0..1 displacement to fragment

void main() {
  vec2 uv2 = uv * 2.0 - 1.0;

  // --- Layer 1: slow organic flow (FBM base) — reduced scale for larger smoother blobs ---
  float waveA = fbm(
    vec3(position.xy * uFrequency * 0.4, uTime * uSpeed * 0.5)
  );

  // --- Layer 2: fine surface texture ---
  float waveB = fbm(
    vec3(position.xy * uFrequency * 3.0 + 3.7, uTime * uSpeed * 1.8)
  ) * 0.22;

  // --- Layer 3: concentric ring waves from 4 sources
  //   (lower freq = fewer larger rings, interference pattern clearly visible)
  vec2 src1 = vec2( 0.0,  0.0);
  vec2 src2 = vec2( 0.9, -0.6);
  vec2 src3 = vec2(-0.7,  0.8);
  vec2 src4 = vec2( 0.4,  0.9);

  float rings =
    sin(length(position.xy - src1) * 4.0  - uTime * uSpeed * 5.5) * 0.40 +
    sin(length(position.xy - src2) * 3.5  - uTime * uSpeed * 4.8) * 0.30 +
    sin(length(position.xy - src3) * 4.8  - uTime * uSpeed * 6.2) * 0.26 +
    sin(length(position.xy - src4) * 5.2  - uTime * uSpeed * 3.8) * 0.20;
  rings = rings * 0.43 + 0.50;  // remap total amp ~±1.16 → 0..1

  // --- Mouse: gaussian bulge at cursor ---
  float mouseDist = length(uv2 - uMouse);
  float mousePull = exp(-mouseDist * mouseDist * 5.0);
  float mouseWave = mousePull * fbm(
    vec3(position.xy * uFrequency * 4.0, uTime * uSpeed * 3.5)
  ) * 0.7;

  float displacement = (waveA * 0.20 + waveB + rings * 0.80 + mouseWave) * uAmplitude;

  // rings dominate vDisplacement — produces smooth concentric interference topology
  vDisplacement = waveA * 0.20 + rings * 0.80;

  csm_Position = position + normal * displacement;
}
`
