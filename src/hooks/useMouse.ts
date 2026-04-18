import { useEffect } from 'react'
import * as THREE from 'three'

/**
 * Tracks normalised device coordinates (-1..1) from mousemove events.
 * Writes directly into the provided ref to avoid re-renders.
 */
export function useMouseTracker(ref: React.MutableRefObject<THREE.Vector2>) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      ref.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      )
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [ref])
}
