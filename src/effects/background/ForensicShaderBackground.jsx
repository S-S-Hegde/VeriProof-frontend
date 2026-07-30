import { useEffect, useRef, useState, Component } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getForensicVisualTokens } from "../theme/forensicThemeTokens";
import { fragmentShader, vertexShader } from "../shaders/forensicFieldShader";

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
};

const createProgram = (gl) => {
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShader));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentShader));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  return program;
};

class ShaderErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.warn("[VeriProof] Shader background failed, falling back gracefully:", error.message);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const ForensicShaderBackgroundInner = () => {
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: -1000, y: -1000 });
  const scrollRef = useRef(0);
  const { theme } = useTheme();
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let gl;
    try {
      gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      });
    } catch {
      setWebglFailed(true);
      return undefined;
    }

    if (!gl) {
      setWebglFailed(true);
      return undefined;
    }

    let frameId = 0;
    let observer;
    let running = true;
    let program;
    let buffer;

    // Enable derivatives extension for fwidth() in contour shader
    gl.getExtension("OES_standard_derivatives");

    try {
      program = createProgram(gl);
      buffer = gl.createBuffer();
    } catch (err) {
      console.warn("[VeriProof] WebGL shader compilation failed:", err.message);
      setWebglFailed(true);
      return undefined;
    }

    const tokens = getForensicVisualTokens(theme);
    const isLight = theme === "light" ? 1.0 : 0.0;
    const locations = {
      position: gl.getAttribLocation(program, "a_position"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      pointer: gl.getUniformLocation(program, "u_pointer"),
      time: gl.getUniformLocation(program, "u_time"),
      scroll: gl.getUniformLocation(program, "u_scroll"),
      opacity: gl.getUniformLocation(program, "u_opacity"),
      grid: gl.getUniformLocation(program, "u_grid"),
      pulse: gl.getUniformLocation(program, "u_pulse"),
      mode: gl.getUniformLocation(program, "u_mode"),
      bgA: gl.getUniformLocation(program, "u_bgA"),
      bgB: gl.getUniformLocation(program, "u_bgB"),
      signal: gl.getUniformLocation(program, "u_signal"),
      accent: gl.getUniformLocation(program, "u_accent"),
      particle: gl.getUniformLocation(program, "u_particle"),
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.floor(window.innerWidth * dpr);
      const height = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        gl.viewport(0, 0, width, height);
      }
    };

    const render = (time) => {
      if (!running) return;
      try {
        resize();
        gl.useProgram(program);
        gl.enableVertexAttribArray(locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(locations.position, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(locations.resolution, canvas.width, canvas.height);
        gl.uniform2f(locations.pointer, pointerRef.current.x, pointerRef.current.y);
        gl.uniform1f(locations.time, time * 0.001);
        gl.uniform1f(locations.scroll, scrollRef.current);
        gl.uniform1f(locations.opacity, tokens.opacity);
        gl.uniform1f(locations.grid, tokens.grid);
        gl.uniform1f(locations.pulse, tokens.pulse);
        gl.uniform1f(locations.mode, isLight);
        gl.uniform3fv(locations.bgA, tokens.bgA);
        gl.uniform3fv(locations.bgB, tokens.bgB);
        gl.uniform3fv(locations.signal, tokens.signal);
        gl.uniform3fv(locations.accent, tokens.accent);
        gl.uniform3fv(locations.particle, tokens.particle);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } catch {
        running = false;
        return;
      }
      frameId = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      // Note: --vp-cursor-x/y CSS vars are set by CursorTracker's rAF loop — no duplication needed here
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running) frameId = window.requestAnimationFrame(render);
      else window.cancelAnimationFrame(frameId);
    });

    observer.observe(canvas);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", resize);
    resize();
    frameId = window.requestAnimationFrame(render);

    return () => {
      running = false;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", resize);
      observer?.disconnect();
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
    };
  }, [theme]);

  if (webglFailed) return null;

  return <canvas ref={canvasRef} className="vp-forensic-canvas fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />;
};

const ForensicShaderBackground = () => (
  <ShaderErrorBoundary>
    <ForensicShaderBackgroundInner />
  </ShaderErrorBoundary>
);

export default ForensicShaderBackground;
