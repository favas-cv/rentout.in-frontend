import React from 'react';
import { Environment as DreiEnvironment, ContactShadows, useGLTF } from '@react-three/drei';
import { getCategoryRoom } from '../../config/modelConfig';

/**
 * Dynamic Environment System
 * Loads matching HDRIs and room geometry based on product category.
 */
const RoomEnvironment = ({ category = 'default' }) => {
  const roomType = getCategoryRoom(category);

  return (
    <>
      {/* Dynamic HDRI Lighting */}
      <DreiEnvironment 
        preset={roomType === 'office' ? 'city' : 'apartment'} 
        background={false} 
        blur={0.5} 
      />

      {/* Ground Plane with Shadows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color={roomType === 'bedroom' ? '#f1f5f9' : '#e2e8f0'} 
          roughness={0.8} 
          metalness={0.1} 
        />
      </mesh>

      {/* Soft Contact Shadows for realism */}
      <ContactShadows 
        resolution={1024} 
        scale={20} 
        blur={2} 
        opacity={0.25} 
        far={10} 
        color="#000000" 
      />

      {/* Subtle Grid for placement debugging (optional) */}
      <gridHelper args={[20, 20, 0xcccccc, 0xeeeeee]} position={[0, 0, 0]} />
    </>
  );
};

export default RoomEnvironment;
