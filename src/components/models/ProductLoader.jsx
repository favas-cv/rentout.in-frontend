import React, { Suspense, useMemo } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { getCategoryScale } from '../../config/modelConfig';

/**
 * Robust Product Loader for Three.js/R3F
 * Handles caching, cloning for multiple instances, and category scaling.
 */
const ProductLoader = ({ 
  url, 
  category = 'default', 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scaleMultiplier = 1, // Additional manual scale if needed
  isSelected = false,
  onClick
}) => {
  const { scene } = useGLTF(url);
  
  // Apply category scale
  const baseScale = getCategoryScale(category);
  const finalScale = baseScale * scaleMultiplier;

  return (
    <group 
      position={position} 
      rotation={rotation} 
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <Clone 
        object={scene} 
        scale={[finalScale, finalScale, finalScale]}
        castShadow 
        receiveShadow 
      />
      
      {/* Selection Highlight */}
      {isSelected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

// Prefetch helper for performance
ProductLoader.prefetch = (url) => useGLTF.preload(url);

export default ProductLoader;
