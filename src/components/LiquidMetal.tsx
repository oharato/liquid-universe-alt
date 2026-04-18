import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import * as THREE from 'three'
import { vertexShader } from '../shaders/vertex.glsl'
import { fragmentShader } from '../shaders/fragment.glsl'

interface Props {
  mouseRef: React.MutableRefObject<THREE.Vector2>
}

export default function LiquidMetal({ mouseRef }: Props) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const csmRef = useRef<CustomShaderMaterial<typeof THREE.MeshPhysicalMaterial>>(null!)

  const uniforms = useMemo(() => ({
    uTime:      { value: 0 },
    uMouse:     { value: new THREE.Vector2(0, 0) },
    uFrequency: { value: 2.0 },
    uAmplitude: { value: 0.38 }, // dramatic displacement for prominent ring topology
    uSpeed:     { value: 0.32 },
  }), [])

  const csm = useMemo(() => new CustomShaderMaterial({
    baseMaterial: THREE.MeshPhysicalMaterial,
    vertexShader,
    fragmentShader,
    uniforms,
    metalness: 0.0,
    roughness: 1.0,
    envMapIntensity: 0.0,
    // Pure black — all visual interest comes from emissive lines (LED panel)
    color: new THREE.Color(0.0, 0.0, 0.0),
    emissive: new THREE.Color(0.0, 0.0, 0.0),
    // Subtle iridescence for angle shimmer on line edges
    iridescence: 0.30,
    iridescenceIOR: 1.45,
    iridescenceThicknessRange: [100, 600] as [number, number],
    side: THREE.DoubleSide,
  }), [uniforms])

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uMouse.value.lerp(mouseRef.current, 0.06)
  })

  return (
    // face more toward camera; floor-projection-like angle
    <mesh ref={meshRef} material={csm} rotation={[-0.45, 0, 0]}>
      <planeGeometry args={[5.0, 5.0, 128, 128]} />
    </mesh>
  )
}
