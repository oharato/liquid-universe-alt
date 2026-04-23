import { useState, useEffect, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useEnvironment } from '@react-three/drei'
import * as THREE from 'three'
import type { PresetsType } from '@react-three/drei/helpers/environment-assets'
import { LiquidMetal } from './LiquidMetal'

// A small component to load an environment texture and cache it.
const EnvLoader = ({ preset, onLoad }: { preset: PresetsType, onLoad: (tex: THREE.Texture) => void }) => {
  const texture = useEnvironment({ preset })
  useEffect(() => {
    if (texture) onLoad(texture)
  }, [texture, onLoad])
  return null
}

interface Props {
  preset: PresetsType
  background: boolean
  crossfadeDuration: number
  mode: 'sphere' | 'fullscreen'
}

export const MorphingEnvironment = ({ preset, background, crossfadeDuration, mode }: Props) => {
  const [prevPreset, setPrevPreset] = useState<PresetsType>(preset)
  const [currentPreset, setCurrentPreset] = useState<PresetsType>(preset)
  
  const [prevTexture, setPrevTexture] = useState<THREE.Texture | null>(null)
  const [currentTexture, setCurrentTexture] = useState<THREE.Texture | null>(null)
  
  const [mix, setMix] = useState(1) // 1 means fully currentPreset, 0 means fully prevPreset
  
  useEffect(() => {
    if (preset !== currentPreset) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrevPreset(currentPreset)
      setPrevTexture(currentTexture)
      setCurrentPreset(preset)
      setMix(0)
    }
  }, [preset, currentPreset, currentTexture])

  useFrame((_, delta) => {
    // Crossfade calculation based on duration
    if (mix < 1) {
      setMix((m) => Math.min(m + delta / crossfadeDuration, 1))
    }
  })

  return (
    <>
      <Suspense fallback={null}>
        <EnvLoader preset={prevPreset} onLoad={setPrevTexture} />
        <EnvLoader preset={currentPreset} onLoad={setCurrentTexture} />
      </Suspense>

      {/* Render the background spheres if background is true */}
      {background && prevTexture && mix < 1 && (
        <mesh scale={100}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial 
            map={prevTexture} 
            side={THREE.BackSide} 
            transparent 
            opacity={1 - mix} 
            depthWrite={false}
          />
        </mesh>
      )}
      {background && currentTexture && mix > 0 && (
        <mesh scale={100}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial 
            map={currentTexture} 
            side={THREE.BackSide} 
            transparent 
            opacity={mix} 
            depthWrite={mix === 1}
          />
        </mesh>
      )}

      {/* 
        Render two perfectly overlapping LiquidMetals.
        Since they use the exact same uTime, their geometries match perfectly.
        By crossfading their opacities, the reflection morphs seamlessly.
      */}
      {prevTexture && mix < 1 && (
        <group>
          <LiquidMetal 
            envMap={prevTexture} 
            opacity={1 - mix} 
            transparent={true} 
            depthWrite={false} 
            mode={mode}
          />
        </group>
      )}
      {currentTexture && mix > 0 && (
        <group>
          <LiquidMetal 
            envMap={currentTexture} 
            opacity={mix} 
            transparent={mix < 1} 
            depthWrite={mix === 1} 
            mode={mode}
          />
        </group>
      )}
    </>
  )
}
