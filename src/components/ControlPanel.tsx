import { useState } from 'react'
import type { SceneParams } from '../types/params'

interface Props {
  params: SceneParams
  onChange: (key: keyof SceneParams, value: number) => void
}

interface SliderDef {
  key: keyof SceneParams
  label: string
  min: number
  max: number
  step: number
}

const SLIDERS: SliderDef[] = [
  { key: 'frequency',      label: 'Frequency',       min: 0.5,  max: 6.0,  step: 0.1  },
  { key: 'amplitude',      label: 'Amplitude',       min: 0.05, max: 0.80, step: 0.01 },
  { key: 'speed',          label: 'Speed',           min: 0.02, max: 1.20, step: 0.01 },
  { key: 'contourFreq',    label: 'Contour Bands',   min: 2,    max: 24,   step: 0.5  },
  { key: 'lineEdge',       label: 'Line Width',      min: 0.005,max: 0.08, step: 0.002},
  { key: 'bloomIntensity', label: 'Bloom Intensity', min: 0,    max: 5.0,  step: 0.1  },
  { key: 'bloomThreshold', label: 'Bloom Threshold', min: 0.4,  max: 1.0,  step: 0.01 },
]

export default function ControlPanel({ params, onChange }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      zIndex: 100,
      fontFamily: 'monospace',
      fontSize: 12,
      color: '#00e5ff',
      userSelect: 'none',
    }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'block',
          marginLeft: 'auto',
          marginBottom: 6,
          background: 'rgba(0,0,0,0.75)',
          border: '1px solid rgba(0,229,255,0.45)',
          borderRadius: 4,
          color: '#00e5ff',
          fontFamily: 'monospace',
          fontSize: 11,
          padding: '3px 10px',
          cursor: 'pointer',
          letterSpacing: '0.08em',
        }}
      >
        {open ? '▲ PARAMS' : '▼ PARAMS'}
      </button>

      {open && (
        <div style={{
          background: 'rgba(0,0,0,0.78)',
          border: '1px solid rgba(0,229,255,0.30)',
          borderRadius: 6,
          padding: '12px 14px',
          backdropFilter: 'blur(8px)',
          width: 230,
        }}>
          {SLIDERS.map(({ key, label, min, max, step }) => {
            const val = params[key]
            return (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 3,
                  opacity: 0.85,
                }}>
                  <span>{label}</span>
                  <span style={{ color: '#fff', minWidth: 36, textAlign: 'right' }}>
                    {typeof val === 'number' ? val.toFixed(step < 0.01 ? 3 : step < 0.1 ? 2 : 1) : val}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={val as number}
                  onChange={e => onChange(key, parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: '#00e5ff',
                    cursor: 'pointer',
                    height: 4,
                  }}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
