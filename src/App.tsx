import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { useControls, Leva } from 'leva'
import { useEffect, useRef } from 'react'
import { MorphingEnvironment } from './components/MorphingEnvironment'
import './App.css'

type PresetType = "apartment" | "city" | "dawn" | "forest" | "lobby" | "night" | "park" | "studio" | "sunset" | "warehouse";

const PRESETS: PresetType[] = ["city", "sunset", "dawn", "night", "warehouse", "forest", "apartment", "studio", "lobby", "park"];

// Component to reset the camera when switching to fullscreen mode
const CameraReset = ({ mode }: { mode: 'sphere' | 'fullscreen' }) => {
  const { camera } = useThree();
  useEffect(() => {
    if (mode === 'fullscreen') {
      camera.position.set(0, 0, 4);
      camera.rotation.set(0, 0, 0);
      camera.updateProjectionMatrix();
    }
  }, [mode, camera]);
  return null;
};

function App() {
  // Leva controls for Environment maps (Reflections)
  const [envControls, setEnvControls] = useControls('Environment (反射する写真)', () => ({
    mode: {
      options: {
        '球体 (Sphere)': 'sphere',
        '全画面 (Fullscreen)': 'fullscreen'
      },
      value: 'fullscreen',
      label: '表示モード'
    },
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
    autoSwitch: { value: true, label: '自動切り替え' },
    switchInterval: { value: 5, min: 1, max: 20, step: 0.5, label: '切り替え間隔(秒)' },
    crossfadeDuration: { value: 5.0, min: 0.1, max: 10.0, step: 0.1, label: 'フェード時間(秒)' },
    background: { value: false, label: '背景として表示' }
  }))

  const currentPresetIndex = useRef(0);

  useEffect(() => {
    if (!envControls.autoSwitch) return;

    const intervalId = setInterval(() => {
      // Find the next index
      currentPresetIndex.current = (currentPresetIndex.current + 1) % PRESETS.length;
      const nextPreset = PRESETS[currentPresetIndex.current];
      
      // Update Leva control value programmatically
      setEnvControls({ preset: nextPreset });
    }, envControls.switchInterval * 1000);

    return () => clearInterval(intervalId);
  }, [envControls.autoSwitch, envControls.switchInterval, setEnvControls]);

  return (
    <div className="app-container">
      {/* Minimize the Leva UI panel by default */}
      <Leva collapsed />
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <CameraReset mode={envControls.mode as 'sphere' | 'fullscreen'} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Reset group position to center for fullscreen to avoid bottom edge showing */}
        <group position={envControls.mode === 'sphere' ? [0, 0.2, 0] : [0, 0, 0]}>
          {/* MorphingEnvironment handles both the background and the LiquidMetal meshes */}
          <MorphingEnvironment 
            preset={envControls.preset as PresetType} 
            background={envControls.background} 
            crossfadeDuration={envControls.crossfadeDuration}
            mode={envControls.mode as 'sphere' | 'fullscreen'}
          />
        </group>

        {/* Shadows only make sense when we have a floating object */}
        {envControls.mode === 'sphere' && (
          <ContactShadows 
            position={[0, -1.2, 0]} 
            opacity={0.5} 
            scale={10} 
            blur={1.5} 
            far={10} 
          />
        )}

        <OrbitControls 
          makeDefault 
          autoRotate={envControls.mode === 'sphere'} 
          autoRotateSpeed={0.5} 
          enabled={envControls.mode === 'sphere'} 
        />
      </Canvas>
    </div>
  )
}

export default App
