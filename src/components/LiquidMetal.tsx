import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import CustomShaderMaterial from 'three-custom-shader-material'
import { useControls } from 'leva'
import { vertexShader } from '../shaders/LiquidMetalShaders'

interface Props {
  envMap: THREE.Texture | null
  opacity?: number
  transparent?: boolean
  depthWrite?: boolean
  mode?: 'sphere' | 'fullscreen'
}

export const LiquidMetal = ({ envMap, opacity = 1, transparent = false, depthWrite = true, mode = 'sphere' }: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRef = useRef<any>(null!)
  const { viewport } = useThree()

  // Leva controls for real-time tweaking
  const controls = useControls('Liquid Metal', {
    speed: { value: 0.2, min: 0.0, max: 2.0, step: 0.01 },
    noiseDensity: { value: 1.5, min: 0.1, max: 5.0, step: 0.1 },
    noiseStrength: { value: 0.2, min: 0.0, max: 1.0, step: 0.01 },
    roughness: { value: 0.05, min: 0.0, max: 1.0, step: 0.01 },
    metalness: { value: 1.0, min: 0.0, max: 1.0, step: 0.01 },
    autoColor: { value: true, label: '色を自動循環' },
    colorSpeed: { value: 0.05, min: 0.01, max: 0.5, step: 0.01, label: '色の変化スピード' },
    color: '#2538ad',
  }, { collapsed: true })

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
        // Calculate a shifting hue from 0.0 to 1.0
        const hue = (state.clock.getElapsedTime() * controls.colorSpeed) % 1.0
        // Use a fixed saturation and lightness that matches the deep #2538ad aesthetic (S:65%, L:41%)
        materialRef.current.color.setHSL(hue, 0.65, 0.41)
      } else {
        // Revert to the specific color chosen in Leva
        materialRef.current.color.set(controls.color)
      }
    }
  })

  return (
    <mesh castShadow={mode === 'sphere'} receiveShadow={mode === 'sphere'}>
      {/* 
        A high segment count is required for vertex displacement to look smooth. 
      */}
      {mode === 'sphere' ? (
        <sphereGeometry args={[1, 128, 128]} />
      ) : (
        <planeGeometry args={[viewport.width * 2.5, viewport.height * 2.5, 256, 256]} />
      )}
      
      <CustomShaderMaterial
        ref={materialRef}
        baseMaterial={THREE.MeshPhysicalMaterial}
        vertexShader={vertexShader}
        uniforms={uniforms}
        // Environment map for this specific mesh
        envMap={envMap}
        envMapIntensity={1}
        // Transparency controls for crossfading
        opacity={opacity}
        transparent={transparent}
        depthWrite={depthWrite}
        // Properties applied to the base material
        roughness={controls.roughness}
        metalness={controls.metalness}
        reflectivity={1}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
      />
    </mesh>
  )
}
