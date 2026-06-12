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
    float t = u_time * 0.1;

    /* ── Pointer normalized ── */
    vec2 pNorm = u_pointer / u_resolution;
    float cursorDist = length((uv - pNorm) * aspect);

    /* ── Vignette ── */
    float vignette = 1.0 - length((uv - 0.5) * 1.4);
    vignette = smoothstep(0.0, 1.0, vignette);

    /* ── Background gradient ── */
    vec3 bg = mix(u_bgA, u_bgB, uv.y * 0.6 + fbm(uv * 2.0 + t * 0.2) * 0.25);

    /* ════════════════════════════════════════════
       LIGHT MODE — Frosted forensic atmosphere
       Contour field + volumetric fog + signal trails
       ════════════════════════════════════════════ */
    if (u_mode > 0.5) {

      /* ── Layer 1: Topographic contour field ── */
      // Primary contour — slow flowing organic curves
      vec2 contourUV = uv * aspect * 3.2;
      float field1 = fbm(contourUV + vec2(t * 0.15, t * 0.08));
      float field2 = fbm(contourUV * 1.4 + vec2(-t * 0.1, t * 0.12) + 50.0);

      // Extract contour lines at different scales
      float contour1 = contourLine(field1, 0.12, 0.42);
      float contour2 = contourLine(field2, 0.16, 0.44);
      float contour3 = contourLine(field1 + field2 * 0.5, 0.22, 0.46);

      // Composite contours with varying intensity
      float contours = contour1 * 0.35 + contour2 * 0.25 + contour3 * 0.15;

      // Fade contours based on vertical position (stronger in middle)
      float vertFade = smoothstep(0.0, 0.25, uv.y) * smoothstep(1.0, 0.7, uv.y);
      contours *= vertFade;

      // Apply contour color — ice blue tint
      bg += u_accent * contours * 0.18;

      /* ── Layer 2: Volumetric fog / mist depth ── */
      float fog1 = fbm(uv * 1.8 + vec2(t * 0.06, 0.0));
      float fog2 = fbm(uv * 2.5 + vec2(0.0, t * 0.04) + 200.0);
      float fogComposite = fog1 * 0.6 + fog2 * 0.4;

      // Radial atmospheric bloom from center
      float radialBloom = smoothstep(0.8, 0.0, length((uv - vec2(0.5, 0.4)) * vec2(1.2, 1.0)));
      float mistLayer = fogComposite * radialBloom * 0.08;

      bg += u_signal * mistLayer;

      // Additional top-area ice bloom
      float topBloom = smoothstep(0.6, 0.0, uv.y) * 0.04;
      bg += u_particle * topBloom * fogComposite;

      /* ── Layer 3: Verification signal trails ── */
      // Slow horizontal scanner sweep
      float scanPhase = fract(t * 0.05);
      float scanWidth = 0.08;
      float scanLine = smoothstep(scanWidth, 0.0, abs(uv.y - scanPhase)) * 0.06;
      bg += u_signal * scanLine * u_pulse;

      // Diagonal evidence trace
      float trace = sin((uv.x + uv.y) * 18.0 + t * 0.8) * 0.5 + 0.5;
      trace = smoothstep(0.48, 0.5, trace) * 0.025;
      float traceFade = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.8, uv.y);
      bg += u_accent * trace * traceFade;

      /* ── Layer 4: Paper grain texture ── */
      float grain = hash(uv * u_resolution + fract(t * 19.0));
      float grainFine = hash(uv * u_resolution * 2.0 + fract(t * 7.0));
      bg += (grain * 0.008 + grainFine * 0.005);

      /* ── Layer 5: Cursor proximity — soft local glow ── */
      float cursorGlow = smoothstep(0.32, 0.0, cursorDist);
      bg += u_accent * cursorGlow * 0.035;

      // Cursor reveals nearby contours more strongly
      float cursorReveal = smoothstep(0.4, 0.0, cursorDist);
      bg += u_accent * contours * cursorReveal * 0.08;

      /* ── Depth fog (atmospheric Y-fade) ── */
      float depthFog = smoothstep(0.0, 0.5, uv.y) * 0.08;
      bg = mix(bg, u_bgB, depthFog);

      /* ── Vignette — softer for light ── */
      bg *= (0.95 + vignette * 0.05);

    }

    /* ════════════════════════════════════════════
       DARK MODE — Original dot grid (UNTOUCHED)
       ════════════════════════════════════════════ */
    else {

      /* ── Dot grid ── */
      vec2 gridUV = uv * aspect * 42.0;
      vec2 gridCell = fract(gridUV) - 0.5;
      float dotDist = length(gridCell);
      float dot = smoothstep(0.08, 0.04, dotDist);

      float gridBreath = 0.4 + 0.2 * sin(t * 1.6);
      dot *= u_grid * gridBreath;

      float cursorField = smoothstep(0.35, 0.0, cursorDist);
      dot *= (1.0 + cursorField * 3.0);

      bg += u_accent * dot * 0.6;

      /* ── Signal wave ── */
      float scanY = fract(t * 0.08 + uv.x * 0.1);
      float scanLine = smoothstep(0.0, 0.003, abs(uv.y - scanY));
      scanLine = 1.0 - scanLine;
      bg += u_signal * scanLine * 0.15 * u_pulse;

      /* ── Depth fog ── */
      float fog = smoothstep(0.0, 0.6, uv.y) * 0.15;
      bg = mix(bg, u_bgB, fog);

      /* ── Film grain ── */
      float grain = hash(uv * u_resolution + fract(t * 17.0)) * 0.02;
      bg += grain;

      /* ── Organic noise ── */
      float organic = fbm(uv * 6.0 + t * 0.2) * 0.03;
      bg += organic * u_accent;

      /* ── Cursor glow ── */
      float glow = smoothstep(0.28, 0.0, cursorDist);
      bg += u_accent * glow * 0.06;

      /* ── Vignette ── */
      bg *= (0.92 + vignette * 0.08);

    }

    /* ── Scroll parallax fade ── */
    float scrollFade = 1.0 - smoothstep(0.0, 3000.0, u_scroll) * 0.15;

    /* ── Final composite ── */
    gl_FragColor = vec4(bg, u_opacity * scrollFade);
  }
`;
