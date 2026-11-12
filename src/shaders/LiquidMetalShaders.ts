import { simplexNoise3D } from './noise.glsl'

export const vertexShader = /* glsl */ `
${simplexNoise3D}

uniform float uTime;
uniform float uSpeed;
uniform float uNoiseDensity;
uniform float uNoiseStrength;
uniform float uDomainWarp;
uniform float uCurlStrength;
uniform float uRippleStrength;
uniform vec2  uMouse;
uniform float uMouseStrength;
uniform int   uIsMetaballs;
uniform vec4  uMetaballs[8];

varying float vDisplacement;
varying float vTurbulence;
varying vec3  vWorldPos;

// Evaluate exact analytical metaball field & outward normal in [0..1] grid coordinates
void evaluateMetaballSurface(inout vec3 pos, out vec3 exactNormal) {
    vec3 b = pos * 0.5 + 0.5;
    float field = 0.0;
    vec3 grad = vec3(0.0);

    for (int i = 0; i < 8; i++) {
        vec3 c = uMetaballs[i].xyz;
        float strength = uMetaballs[i].w;
        if (strength > 0.0001) {
            vec3 d = b - c;
            float r2 = dot(d, d) + 0.0001;
            float val = strength / r2 - 12.0;
            if (val > 0.0) {
                field += val;
                // Smooth falloff weight near cutoff so gradient is C1 continuous
                float edgeSmooth = smoothstep(0.0, 12.0, val);
                grad += (2.0 * strength * d / (r2 * r2)) * edgeSmooth;
            }
        }
    }

    float gradLen = length(grad);
    if (gradLen > 0.0001) {
        exactNormal = grad / gradLen;
        // One step of Newton-Raphson projection onto the exact F(b) = 80.0 isosurface
        // Eliminates polygonal MarchingCubes stepping artifacts on the silhouette
        float isoDiff = clamp((field - 80.0) / gradLen, -0.022, 0.022);
        b += exactNormal * isoDiff;
        pos = b * 2.0 - 1.0;

        // Re-evaluate smooth analytical gradient at refined position
        vec3 grad2 = vec3(0.0);
        for (int i = 0; i < 8; i++) {
            vec3 c = uMetaballs[i].xyz;
            float strength = uMetaballs[i].w;
            if (strength > 0.0001) {
                vec3 d = b - c;
                float r2 = dot(d, d) + 0.0001;
                float val = strength / r2 - 12.0;
                if (val > 0.0) {
                    float edgeSmooth = smoothstep(0.0, 12.0, val);
                    grad2 += (2.0 * strength * d / (r2 * r2)) * edgeSmooth;
                }
            }
        }
        if (length(grad2) > 0.0001) {
            exactNormal = normalize(grad2);
        }
    } else {
        exactNormal = length(normal) > 0.0001 ? normalize(normal) : vec3(0.0, 0.0, 1.0);
    }
}

// Evaluate surface height using precomputed domain/curl warp offset (ultra-fast for neighbor normals)
float sampleFluidHeight(vec3 pos, vec3 totalOffset, float curlRidge, float t) {
    vec3 timeVec = vec3(t, t * 0.82, t * 0.63);
    vec3 spatialOffset = vec3(43.21, -15.34, 87.65);
    vec3 p = pos * uNoiseDensity + spatialOffset + totalOffset;

    float baseFluid = fbm(p + timeVec);

    // Multi-source harmonic interference ripples
    float ripples = 0.0;
    if (uRippleStrength > 0.001) {
        vec2 src1 = vec2(sin(t * 0.7) * 0.6, cos(t * 0.5) * 0.6);
        vec2 src2 = vec2(cos(t * 0.4) * -0.8, sin(t * 0.9) * 0.5);
        vec2 src3 = vec2(sin(t * 0.6 + 1.5) * 0.5, cos(t * 0.8 + 2.0) * -0.7);

        ripples =
            sin(length(pos.xy - src1) * 5.0 - t * 6.0) * 0.40 +
            sin(length(pos.xy - src2) * 4.2 - t * 5.0) * 0.35 +
            sin(length(pos.xy - src3) * 6.0 - t * 7.2) * 0.25;
    }

    // Interactive pointer / magnetic ferrofluid pull
    float mouseEffect = 0.0;
    if (uMouseStrength > 0.001) {
        float mouseDist = length(pos.xy - uMouse);
        float mouseGaussian = exp(-mouseDist * mouseDist * 2.2);
        float mouseRipple = sin(mouseDist * 10.0 - uTime * 8.0) * exp(-mouseDist * 1.8);
        mouseEffect = (mouseGaussian * 0.7 + mouseRipple * 0.3) * uMouseStrength;
    }

    return (baseFluid + curlRidge + ripples * uRippleStrength * 0.35) * uNoiseStrength + mouseEffect * 0.25;
}

void main() {
    vec3 basePos = position;
    vec3 unitNormal;

    if (uIsMetaballs == 1) {
        evaluateMetaballSurface(basePos, unitNormal);
    } else {
        unitNormal = length(normal) > 0.0001 ? normalize(normal) : vec3(0.0, 0.0, 1.0);
    }

    float t = uTime * uSpeed;
    vec3 timeVec = vec3(t, t * 0.82, t * 0.63);
    vec3 spatialOffset = vec3(43.21, -15.34, 87.65);
    vec3 baseP = basePos * uNoiseDensity + spatialOffset;

    // 1. Compute Curl Noise & Domain Warp ONCE per vertex
    vec3 curlVel = vec3(0.0);
    if (uCurlStrength > 0.001) {
        curlVel = fastCurl(baseP * 0.65 + timeVec * 0.45) * uCurlStrength;
    }

    vec3 warp = vec3(0.0);
    if (uDomainWarp > 0.001) {
        warp = vec3(
            snoise(baseP + timeVec * 0.7),
            snoise(baseP + vec3(5.2, 1.3, 2.8) - timeVec * 0.6),
            snoise(baseP + vec3(1.7, 9.2, 4.1) + timeVec * 0.5)
        );
    }

    vec3 totalOffset = curlVel * 0.45 + warp * uDomainWarp;
    float curlRidge = dot(curlVel, unitNormal) * 0.25;

    // 2. Displaced center vertex
    float disp = sampleFluidHeight(basePos, totalOffset, curlRidge, t);
    vec3 displacedPosition = basePos + unitNormal * disp;

    // 3. Re-calculate normals using 2 forward-difference neighbor samples
    float epsilon = 0.008;
    vec3 rawTangent = cross(unitNormal, vec3(0.0, 1.0, 0.0));
    if (length(rawTangent) < 0.001) {
        rawTangent = cross(unitNormal, vec3(1.0, 0.0, 0.0));
    }
    vec3 tangent = normalize(rawTangent);
    vec3 bitangent = normalize(cross(unitNormal, tangent));

    vec3 posT = basePos + tangent * epsilon;
    vec3 posB = basePos + bitangent * epsilon;
    vec3 pTangent = posT + unitNormal * sampleFluidHeight(posT, totalOffset, curlRidge, t);
    vec3 pBitangent = posB + unitNormal * sampleFluidHeight(posB, totalOffset, curlRidge, t);

    vec3 newNormal = normalize(cross(pTangent - displacedPosition, pBitangent - displacedPosition));

    vDisplacement = disp;
    vTurbulence = length(totalOffset) * 0.6 + abs(disp) * 2.0;
    vWorldPos = (modelMatrix * vec4(displacedPosition, 1.0)).xyz;

    csm_Position = displacedPosition;
    csm_Normal = newNormal;
}
`

export const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uRoughness;
uniform float uIridescence;
uniform float uCausticGlow;
uniform vec3  uGlowColor;

varying float vDisplacement;
varying float vTurbulence;
varying vec3  vWorldPos;

void main() {
    // Normalize displacement factor into roughly 0..1 range
    float normDisp = clamp(vDisplacement * 2.5 + 0.5, 0.0, 1.0);

    // Dynamic micro-roughness: wave crests become mirror-smooth, valleys retain subtle weight
    float dynamicRoughness = clamp(uRoughness * mix(1.35, 0.35, normDisp), 0.005, 1.0);
    csm_Roughness = dynamicRoughness;

    // Modulate thin-film iridescence thickness / strength across turbulent eddies
    float iridMod = clamp(uIridescence * (0.65 + 0.55 * sin(vTurbulence * 4.0 + uTime * 0.5)), 0.0, 1.0);
    csm_Iridescence = iridMod;

    // Optional interference / caustic contour glow along high-curvature wave crests
    if (uCausticGlow > 0.001) {
        float phase = fract(vDisplacement * 8.0 - uTime * 0.25);
        float contour = smoothstep(0.08, 0.0, phase) + smoothstep(0.92, 1.0, phase);
        float crestGlow = smoothstep(0.55, 0.95, normDisp) * 0.4 + contour * 0.6;
        csm_Emissive = uGlowColor * crestGlow * uCausticGlow * 2.5;
    }
}
`
