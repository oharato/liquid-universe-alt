import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { Fluid } from '@whatisjery/react-fluid-distortion'
import { BlendFunction } from 'postprocessing'
import { useControls, button, Leva } from 'leva'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { MorphingEnvironment } from './components/MorphingEnvironment'
import type { DisplayMode, LiquidMetalControls } from './components/LiquidMetal'
import { SHOWCASE_PRESETS, type EnvPresetType, type ShowcasePreset } from './presets'
import './App.css'

const PRESETS: EnvPresetType[] = [
  'city',
  'sunset',
  'dawn',
  'night',
  'warehouse',
  'forest',
  'apartment',
  'studio',
  'lobby',
  'park',
]

// Component to reset the camera when switching to fullscreen mode
const CameraReset = ({ mode }: { mode: DisplayMode }) => {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(0, 0, 4)
    camera.rotation.set(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [mode, camera])
  return null
}

function App() {
  const [activePresetId, setActivePresetId] = useState<string>(SHOWCASE_PRESETS[0].id)
  const activePreset = useMemo(
    () => SHOWCASE_PRESETS.find((p) => p.id === activePresetId) ?? SHOWCASE_PRESETS[0],
    [activePresetId]
  )

  // 1. Environment & Display Mode controls (collapsed by default so presets stand out)
  const [envControls, setEnvControls] = useControls(
    '1. Environment (表示モード・反射環境)',
    () => ({
      mode: {
        options: {
          '全画面 (Fullscreen)': 'fullscreen',
          '球体 (Sphere)': 'sphere',
          '融合メタボール (Metaballs)': 'metaballs',
        },
        value: SHOWCASE_PRESETS[0].mode as DisplayMode,
        label: '表示モード',
      },
      preset: {
        options: {
          '都市 (City)': 'city',
          '夕暮れ (Sunset)': 'sunset',
          '夜明け (Dawn)': 'dawn',
          '夜 (Night)': 'night',
          '倉庫 (Warehouse)': 'warehouse',
          '森 (Forest)': 'forest',
          '部屋 (Apartment)': 'apartment',
          'スタジオ (Studio)': 'studio',
          'ロビー (Lobby)': 'lobby',
          '公園 (Park)': 'park',
        },
        value: SHOWCASE_PRESETS[0].envPreset as EnvPresetType,
        label: 'HDR環境',
      },
      autoSwitch: { value: true, label: 'HDR自動切り替え' },
      switchInterval: { value: 10, min: 1, max: 20, step: 0.5, label: '切り替え間隔(秒)' },
      crossfadeDuration: { value: 4.5, min: 0.1, max: 10.0, step: 0.1, label: 'フェード時間(秒)' },
      background: { value: false, label: '背景として表示' },
    }),
    { collapsed: true }
  )

  // 2. Liquid Metal controls (Fluid Dynamics + Curl Noise + Thin-Film Iridescence)
  const [metalControls, setMetalControls] = useControls(
    '2. Liquid Metal (流体・カールノイズ・薄膜干渉)',
    () => ({
      speed: { value: SHOWCASE_PRESETS[0].metal.speed, min: 0.0, max: 2.0, step: 0.01, label: '流速 (Speed)' },
      noiseDensity: { value: SHOWCASE_PRESETS[0].metal.noiseDensity, min: 0.1, max: 5.0, step: 0.1, label: 'FBM密度' },
      noiseStrength: { value: SHOWCASE_PRESETS[0].metal.noiseStrength, min: 0.0, max: 1.0, step: 0.01, label: '変位強度' },
      domainWarp: { value: SHOWCASE_PRESETS[0].metal.domainWarp, min: 0.0, max: 2.5, step: 0.05, label: '渦の歪み (Warp)' },
      curlStrength: { value: SHOWCASE_PRESETS[0].metal.curlStrength, min: 0.0, max: 2.0, step: 0.05, label: 'カールノイズ (Curl)' },
      rippleStrength: { value: SHOWCASE_PRESETS[0].metal.rippleStrength, min: 0.0, max: 1.5, step: 0.05, label: '干渉波 (Ripple)' },
      mouseStrength: { value: SHOWCASE_PRESETS[0].metal.mouseStrength, min: 0.0, max: 1.5, step: 0.05, label: 'マウス引力' },
      roughness: { value: SHOWCASE_PRESETS[0].metal.roughness, min: 0.0, max: 1.0, step: 0.01, label: '粗さ (Roughness)' },
      metalness: { value: SHOWCASE_PRESETS[0].metal.metalness, min: 0.0, max: 1.0, step: 0.01, label: '金属度 (Metalness)' },
      iridescence: { value: SHOWCASE_PRESETS[0].metal.iridescence, min: 0.0, max: 1.0, step: 0.01, label: '薄膜干渉 (Iridescence)' },
      iridescenceIOR: { value: SHOWCASE_PRESETS[0].metal.iridescenceIOR, min: 1.0, max: 2.33, step: 0.01, label: '干渉屈折率 (IOR)' },
      clearcoat: { value: SHOWCASE_PRESETS[0].metal.clearcoat, min: 0.0, max: 1.0, step: 0.01, label: 'クリアコート' },
      anisotropy: { value: SHOWCASE_PRESETS[0].metal.anisotropy, min: 0.0, max: 1.0, step: 0.01, label: '異方性反射' },
      causticGlow: { value: SHOWCASE_PRESETS[0].metal.causticGlow, min: 0.0, max: 1.0, step: 0.01, label: '干渉発光 (Glow)' },
      glowColor: { value: SHOWCASE_PRESETS[0].metal.glowColor, label: '発光カラー' },
      autoColor: { value: SHOWCASE_PRESETS[0].metal.autoColor, label: '色を自動循環' },
      colorSpeed: { value: SHOWCASE_PRESETS[0].metal.colorSpeed, min: 0.01, max: 0.5, step: 0.01, label: '色の変化スピード' },
      color: { value: SHOWCASE_PRESETS[0].metal.color, label: 'ベースカラー' },
    }),
    { collapsed: true }
  )

  // 3. Post-processing & Navier-Stokes Fluid controls
  const [postControls, setPostControls] = useControls(
    '3. Post & Fluid FX (ナビエ・ストークス渦・光学効果)',
    () => ({
      enabled: { value: SHOWCASE_PRESETS[0].post.enabled, label: 'ポストエフェクト有効' },
      fluidEnabled: { value: SHOWCASE_PRESETS[0].post.fluidEnabled, label: '流体カーソル渦 (Fluid)' },
      fluidIntensity: { value: SHOWCASE_PRESETS[0].post.fluidIntensity, min: 0.0, max: 8.0, step: 0.1, label: '流体強度' },
      fluidDistortion: { value: SHOWCASE_PRESETS[0].post.fluidDistortion, min: 0.0, max: 4.0, step: 0.1, label: '流体屈折歪み' },
      fluidCurl: { value: SHOWCASE_PRESETS[0].post.fluidCurl, min: 0.0, max: 25.0, step: 0.5, label: '流体の渦度 (Vorticity)' },
      fluidRadius: { value: SHOWCASE_PRESETS[0].post.fluidRadius, min: 0.05, max: 0.6, step: 0.01, label: '流体半径' },
      fluidRainbow: { value: SHOWCASE_PRESETS[0].post.fluidRainbow, label: '虹色流体分散' },
      bloomIntensity: { value: SHOWCASE_PRESETS[0].post.bloomIntensity, min: 0.0, max: 3.0, step: 0.05, label: 'Bloom 強度' },
      bloomThreshold: { value: SHOWCASE_PRESETS[0].post.bloomThreshold, min: 0.0, max: 1.5, step: 0.02, label: 'Bloom 閾値' },
      chromaticAberration: { value: SHOWCASE_PRESETS[0].post.chromaticAberration, min: 0.0, max: 0.01, step: 0.0002, label: '色収差 (RGB Shift)' },
      vignetteDarkness: { value: SHOWCASE_PRESETS[0].post.vignetteDarkness, min: 0.0, max: 1.0, step: 0.05, label: '周辺減光 (Vignette)' },
    }),
    { collapsed: true }
  )

  const applyPreset = useCallback(
    (preset: ShowcasePreset) => {
      setActivePresetId(preset.id)
      setEnvControls({
        mode: preset.mode,
        preset: preset.envPreset,
        background: preset.background,
      })
      setMetalControls(preset.metal)
      setPostControls(preset.post)
    },
    [setEnvControls, setMetalControls, setPostControls]
  )

  // Quick preset buttons inside Leva's top folder as well
  useControls(
    '✨ プリセット切替 (Quick Presets)',
    () => ({
      '🌊 水銀ミラー (Navier-Stokes + FBM)': button(() => applyPreset(SHOWCASE_PRESETS[0])),
      '🫧 融合メタボール (MarchingCubes)': button(() => applyPreset(SHOWCASE_PRESETS[1])),
      '🌀 カール磁性流体 (3D Curl Noise)': button(() => applyPreset(SHOWCASE_PRESETS[2])),
      '🌈 構造色オイルスリック (Iridescence)': button(() => applyPreset(SHOWCASE_PRESETS[3])),
      '⚡ 音波共鳴コースティクス (Ripples + Glow)': button(() => applyPreset(SHOWCASE_PRESETS[4])),
    }),
    [applyPreset]
  )

  const aberrationOffset = useMemo(
    () => new THREE.Vector2(postControls.chromaticAberration, postControls.chromaticAberration),
    [postControls.chromaticAberration]
  )

  const currentPresetIndex = useRef(0)

  useEffect(() => {
    if (!envControls.autoSwitch) return

    const intervalId = setInterval(() => {
      currentPresetIndex.current = (currentPresetIndex.current + 1) % PRESETS.length
      const nextPreset = PRESETS[currentPresetIndex.current]
      setEnvControls({ preset: nextPreset })
    }, envControls.switchInterval * 1000)

    return () => clearInterval(intervalId)
  }, [envControls.autoSwitch, envControls.switchInterval, setEnvControls])

  const currentMode = envControls.mode as DisplayMode
  const is3DObjectMode = currentMode === 'sphere' || currentMode === 'metaballs'

  return (
    <div className="app-container">
      <Leva collapsed />

      {/* On-screen One-Click Preset Switcher Dock */}
      <div className="preset-dock">
        <div className="preset-header">
          <div className="preset-info">
            <span className="tech-badge">{activePreset.techBadge}</span>
            <span className="preset-subtitle">{activePreset.subtitle}</span>
          </div>
          <div className="mode-pills">
            {(
              [
                { id: 'fullscreen', label: '全画面' },
                { id: 'sphere', label: '球体' },
                { id: 'metaballs', label: 'メタボール' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                className={`mode-pill ${currentMode === m.id ? 'active' : ''}`}
                onClick={() => setEnvControls({ mode: m.id })}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="preset-buttons">
          {SHOWCASE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`preset-btn ${activePresetId === preset.id ? 'active' : ''}`}
              onClick={() => applyPreset(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        <CameraReset mode={currentMode} />
        <color attach="background" args={['#090a0f']} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />

        <group position={is3DObjectMode ? [0, 0.35, 0] : [0, 0, 0]}>
          <MorphingEnvironment
            preset={envControls.preset as EnvPresetType}
            background={envControls.background}
            crossfadeDuration={envControls.crossfadeDuration}
            mode={currentMode}
            metalControls={metalControls as unknown as LiquidMetalControls}
          />
        </group>

        {is3DObjectMode && (
          <ContactShadows
            position={[0, -1.35, 0]}
            opacity={0.45}
            scale={8}
            blur={1.8}
            far={6}
            resolution={256}
            frames={1}
          />
        )}

        <OrbitControls
          makeDefault
          autoRotate={currentMode === 'sphere'}
          autoRotateSpeed={0.5}
          enabled={is3DObjectMode}
        />

        {postControls.enabled && (
          <EffectComposer multisampling={0}>
            <Fluid
              intensity={postControls.fluidEnabled ? postControls.fluidIntensity : 0}
              distortion={postControls.fluidEnabled ? postControls.fluidDistortion : 0}
              curl={postControls.fluidCurl}
              radius={postControls.fluidRadius}
              swirl={4}
              pressure={0.8}
              densityDissipation={0.96}
              velocityDissipation={0.98}
              rainbow={postControls.fluidRainbow}
              fluidColor="#38bdf8"
              showBackground={false}
              blend={postControls.fluidRainbow ? 3.5 : 0.0}
            />
            <Bloom
              intensity={postControls.bloomIntensity}
              luminanceThreshold={postControls.bloomThreshold}
              luminanceSmoothing={0.4}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={aberrationOffset}
              radialModulation={true}
              modulationOffset={0.35}
            />
            <Vignette
              offset={0.25}
              darkness={postControls.vignetteDarkness}
              blendFunction={BlendFunction.NORMAL}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}

export default App
