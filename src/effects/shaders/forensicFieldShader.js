/* ═══════════════════════════════════════════════════
   VeriProof — Forensic Field Shader v6.0
   Dual-mode: Frosted contour (light) + Dot grid (dark)
   ═══════════════════════════════════════════════════ */

export const vertexShader = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const fragmentShader = `
  precision mediump float;

  uniform vec2  u_resolution;
  uniform vec2  u_pointer;
  uniform float u_time;
  uniform float u_scroll;
  uniform float u_opacity;
  uniform float u_grid;
  uniform float u_pulse;
  uniform float u_mode;  // 0.0 = dark (dot grid), 1.0 = light (contour fog)

  uniform vec3  u_bgA;
  uniform vec3  u_bgB;
  uniform vec3  u_signal;
  uniform vec3  u_accent;
  uniform vec3  u_particle;

  /* ── Pseudo-random hash ── */
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  /* ── Value noise ── */
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  /* ── Fractal Brownian Motion ── */
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  /* ── Contour line — resolution-scaled edge softness ── */
  float contourLine(float field, float spacing, float thickness) {
    float lines = fract(field / spacing);
    float edge = 1.0 / max(u_resolution.x, 800.0) * 6.0;
    return smoothstep(thickness + edge, thickness - edge, abs(lines - 0.5));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    float t = u_time * 1.0;

    /* ── Pointer normalized ── */
    vec2 pNorm = u_pointer / u_resolution;
    float cursorDist = length((uv - pNorm) * aspect);

    /* ── Vignette ── */
    float vignette = 1.0 - length((uv - 0.5) * 1.4);
    vignette = smoothstep(0.0, 1.0, vignette);

    /* ── Background gradient ── */
    vec3 bg = mix(u_bgA, u_bgB, uv.y * 0.6 + fbm(uv * 2.0 + t * 0.2) * 0.25);

    /* ════════════════════════════════════════════
       LIGHT MODE — Icy Verification Aurora Atmosphere
       Tiffany Blue + Light Green + Rose Gold Wave Contrast
       ════════════════════════════════════════════ */
    if (u_mode > 0.5) {

      /* ── Layer 1: Topographic aurora curves (Tiffany Blue) ── */
      vec2 contourUV = uv * aspect * 2.8;
      float field1 = fbm(contourUV + vec2(t * 0.35, t * 0.20));
      float field2 = fbm(contourUV * 1.3 + vec2(-t * 0.25, t * 0.30) + 40.0);

      // Extract crisp aurora contours
      float contour1 = contourLine(field1, 0.14, 0.44);
      float contour2 = contourLine(field2, 0.18, 0.46);
      float contours = contour1 * 0.45 + contour2 * 0.35;

      float vertFade = smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.80, uv.y);
      contours *= vertFade;

      // Blend Tiffany Blue aurora waves directly
      bg = mix(bg, u_signal, contours * 0.42);

      /* ── Layer 2: Volumetric Tiffany Blue mist depth ── */
      float fog1 = fbm(uv * 1.6 + vec2(t * 0.20, 0.0));
      float fog2 = fbm(uv * 2.2 + vec2(0.0, t * 0.15) + 150.0);
      float fogComposite = fog1 * 0.6 + fog2 * 0.4;

      float radialBloom = smoothstep(0.85, 0.0, length((uv - vec2(0.5, 0.35)) * vec2(1.2, 1.0)));
      float mistLayer = fogComposite * radialBloom * 0.35;
      bg = mix(bg, u_signal, mistLayer);

      // Top Rose Gold mist highlight
      float topBloom = smoothstep(0.5, 0.0, uv.y) * 0.25;
      bg = mix(bg, u_particle, topBloom * fogComposite);

      /* ── Layer 3: Light Green Verification Signal Energy ── */
      float scanPhase = fract(t * 0.25);
      float scanWidth = 0.12;
      float scanLine = smoothstep(scanWidth, 0.0, abs(uv.y - scanPhase)) * 0.25;
      bg = mix(bg, u_accent, scanLine * u_pulse);

      // Light Green ambient energy glow
      float emeraldGlow = fbm(uv * 3.0 + vec2(t * 0.15, t * 0.18));
      float emeraldFade = smoothstep(0.1, 0.5, uv.y) * smoothstep(0.9, 0.5, uv.y);
      bg = mix(bg, u_accent, emeraldGlow * emeraldFade * 0.20);

      /* ── Layer 4: Micro-paper grain ── */
      float grain = hash(uv * u_resolution + fract(t * 13.0));
      bg += grain * 0.005;

      /* ── Layer 5: Cursor proximity glow ── */
      float cursorGlow = smoothstep(0.28, 0.0, cursorDist);
      bg = mix(bg, u_signal, cursorGlow * 0.15);

      /* ── Depth fog (icy Y-blend) ── */
      float depthFog = smoothstep(0.0, 0.6, uv.y) * 0.06;
      bg = mix(bg, u_bgB, depthFog);

      /* ── Soft vignette ── */
      bg *= (0.96 + vignette * 0.04);

    }

    /* ════════════════════════════════════════════
       DARK MODE — 3D Cyber Forensic Field
       Kinetic Wave Grid + Cyber Lasers + Interactive Gravity Well
       ════════════════════════════════════════════ */
    else {

      /* ── 3D Perspective Wave Grid ── */
      vec2 gridCoord = uv * aspect * 32.0;
      
      // Dynamic 3D wave elevation
      float wave = sin(gridCoord.x * 0.4 + t * 1.4) * cos(gridCoord.y * 0.4 + t * 1.1) * 0.5;
      float waveFbm = fbm(uv * aspect * 3.5 + vec2(t * 0.25, -t * 0.18)) * 1.8;
      
      // Interactive 3D cursor gravity distortion
      vec2 cursorDelta = (uv - pNorm) * aspect;
      float cursorGravity = smoothstep(0.45, 0.0, cursorDist);
      vec2 warpedGrid = gridCoord + cursorDelta * cursorGravity * 4.0 + vec2(wave + waveFbm);

      // Grid line computation
      vec2 gridFract = abs(fract(warpedGrid - 0.5) - 0.5) / fwidth(warpedGrid);
      float lineDist = min(gridFract.x, gridFract.y);
      float gridLines = 1.0 - min(lineDist, 1.0);
      
      // Glowing grid intersection nodes (stars)
      vec2 cellPos = fract(warpedGrid) - 0.5;
      float nodeDist = length(cellPos);
      float nodes = smoothstep(0.12, 0.02, nodeDist);

      // Pulse breathing
      float breath = 0.65 + 0.35 * sin(t * 2.0);
      bg += u_accent * gridLines * 0.35 * u_grid * breath;
      bg += u_signal * nodes * 0.60 * u_grid;

      /* ── 3D Topographic Contour Elevation ── */
      float topoField = fbm(uv * aspect * 2.2 + vec2(t * 0.15, t * 0.12));
      float topoContour = contourLine(topoField, 0.16, 0.46);
      bg += u_particle * topoContour * 0.28 * u_pulse;

      /* ── Cyber Laser Scanline ── */
      float scanY = fract(t * 0.12);
      float scanLaser = smoothstep(0.08, 0.0, abs(uv.y - scanY));
      bg += u_signal * scanLaser * 0.35 * u_pulse;

      /* ── Cursor Neon Gravity Halo ── */
      float cursorGlow = smoothstep(0.38, 0.0, cursorDist);
      bg += u_signal * cursorGlow * 0.25;
      bg += u_accent * pow(cursorGlow, 2.0) * 0.30;

      /* ── Floating Cyber Dust Particles ── */
      float particleSeed = hash(floor(warpedGrid * 0.5) + floor(t * 0.8));
      float particles = smoothstep(0.96, 1.0, particleSeed) * nodes;
      bg += u_particle * particles * 0.8;

      /* ── Depth Atmospheric Fog ── */
      float depthFog = smoothstep(0.0, 0.7, uv.y) * 0.22;
      bg = mix(bg, u_bgB, depthFog);

      /* ── Film grain & Vignette ── */
      float grain = hash(uv * u_resolution + fract(t * 19.0)) * 0.025;
      bg += grain;
      bg *= (0.90 + vignette * 0.10);

    }

    /* ── Scroll parallax fade ── */
    float scrollFade = 1.0 - smoothstep(0.0, 3000.0, u_scroll) * 0.15;

    /* ── Final composite ── */
    gl_FragColor = vec4(bg, u_opacity * scrollFade);
  }
`;
