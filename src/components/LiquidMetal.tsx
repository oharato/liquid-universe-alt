import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CustomShaderMaterial from 'three-custom-shader-material'
import { useControls } from 'leva'
import { vertexShader } from '../shaders/LiquidMetalShaders'

export const LiquidMetal = () => {
  const materialRef = useRef<any>(null!)

  // Leva controls for real-time tweaking
  const controls = useControls('Liquid Metal', {
    speed: { value: 0.2, min: 0.0, max: 2.0, step: 0.01 },
    noiseDensity: { value: 1.5, min: 0.1, max: 5.0, step: 0.1 },
    noiseStrength: { value: 0.2, min: 0.0, max: 1.0, step: 0.01 },
    roughness: { value: 0.05, min: 0.0, max: 1.0, step: 0.01 },
    metalness: { value: 1.0, min: 0.0, max: 1.0, step: 0.01 },
    color: '#ffffff',
  })

  // Setup uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: controls.speed },
      uNoiseDensity: { value: controls.noiseDensity },
      uNoiseStrength: { value: controls.noiseStrength },
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
    }
  })

  return (
    <mesh castShadow receiveShadow>
      {/* 
        A high segment count is required for vertex displacement to look smooth. 
        Using 128x128 as recommended.
      */}
      <sphereGeometry args={[1, 128, 128]} />
      
      <CustomShaderMaterial
        ref={materialRef}
        baseMaterial={THREE.MeshPhysicalMaterial}
        vertexShader={vertexShader}
        uniforms={uniforms}
        // Properties applied to the base material
        roughness={controls.roughness}
        metalness={controls.metalness}
        color={controls.color}
        reflectivity={1}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
      />
    </mesh>
  )
}
