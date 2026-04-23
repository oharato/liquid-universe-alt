import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, ContactShadows } from '@react-three/drei'
import { useControls } from 'leva'
import { LiquidMetal } from './components/LiquidMetal'
import './App.css'

type PresetType = "apartment" | "city" | "dawn" | "forest" | "lobby" | "night" | "park" | "studio" | "sunset" | "warehouse";

function App() {
  // Leva controls for Environment maps (Reflections)
  const envControls = useControls('Environment (反射する写真)', {
    preset: {
      options: {
        '都市 (City)': 'city',
        '夕暮れ (Sunset)': 'sunset',
        '夜明け (Dawn)': 'dawn',
        '夜 (Night)': 'night',
        '倉庫 (Warehouse)': 'warehouse',
        '森 (Forest)': 'forest',
        '部屋 (Apartment)': 'apartment',
        'スタジオ (Studio)': 'studio',
        'ロビー (Lobby)': 'lobby',
        '公園 (Park)': 'park',
      },
      value: 'city'
    },
    background: { value: true, label: '背景として表示' },
    blur: { value: 0.8, min: 0, max: 1, step: 0.01, label: '背景のぼかし' }
  })

  return (
    <div className="app-container">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <color attach="background" args={['#111111']} />
        
        {/* Environment is critical for metal materials to look correct */}
        <Environment 
          preset={envControls.preset as PresetType} 
          background={envControls.background} 
          blur={envControls.blur} 
        />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <group position={[0, 0.2, 0]}>
          <LiquidMetal />
        </group>

        {/* Adds a nice subtle ground shadow */}
        <ContactShadows 
          position={[0, -1.2, 0]} 
          opacity={0.5} 
          scale={10} 
          blur={1.5} 
          far={10} 
        />

        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}

export default App
