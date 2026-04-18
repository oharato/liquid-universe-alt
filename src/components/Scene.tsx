import { useRef } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import LiquidMetal from './LiquidMetal'
import { useMouseTracker } from '../hooks/useMouse'

export default function Scene() {
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0))
  useMouseTracker(mouseRef)

  return (
    <>
      <LiquidMetal mouseRef={mouseRef} />
      {/* Bloom: lines glow like lit display — threshold tuned so only bright lines bloom */}
      <EffectComposer>
        <Bloom
          intensity={1.6}
          luminanceThreshold={0.80}
          luminanceSmoothing={0.15}
          blendFunction={BlendFunction.ADD}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}
