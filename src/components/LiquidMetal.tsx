import { useRef, useMemo, useImperativeHandle, forwardRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import CustomShaderMaterial from 'three-custom-shader-material'
import { vertexShader } from '../shaders/LiquidMetalShaders'

export interface LiquidMetalControls {
  speed: number
  noiseDensity: number
  noiseStrength: number
  roughness: number
  metalness: number
  autoColor: boolean
  colorSpeed: number
  color: string
}

interface Props {
  envMap: THREE.Texture | null
  opacity?: number
  transparent?: boolean
  depthWrite?: boolean
  mode?: 'sphere' | 'fullscreen'
  controls: LiquidMetalControls
  renderOrder?: number
}

export interface LiquidMetalHandle {
  setOpacity: (v: number) => void
}

export const LiquidMetal = forwardRef<LiquidMetalHandle, Props>(
  ({ envMap, opacity = 1, transparent = false, depthWrite = true, mode = 'sphere', controls, renderOrder = 0 }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const materialRef = useRef<any>(null!)
    const meshRef = useRef<THREE.Mesh>(null!)
    const { viewport } = useThree()

    // Expose imperative handle so parent can update opacity without re-rendering
    useImperativeHandle(ref, () => ({
      setOpacity: (v: number) => {
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
        uSpeed: { value: 0 },
        uNoiseDensity: { value: 0 },
        uNoiseStrength: { value: 0 },
      }),
      []
    )

    useFrame((state) => {
      if (materialRef.current) {
        // Update time uniform
        materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
        // Update other uniforms from controls
        materialRef.current.uniforms.uSpeed.value = controls.speed
        materialRef.current.uniforms.uNoiseDensity.value = controls.noiseDensity
        materialRef.current.uniforms.uNoiseStrength.value = controls.noiseStrength
        
        // Animate color if autoColor is enabled
        if (controls.autoColor) {
          const hue = (state.clock.getElapsedTime() * controls.colorSpeed) % 1.0
          materialRef.current.color.setHSL(hue, 0.65, 0.41)
        } else {
          materialRef.current.color.set(controls.color)
        }
      }
    })

    return (
      <mesh 
        ref={meshRef}
        castShadow={mode === 'sphere'} 
        receiveShadow={mode === 'sphere'}
        renderOrder={renderOrder}
      >
        {mode === 'sphere' ? (
          <sphereGeometry args={[1, 64, 64]} />
        ) : (
          <planeGeometry args={[viewport.width * 2.5, viewport.height * 2.5, 128, 128]} />
        )}
        
        <CustomShaderMaterial
          ref={materialRef}
          baseMaterial={THREE.MeshPhysicalMaterial}
          vertexShader={vertexShader}
          uniforms={uniforms}
          envMap={envMap}
          envMapIntensity={1}
          opacity={opacity}
          transparent={transparent}
          depthWrite={depthWrite}
          roughness={controls.roughness}
          metalness={controls.metalness}
          reflectivity={1}
        />
      </mesh>
    )
  }
)

LiquidMetal.displayName = 'LiquidMetal'
