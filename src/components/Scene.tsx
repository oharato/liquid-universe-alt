import { useRef } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import LiquidMetal from './LiquidMetal'
import { useMouseTracker } from '../hooks/useMouse'
import type { SceneParams } from '../types/params'

interface Props {
  params: SceneParams
}

export default function Scene({ params }: Props) {
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0))
  useMouseTracker(mouseRef)

  return (
    <>
      <LiquidMetal mouseRef={mouseRef} params={params} />
      <EffectComposer>
        <Bloom
          intensity={params.bloomIntensity}
          luminanceThreshold={params.bloomThreshold}
          luminanceSmoothing={0.15}
          blendFunction={BlendFunction.ADD}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}
