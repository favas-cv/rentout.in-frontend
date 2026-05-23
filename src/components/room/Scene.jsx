import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';

/**
 * Main 3D Scene setup
 * Optimized for furniture display with correct camera angles.
 */
const Scene = ({ children, cameraPosition = [8, 8, 8] }) => {
  return (
    <Canvas 
      shadows 
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      dpr={[1, 2]} // Performance optimization for high-DPI screens
    >
      <color attach="background" args={['#f8fafc']} />
      
      <PerspectiveCamera makeDefault position={cameraPosition} fov={40} />
      
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      
      <OrbitControls 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.1} 
        enableDamping
        dampingFactor={0.05}
      />

      {children}
    </Canvas>
  );
};

export default Scene;
