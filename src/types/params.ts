export interface SceneParams {
  // Mesh / shader
  frequency:   number   // uFrequency: noise spatial scale
  amplitude:   number   // uAmplitude: displacement height
  speed:       number   // uSpeed: animation speed
  contourFreq: number   // uContourFreq: number of iso-contour bands
  lineEdge:    number   // uLineEdge: contour line width (0=thin, 0.1=thick)
  // Bloom
  bloomIntensity:  number
  bloomThreshold:  number
}

export const DEFAULT_PARAMS: SceneParams = {
  frequency:       2.0,
  amplitude:       0.38,
  speed:           0.32,
  contourFreq:     8.0,
  lineEdge:        0.022,
  bloomIntensity:  1.6,
  bloomThreshold:  0.80,
}
