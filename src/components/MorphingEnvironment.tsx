import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useEnvironment } from '@react-three/drei'
import * as THREE from 'three'
import type { PresetsType } from '@react-three/drei/helpers/environment-assets'
import { LiquidMetal } from './LiquidMetal'
import type { LiquidMetalHandle, LiquidMetalControls, DisplayMode } from './LiquidMetal'

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
  mode: DisplayMode
  metalControls: LiquidMetalControls
}

export const MorphingEnvironment = ({ preset, background, crossfadeDuration, mode, metalControls }: Props) => {
  const [prevTexture, setPrevTexture] = useState<THREE.Texture | null>(null)
  const [currentTexture, setCurrentTexture] = useState<THREE.Texture | null>(null)
  const currentTextureRef = useRef<THREE.Texture | null>(null)

  // Use ref for the mix value to avoid re-renders and shader recompilation stalls
  const mixRef = useRef(1)

  // Refs for imperative opacity & visibility updates
  const prevBgMeshRef = useRef<THREE.Mesh>(null)
  const prevBgMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const currentBgMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const prevMetalRef = useRef<LiquidMetalHandle>(null)
  const currentMetalRef = useRef<LiquidMetalHandle>(null)

  const handleTextureLoad = useCallback((tex: THREE.Texture) => {
    const prev = currentTextureRef.current
    if (!prev) {
      // Initial load
      currentTextureRef.current = tex
      setPrevTexture(tex)
      setCurrentTexture(tex)
      mixRef.current = 1
      return
    }
    if (prev !== tex) {
      // New HDR is loaded and ready — begin crossfade now
      setPrevTexture(prev)
      setCurrentTexture(tex)
      currentTextureRef.current = tex
      mixRef.current = 0

      if (prevBgMeshRef.current) prevBgMeshRef.current.visible = true
      if (prevBgMatRef.current) prevBgMatRef.current.opacity = 1
      if (currentBgMatRef.current) {
        currentBgMatRef.current.opacity = 0
        currentBgMatRef.current.transparent = true
        currentBgMatRef.current.depthWrite = false
      }
      prevMetalRef.current?.setOpacity(1)
      currentMetalRef.current?.setOpacity(0)
    }
  }, [])

  useFrame((_, delta) => {
    if (mixRef.current < 1) {
      mixRef.current = Math.min(mixRef.current + delta / crossfadeDuration, 1)
      const m = mixRef.current

      // Update background materials imperatively
      if (prevBgMeshRef.current) {
        prevBgMeshRef.current.visible = m < 1
      }
      if (prevBgMatRef.current) {
        prevBgMatRef.current.opacity = 1 - m
      }
      if (currentBgMatRef.current) {
        currentBgMatRef.current.opacity = m
        currentBgMatRef.current.transparent = m < 1
        currentBgMatRef.current.depthWrite = m >= 1
      }

      // Update metal opacities & visibility imperatively (keeps shaders compiled in GPU memory)
      prevMetalRef.current?.setOpacity(1 - m)
      currentMetalRef.current?.setOpacity(m)
    }
  })

  return (
    <>
      <Suspense fallback={null}>
        <EnvLoader preset={preset} onLoad={handleTextureLoad} />
      </Suspense>

      {/* Background spheres (kept mounted when background=true to avoid geometry/material churn) */}
      {background && (
        <mesh ref={prevBgMeshRef} scale={100} renderOrder={-2} visible={false}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            ref={prevBgMatRef}
            map={prevTexture ?? currentTexture}
            side={THREE.BackSide}
            transparent
            opacity={0}
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
            transparent={false}
            opacity={1}
            depthWrite={true}
          />
        </mesh>
      )}

      {/* Two persistent LiquidMetal layers — never unmounted during HDR transitions so WebGL shaders never recompile */}
      {currentTexture && (
        <>
          <LiquidMetal
            ref={prevMetalRef}
            envMap={prevTexture ?? currentTexture}
            opacity={0}
            transparent={true}
            depthWrite={false}
            mode={mode}
            controls={metalControls}
            renderOrder={0}
          />
          <LiquidMetal
            ref={currentMetalRef}
            envMap={currentTexture}
            opacity={1}
            transparent={false}
            depthWrite={true}
            mode={mode}
            controls={metalControls}
            renderOrder={1}
          />
        </>
      )}
    </>
  )
}
