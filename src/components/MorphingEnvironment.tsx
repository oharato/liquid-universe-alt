import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useEnvironment } from '@react-three/drei'
import * as THREE from 'three'
import type { PresetsType } from '@react-three/drei/helpers/environment-assets'
import { LiquidMetal } from './LiquidMetal'
import type { LiquidMetalHandle, LiquidMetalControls } from './LiquidMetal'

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
  metalControls: LiquidMetalControls
}

export const MorphingEnvironment = ({ preset, background, crossfadeDuration, mode, metalControls }: Props) => {
  const [prevPreset, setPrevPreset] = useState<PresetsType>(preset)
  const [currentPreset, setCurrentPreset] = useState<PresetsType>(preset)
  const [prevTexture, setPrevTexture] = useState<THREE.Texture | null>(null)
  const [currentTexture, setCurrentTexture] = useState<THREE.Texture | null>(null)

  // Use ref for the mix value to avoid re-renders every frame
  const mixRef = useRef(1)
  const [transitioning, setTransitioning] = useState(false)

  // Refs for imperative opacity updates
  const prevBgMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const currentBgMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const prevMetalRef = useRef<LiquidMetalHandle>(null)
  const currentMetalRef = useRef<LiquidMetalHandle>(null)

  const handlePrevLoad = useCallback((tex: THREE.Texture) => { setPrevTexture(tex) }, [])
  const handleCurrentLoad = useCallback((tex: THREE.Texture) => { setCurrentTexture(tex) }, [])

  useEffect(() => {
    if (preset !== currentPreset) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrevPreset(currentPreset)
      setPrevTexture(currentTexture)
      setCurrentPreset(preset)
      mixRef.current = 0
      setTransitioning(true)
    }
  }, [preset, currentPreset, currentTexture])

  useFrame((_, delta) => {
    if (mixRef.current < 1) {
      mixRef.current = Math.min(mixRef.current + delta / crossfadeDuration, 1)
      const m = mixRef.current

      // Update background materials imperatively
      if (prevBgMatRef.current) {
        prevBgMatRef.current.opacity = 1 - m
      }
      if (currentBgMatRef.current) {
        currentBgMatRef.current.opacity = m
        currentBgMatRef.current.depthWrite = m >= 1
      }

      // Update metal opacities imperatively
      if (prevMetalRef.current) {
        prevMetalRef.current.setOpacity(1 - m)
      }
      if (currentMetalRef.current) {
        currentMetalRef.current.setOpacity(m)
      }

      // When transition completes, trigger one final re-render to unmount prev meshes
      if (m >= 1 && transitioning) {
        setTransitioning(false)
      }
    }
  })

  return (
    <>
      <Suspense fallback={null}>
        <EnvLoader preset={prevPreset} onLoad={handlePrevLoad} />
        <EnvLoader preset={currentPreset} onLoad={handleCurrentLoad} />
      </Suspense>

      {/* Background spheres */}
      {background && transitioning && prevTexture && (
        <mesh scale={100} renderOrder={-2}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial 
            ref={prevBgMatRef}
            map={prevTexture} 
            side={THREE.BackSide} 
            transparent 
            opacity={1} 
            depthWrite={false}
          />
        </mesh>
      )}
      {background && currentTexture && (
        <mesh scale={100} renderOrder={-1}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial 
            ref={currentBgMatRef}
            map={currentTexture} 
            side={THREE.BackSide} 
            transparent={transitioning}
            opacity={transitioning ? 0 : 1} 
            depthWrite={!transitioning}
          />
        </mesh>
      )}

      {/* Two overlapping LiquidMetals with crossfading opacities */}
      {transitioning && prevTexture && (
        <LiquidMetal
          ref={prevMetalRef}
          envMap={prevTexture} 
          opacity={1} 
          transparent={true} 
          depthWrite={false} 
          mode={mode}
          controls={metalControls}
          renderOrder={0}
        />
      )}
      {currentTexture && (
        <LiquidMetal
          ref={currentMetalRef}
          envMap={currentTexture} 
          opacity={transitioning ? 0 : 1} 
          transparent={transitioning} 
          depthWrite={!transitioning} 
          mode={mode}
          controls={metalControls}
          renderOrder={1}
        />
      )}
    </>
  )
}
