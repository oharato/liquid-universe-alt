import type { DisplayMode, LiquidMetalControls } from './components/LiquidMetal'

export type EnvPresetType =
  | 'apartment'
  | 'city'
  | 'dawn'
  | 'forest'
  | 'lobby'
  | 'night'
  | 'park'
  | 'studio'
  | 'sunset'
  | 'warehouse'

export interface PostProcessConfig {
  enabled: boolean
  fluidEnabled: boolean
  fluidIntensity: number
  fluidDistortion: number
  fluidCurl: number
  fluidRadius: number
  fluidRainbow: boolean
  bloomIntensity: number
  bloomThreshold: number
  chromaticAberration: number
  vignetteDarkness: number
}

export interface ShowcasePreset {
  id: string
  name: string
  subtitle: string
  techBadge: string
  mode: DisplayMode
  envPreset: EnvPresetType
  background: boolean
  metal: LiquidMetalControls
  post: PostProcessConfig
}

export const SHOWCASE_PRESETS: ShowcasePreset[] = [
  {
    id: 'mercury',
    name: '🌊 水銀ミラー',
    subtitle: 'マウス軌跡にナビエ・ストークス流体渦が走る純粋水銀膜',
    techBadge: 'Navier-Stokes Fluid + FBM',
    mode: 'fullscreen',
    envPreset: 'city',
    background: false,
    metal: {
      speed: 0.2,
      noiseDensity: 1.3,
      noiseStrength: 0.2,
      domainWarp: 0.65,
      curlStrength: 0.35,
      rippleStrength: 0.25,
      mouseStrength: 0.45,
      roughness: 0.03,
      metalness: 1.0,
      iridescence: 0.35,
      iridescenceIOR: 1.5,
      clearcoat: 0.9,
      anisotropy: 0.2,
      causticGlow: 0.05,
      glowColor: '#00e5ff',
      autoColor: false,
      colorSpeed: 0.04,
      color: '#dce6f7',
    },
    post: {
      enabled: true,
      fluidEnabled: true,
      fluidIntensity: 2.5,
      fluidDistortion: 1.4,
      fluidCurl: 8.0,
      fluidRadius: 0.22,
      fluidRainbow: false,
      bloomIntensity: 0.55,
      bloomThreshold: 0.78,
      chromaticAberration: 0.0015,
      vignetteDarkness: 0.4,
    },
  },
  {
    id: 'metaballs',
    name: '🫧 融合メタボール',
    subtitle: '複数の液体金属滴が宙を漂い、ヌルッと結合・分離する3D等値面',
    techBadge: 'Drei MarchingCubes + CSM',
    mode: 'metaballs',
    envPreset: 'studio',
    background: false,
    metal: {
      speed: 0.28,
      noiseDensity: 1.6,
      noiseStrength: 0.16,
      domainWarp: 0.5,
      curlStrength: 0.45,
      rippleStrength: 0.15,
      mouseStrength: 0.85,
      roughness: 0.03,
      metalness: 1.0,
      iridescence: 0.8,
      iridescenceIOR: 1.75,
      clearcoat: 1.0,
      anisotropy: 0.3,
      causticGlow: 0.12,
      glowColor: '#66f0ff',
      autoColor: true,
      colorSpeed: 0.04,
      color: '#4f7cff',
    },
    post: {
      enabled: true,
      fluidEnabled: true,
      fluidIntensity: 1.8,
      fluidDistortion: 0.8,
      fluidCurl: 5.0,
      fluidRadius: 0.18,
      fluidRainbow: false,
      bloomIntensity: 0.75,
      bloomThreshold: 0.68,
      chromaticAberration: 0.002,
      vignetteDarkness: 0.45,
    },
  },
  {
    id: 'curlFerro',
    name: '🌀 カール磁性流体',
    subtitle: '非圧縮Curl NoiseとDomain Warpingによる鋭い渦巻きフェロフルード球体',
    techBadge: '3D Curl Noise + Domain Warp',
    mode: 'sphere',
    envPreset: 'warehouse',
    background: false,
    metal: {
      speed: 0.32,
      noiseDensity: 1.8,
      noiseStrength: 0.34,
      domainWarp: 1.45,
      curlStrength: 1.35,
      rippleStrength: 0.2,
      mouseStrength: 0.65,
      roughness: 0.05,
      metalness: 1.0,
      iridescence: 0.55,
      iridescenceIOR: 1.6,
      clearcoat: 0.9,
      anisotropy: 0.65,
      causticGlow: 0.18,
      glowColor: '#38bdf8',
      autoColor: false,
      colorSpeed: 0.05,
      color: '#1e293b',
    },
    post: {
      enabled: true,
      fluidEnabled: true,
      fluidIntensity: 2.0,
      fluidDistortion: 1.0,
      fluidCurl: 10.0,
      fluidRadius: 0.2,
      fluidRainbow: false,
      bloomIntensity: 0.7,
      bloomThreshold: 0.65,
      chromaticAberration: 0.0022,
      vignetteDarkness: 0.5,
    },
  },
  {
    id: 'iridescent',
    name: '🌈 構造色オイルスリック',
    subtitle: '薄膜光学干渉（Iridescence）と虹色流体渦が織りなすシャボン玉・酸化チタン膜',
    techBadge: 'Thin-Film Iridescence + Rainbow Fluid',
    mode: 'fullscreen',
    envPreset: 'sunset',
    background: false,
    metal: {
      speed: 0.22,
      noiseDensity: 1.4,
      noiseStrength: 0.24,
      domainWarp: 0.95,
      curlStrength: 0.75,
      rippleStrength: 0.4,
      mouseStrength: 0.55,
      roughness: 0.02,
      metalness: 1.0,
      iridescence: 1.0,
      iridescenceIOR: 2.1,
      clearcoat: 1.0,
      anisotropy: 0.5,
      causticGlow: 0.22,
      glowColor: '#f472b6',
      autoColor: true,
      colorSpeed: 0.08,
      color: '#6366f1',
    },
    post: {
      enabled: true,
      fluidEnabled: true,
      fluidIntensity: 3.5,
      fluidDistortion: 1.8,
      fluidCurl: 12.0,
      fluidRadius: 0.26,
      fluidRainbow: true,
      bloomIntensity: 0.85,
      bloomThreshold: 0.62,
      chromaticAberration: 0.0032,
      vignetteDarkness: 0.4,
    },
  },
  {
    id: 'cyberCaustics',
    name: '⚡ 音波共鳴コースティクス',
    subtitle: '多点干渉波（Ripples）の等高線エッジが発光するサイマティクス共鳴膜',
    techBadge: 'Harmonic Ripples + Caustic Bloom',
    mode: 'fullscreen',
    envPreset: 'night',
    background: false,
    metal: {
      speed: 0.26,
      noiseDensity: 1.2,
      noiseStrength: 0.26,
      domainWarp: 0.4,
      curlStrength: 0.3,
      rippleStrength: 1.25,
      mouseStrength: 0.6,
      roughness: 0.04,
      metalness: 1.0,
      iridescence: 0.7,
      iridescenceIOR: 1.8,
      clearcoat: 0.85,
      anisotropy: 0.25,
      causticGlow: 0.75,
      glowColor: '#00f5d4',
      autoColor: false,
      colorSpeed: 0.04,
      color: '#0f172a',
    },
    post: {
      enabled: true,
      fluidEnabled: true,
      fluidIntensity: 2.8,
      fluidDistortion: 1.5,
      fluidCurl: 9.0,
      fluidRadius: 0.24,
      fluidRainbow: false,
      bloomIntensity: 1.35,
      bloomThreshold: 0.45,
      chromaticAberration: 0.0038,
      vignetteDarkness: 0.55,
    },
  },
]
