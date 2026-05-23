import React, { useRef, useState } from 'react';
import { DragControls } from '@react-three/drei';

/**
 * User-friendly drag wrapper
 * Prevents orbit controls from interfering while dragging.
 */
const TransformControls = ({ children, onDragStart, onDragEnd }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <DragControls
      onDragStart={() => {
        setIsDragging(true);
        onDragStart?.();
      }}
      onDragEnd={() => {
        setIsDragging(false);
        onDragEnd?.();
      }}
    >
      <group>
        {children}
      </group>
    </DragControls>
  );
};

export default TransformControls;
