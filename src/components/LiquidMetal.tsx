import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import * as THREE from 'three'
import { vertexShader } from '../shaders/vertex.glsl'
import { fragmentShader } from '../shaders/fragment.glsl'
import type { SceneParams } from '../types/params'

interface Props {
  mouseRef: React.MutableRefObject<THREE.Vector2>
  params: SceneParams
}

export default function LiquidMetal({ mouseRef, params }: Props) {
  const meshRef = useRef<THREE.Mesh>(null!)

  const uniforms = useMemo(() => ({
    uTime:        { value: 0 },
    uMouse:       { value: new THREE.Vector2(0, 0) },
    uFrequency:   { value: params.frequency },
    uAmplitude:   { value: params.amplitude },
    uSpeed:       { value: params.speed },
    uContourFreq: { value: params.contourFreq },
    uLineEdge:    { value: params.lineEdge },
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  const csm = useMemo(() => new CustomShaderMaterial({
    baseMaterial: THREE.MeshPhysicalMaterial,
    vertexShader,
    fragmentShader,
    uniforms,
    metalness: 0.0,
    roughness: 1.0,
    envMapIntensity: 0.0,
    color: new THREE.Color(0.0, 0.0, 0.0),
    emissive: new THREE.Color(0.0, 0.0, 0.0),
    iridescence: 0.30,
    iridescenceIOR: 1.45,
    iridescenceThicknessRange: [100, 600] as [number, number],
    side: THREE.DoubleSide,
  }), [uniforms])

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uMouse.value.lerp(mouseRef.current, 0.06)
    // Sync live params every frame (cheap uniform writes)
    uniforms.uFrequency.value   = params.frequency
    uniforms.uAmplitude.value   = params.amplitude
    uniforms.uSpeed.value       = params.speed
    uniforms.uContourFreq.value = params.contourFreq
    uniforms.uLineEdge.value    = params.lineEdge
  })

  return (
    <mesh ref={meshRef} material={csm} rotation={[-0.45, 0, 0]}>
      <planeGeometry args={[5.0, 5.0, 128, 128]} />
    </mesh>
  )
}
