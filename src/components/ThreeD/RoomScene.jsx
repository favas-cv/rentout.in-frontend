import React, { Suspense, useState, useMemo, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows, Environment, PerspectiveCamera, DragControls } from '@react-three/drei';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Separate component for the actual GLTF to handle suspense and errors
const GLTFModel = ({ url, position, rotation, scale }) => {
  const { scene } = useGLTF(url);
  // Clone the scene so multiple instances can exist
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    />
  );
};

// Wrapper to handle potential 404s or loading errors for individual models
const Model = ({ url, name, ...props }) => {
  return (
    <ErrorBoundary fallback={
      <mesh position={props.position}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ef4444" wireframe />
      </mesh>
    }>
      <Suspense fallback={
        <mesh position={props.position}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#635465" transparent opacity={0.3} />
        </mesh>
      }>
        <GLTFModel url={url} {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};


const RoomStructure = () => {
  return (
    <group>
      {/* Wood Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#d1b08c" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#f8f1e5" roughness={1} />
      </mesh>

      {/* Main Walls */}
      <mesh position={[0, 4, -10]} receiveShadow>
        <boxGeometry args={[20, 8, 0.1]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[-10, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 8, 0.1]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>

      {/* Subtle Ambient Lighting */}
      <hemisphereLight intensity={0.5} color="#ffffff" groundColor="#d1b08c" />
    </group>
  );
};

const RoomScene = ({ items = [] }) => {
  // If items prop is provided but empty, we still want to show the test models 
  // if the user is in "test mode" or just starting out.
  // But usually, we should show what's passed.

  // Let's ensure we have at least the sofa, bed, and flower if nothing is passed
  const displayItems = items.length > 0 ? items : [
    { name: 'sofa', url: '/models/sofa.glb', position: [0, 0, 0] },
    { name: 'bed', url: '/models/bed', position: [-3, 0, -3] },
    { name: 'flower', url: '/models/flower', position: [2, 0, 2] }
  ];

  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl relative">
      <Canvas shadows="pcf" camera={{ position: [8, 8, 8], fov: 40 }}>
        <color attach="background" args={['#f8fafc']} />
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <spotLight position={[-10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />

        <Suspense fallback={null}>
          <RoomStructure />

          {displayItems.map((item, index) => (
            <DragControls key={`${item.id || item.name}-${index}`}>
              <Model
                url={item.url}
                name={item.name}
                position={item.position}
                scale={item.scale || 1}
              />
            </DragControls>
          ))}

          <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.2} far={10} color="#000000" />
        </Suspense>

        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <Environment preset="city" />
      </Canvas>

      {/* Floating UI */}
      <div className="absolute top-6 left-6 bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/50 shadow-lg pointer-events-none">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Interactive 3D Room
        </h3>
        <p className="text-[10px] text-slate-500 mt-1">Arranging {displayItems.length} items</p>
      </div>
    </div>
  );
};

export default RoomScene;
