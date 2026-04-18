import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useCallback } from 'react'
import Scene from './components/Scene'
import ControlPanel from './components/ControlPanel'
import { DEFAULT_PARAMS } from './types/params'
import type { SceneParams } from './types/params'

export default function App() {
  const [params, setParams] = useState<SceneParams>(DEFAULT_PARAMS)

  const handleChange = useCallback((key: keyof SceneParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          <Scene params={params} />
        </Suspense>
      </Canvas>
      <ControlPanel params={params} onChange={handleChange} />
    </div>
  )
}
