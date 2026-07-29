import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import ExperienceLayer from "../effects/ExperienceLayer";

const fragmentShader = `
  uniform float u_time;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Vibrant fluid math calculations
    vec2 p = uv * 2.0 - 1.0;
    float t = u_time * 0.4;
    
    float r = sin(p.x * 4.0 + t) * 0.5 + 0.5;
    float g = sin(p.y * 3.0 + t * 1.2) * 0.5 + 0.5;
    float b = sin((p.x + p.y) * 5.0 - t * 0.8) * 0.5 + 0.5;
    
    // Vibrant neon palette mixed with deep background tones
    vec3 color = vec3(r * 0.8 + 0.2, g * 0.3, b * 0.9);
    
    // Add glowing ripples
    color += vec3(0.2, 0.6, 1.0) * (sin(p.y * 12.0 + t * 2.0) * 0.15);
    
    gl_FragColor = vec4(color, 0.45); // 45% opacity for seamless glass integration
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ShaderPlane = () => {
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      {/* Plane scaled up to ensure it covers the entire viewport */}
      <planeGeometry args={[15, 15, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          u_time: { value: 0 },
        }}
        transparent={true}
      />
    </mesh>
  );
};

const ArchiveBackground = () => {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen bg-black/10">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <ShaderPlane />
        </Canvas>
      </div>
      <ExperienceLayer />
    </>
  );
};

export default ArchiveBackground;
