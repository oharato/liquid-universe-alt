import { useRef, useMemo, useEffect, useImperativeHandle, forwardRef, type ComponentRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MarchingCubes } from '@react-three/drei'
import * as THREE from 'three'
import CustomShaderMaterial from 'three-custom-shader-material'
import { vertexShader, fragmentShader } from '../shaders/LiquidMetalShaders'

type MarchingCubesImpl = ComponentRef<typeof MarchingCubes>

export type DisplayMode = 'fullscreen' | 'sphere' | 'metaballs'

export interface LiquidMetalControls {
  speed: number
  noiseDensity: number
  noiseStrength: number
  domainWarp: number
  curlStrength: number
  rippleStrength: number
  mouseStrength: number
  roughness: number
  metalness: number
  iridescence: number
  iridescenceIOR: number
  clearcoat: number
  anisotropy: number
  causticGlow: number
  glowColor: string
  autoColor: boolean
  colorSpeed: number
  color: string
}

interface Props {
  envMap: THREE.Texture | null
  opacity?: number
  transparent?: boolean
  depthWrite?: boolean
  mode?: DisplayMode
  controls: LiquidMetalControls
  renderOrder?: number
}

export interface LiquidMetalHandle {
  setOpacity: (v: number) => void
}

const ORBIT_SEEDS = [
  { speedX: 0.7, speedY: 0.9, speedZ: 0.5, phase: 0.0, radius: 0.20, strength: 0.48 },
  { speedX: -0.8, speedY: 0.6, speedZ: 0.7, phase: 1.2, radius: 0.22, strength: 0.44 },
  { speedX: 0.5, speedY: -0.7, speedZ: 0.9, phase: 2.4, radius: 0.21, strength: 0.42 },
  { speedX: 0.9, speedY: 0.5, speedZ: -0.6, phase: 3.6, radius: 0.23, strength: 0.40 },
  { speedX: -0.6, speedY: -0.8, speedZ: 0.4, phase: 4.8, radius: 0.19, strength: 0.46 },
  { speedX: 0.4, speedY: 1.1, speedZ: -0.8, phase: 5.5, radius: 0.22, strength: 0.38 },
]

function populateMetaballs(
  mc: MarchingCubesImpl | null,
  metaballUniforms: THREE.Vector4[],
  elapsedTime: number,
  speed: number,
  pointerX: number,
  pointerY: number,
  mouseStrength: number
) {
  const t = elapsedTime * (0.65 + speed * 1.35)
  const subtract = 12

  // 1. Central pulsing liquid metal core (centered at 0.5, 0.5, 0.5 in MarchingCubes grid)
  const coreX = 0.5 + Math.sin(t * 0.5) * 0.03
  const coreY = 0.5 + Math.cos(t * 0.4) * 0.03
  const coreZ = 0.5 + Math.sin(t * 0.3) * 0.02
  const coreStrength = 0.68
  if (mc) mc.addBall(coreX, coreY, coreZ, coreStrength, subtract)
  metaballUniforms[0].set(coreX, coreY, coreZ, coreStrength)

  // 2. Six orbiting droplets that smoothly fuse with and split from the core
  for (let i = 0; i < ORBIT_SEEDS.length; i++) {
    const seed = ORBIT_SEEDS[i]
    const pulse = 0.72 + 0.28 * Math.sin(t * 0.85 + seed.phase)
    const r = seed.radius * pulse
    const bx = 0.5 + Math.sin(t * seed.speedX + seed.phase) * r
    const by = 0.5 + Math.cos(t * seed.speedY + seed.phase * 1.3) * r
    const bz = 0.5 + Math.sin(t * seed.speedZ + seed.phase * 0.7) * (r * 0.65)
    if (mc) mc.addBall(bx, by, bz, seed.strength, subtract)
    metaballUniforms[i + 1].set(bx, by, bz, seed.strength)
  }

  // 3. Interactive pointer-controlled droplet
  if (mouseStrength > 0.01) {
    const mx = THREE.MathUtils.clamp(0.5 + pointerX * 0.26, 0.18, 0.82)
    const my = THREE.MathUtils.clamp(0.5 + pointerY * 0.26, 0.18, 0.82)
    const ms = 0.38 + mouseStrength * 0.22
    if (mc) mc.addBall(mx, my, 0.54, ms, subtract)
    metaballUniforms[7].set(mx, my, 0.54, ms)
  } else {
    metaballUniforms[7].set(0.5, 0.5, 0.5, 0.0)
  }
}

export const LiquidMetal = forwardRef<LiquidMetalHandle, Props>(
  ({ envMap, opacity = 1, transparent = false, depthWrite = true, mode = 'sphere', controls, renderOrder = 0 }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const materialRef = useRef<any>(null!)
    const meshRef = useRef<THREE.Mesh>(null!)
    const mcRef = useRef<MarchingCubesImpl>(null!)
    const visibleRef = useRef(opacity > 0.001)
    const smoothMouse = useRef(new THREE.Vector2(0, 0))
    const smoothPointerNorm = useRef(new THREE.Vector2(0, 0))
    const { viewport } = useThree()

    // Expose imperative handle so parent can update opacity & visibility without re-rendering or unmounting
    useImperativeHandle(ref, () => ({
      setOpacity: (v: number) => {
        const isVis = v > 0.001
        visibleRef.current = isVis
        if (meshRef.current) meshRef.current.visible = isVis
        if (mcRef.current) mcRef.current.visible = isVis
        if (materialRef.current) {
          materialRef.current.opacity = v
          materialRef.current.transparent = v < 1
          materialRef.current.depthWrite = v >= 1
        }
      }
    }))

    // Setup uniforms
    const uniforms = useMemo(
      () => ({
        uTime: { value: 0 },
        uSpeed: { value: 0.2 },
        uNoiseDensity: { value: 1.5 },
        uNoiseStrength: { value: 0.2 },
        uDomainWarp: { value: 0.6 },
        uCurlStrength: { value: 0.5 },
        uRippleStrength: { value: 0.35 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseStrength: { value: 0.4 },
        uRoughness: { value: 0.05 },
        uIridescence: { value: 0.65 },
        uCausticGlow: { value: 0.15 },
        uGlowColor: { value: new THREE.Color('#00e5ff') },
        uIsMetaballs: { value: 0 },
        uMetaballs: {
          value: Array.from({ length: 8 }, () => new THREE.Vector4(0.5, 0.5, 0.5, 0)),
        },
      }),
      []
    )

    // Populate initial metaball geometry immediately on mount
    useEffect(() => {
      if (mode === 'metaballs' && mcRef.current) {
        mcRef.current.reset()
        populateMetaballs(
          mcRef.current,
          uniforms.uMetaballs.value,
          0,
          controls.speed,
          0,
          0,
          controls.mouseStrength
        )
        mcRef.current.update()
      }
    }, [mode, controls.speed, controls.mouseStrength, uniforms])

    useFrame((state, delta) => {
      // Skip CPU & GPU updates when this crossfade layer is completely hidden
      if (!visibleRef.current) return

      const lerpFactor = Math.min(1, delta * 8)
      smoothPointerNorm.current.lerp(state.pointer, lerpFactor)

      const scaleX = mode === 'fullscreen' ? viewport.width * 0.5 : 1.2
      const scaleY = mode === 'fullscreen' ? viewport.height * 0.5 : 1.2
      smoothMouse.current.set(
        smoothPointerNorm.current.x * scaleX,
        smoothPointerNorm.current.y * scaleY
      )

      // Update MarchingCubes field & analytical metaball shader uniforms
      if (mode === 'metaballs' && mcRef.current) {
        populateMetaballs(
          mcRef.current,
          uniforms.uMetaballs.value,
          state.clock.getElapsedTime(),
          controls.speed,
          smoothPointerNorm.current.x,
          smoothPointerNorm.current.y,
          controls.mouseStrength
        )
      }

      if (materialRef.current) {
        const u = materialRef.current.uniforms
        u.uTime.value = state.clock.getElapsedTime()
        u.uSpeed.value = controls.speed
        u.uNoiseDensity.value = controls.noiseDensity
        u.uNoiseStrength.value = mode === 'metaballs' ? controls.noiseStrength * 0.18 : controls.noiseStrength
        u.uDomainWarp.value = controls.domainWarp
        u.uCurlStrength.value = controls.curlStrength
        u.uRippleStrength.value = controls.rippleStrength
        u.uMouse.value.copy(smoothMouse.current)
        u.uMouseStrength.value = mode === 'metaballs' ? 0.0 : controls.mouseStrength
        u.uRoughness.value = controls.roughness
        u.uIridescence.value = controls.iridescence
        u.uCausticGlow.value = controls.causticGlow
        u.uGlowColor.value.set(controls.glowColor)
        u.uIsMetaballs.value = mode === 'metaballs' ? 1 : 0

        // Animate base tint color if autoColor is enabled
        if (controls.autoColor) {
          const hue = (state.clock.getElapsedTime() * controls.colorSpeed) % 1.0
          materialRef.current.color.setHSL(hue, 0.55, 0.52)
        } else {
          materialRef.current.color.set(controls.color)
        }
      }
    })

    const sharedMaterial = (
      <CustomShaderMaterial
        ref={materialRef}
        baseMaterial={THREE.MeshPhysicalMaterial}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        envMap={envMap}
        envMapIntensity={1.35}
        opacity={opacity}
        transparent={transparent}
        depthWrite={depthWrite}
        roughness={controls.roughness}
        metalness={controls.metalness}
        iridescence={controls.iridescence}
        iridescenceIOR={controls.iridescenceIOR}
        iridescenceThicknessMinimum={100}
        iridescenceThicknessMaximum={800}
        clearcoat={controls.clearcoat}
        clearcoatRoughness={0.04}
        anisotropy={mode === 'metaballs' ? 0 : controls.anisotropy}
        reflectivity={1}
      />
    )

    if (mode === 'metaballs') {
      return (
        <MarchingCubes
          ref={mcRef}
          resolution={32}
          maxPolyCount={10000}
          enableUvs={true}
          enableColors={false}
          scale={1.8}
          visible={opacity > 0.001}
          renderOrder={renderOrder}
        >
          {sharedMaterial}
        </MarchingCubes>
      )
    }

    return (
      <mesh
        ref={meshRef}
        castShadow={mode === 'sphere'}
        receiveShadow={mode === 'sphere'}
        visible={opacity > 0.001}
        renderOrder={renderOrder}
      >
        {mode === 'sphere' ? (
          <sphereGeometry args={[1, 96, 96]} />
        ) : (
          <planeGeometry args={[viewport.width * 2.5, viewport.height * 2.5, 128, 128]} />
        )}
        {sharedMaterial}
      </mesh>
    )
  }
)

LiquidMetal.displayName = 'LiquidMetal'
