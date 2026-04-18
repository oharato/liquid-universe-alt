import { simplexNoise3D } from './noise.glsl'

export const fragmentShader = /* glsl */ `
${simplexNoise3D}

uniform float uTime;
uniform float uFrequency;
uniform float uSpeed;

varying float vDisplacement;  // actual mesh displacement from vertex shader

void main() {
  float d = vDisplacement;

  // Single-octave accent noise for colour band variation (no FBM aliasing)
  vec3 pAcc = -vViewPosition * uFrequency * 0.35 + vec3(uTime * uSpeed * 0.22, 3.7, 1.9);
  float n2 = snoise(pAcc);  // -1..1

  // Slow large-scale noise for purple/pink zone masks
  vec3 pZone = vViewPosition * 0.50 + vec3(uTime * uSpeed * 0.08, 11.3, 5.1);
  float nZone = snoise(pZone) * 0.5 + 0.5;  // 0..1

  // --- Topographic contour lines (8 primary bands) ---
  float contourFreq = 8.0;
  float edge = 0.022;
  float c    = fract(d * contourFreq + uTime * uSpeed * 0.18);
  float line = smoothstep(edge, 0.0, c) + smoothstep(1.0 - edge, 1.0, c);
  line = clamp(line, 0.0, 1.0);

  // --- Elevation-based colour (deep valley → cyan → white peak) ---
  // Remap d: rings(0..1)*0.80 + waveA*0.20 → range ~-0.10 .. 0.90
  float dNorm = clamp((d + 0.10) / 1.00, 0.0, 1.0);

  vec3 deepBlue = vec3(0.00, 0.30, 0.82);  // valley: deep electric blue
  vec3 cyan     = vec3(0.00, 0.88, 1.00);  // mid slope: bright cyan
  vec3 white    = vec3(1.00, 1.00, 1.00);  // peak: pure white
  vec3 purple   = vec3(0.62, 0.08, 0.88);  // accent purple-violet
  vec3 pink     = vec3(0.95, 0.18, 0.65);  // accent hot-pink/magenta

  vec3 lineColor = mix(deepBlue, cyan,  smoothstep(0.18, 0.60, dNorm));
  lineColor      = mix(lineColor, white, smoothstep(0.55, 0.90, dNorm));

  // Purple accent — appears where nZone is high (~30% of surface)
  float purpMask = smoothstep(0.55, 0.90, nZone) * smoothstep(0.3, 0.8, n2) * 0.65 * line;
  lineColor = mix(lineColor, purple, purpMask);

  // Pink/magenta accent — tight noise band (~15% of surface)
  float pinkMask = smoothstep(0.70, 1.0, nZone) * smoothstep(0.06, 0.0, abs(n2 + 0.22)) * 0.50 * line;
  lineColor = mix(lineColor, pink, pinkMask);

  // Lines emit strongly; dark surface between them
  csm_Emissive  = lineColor * line * 13.0;
  csm_Roughness = mix(0.08, 0.001, line);
}
`
