import React, { Suspense, useState } from 'react';
import Scene from './Scene';
import RoomEnvironment from './Environment';
import ProductLoader from '../models/ProductLoader';
import TransformControls from './TransformControls';
import ConfiguratorUI from '../ui/ConfiguratorUI';

/**
 * High-level Room Configurator component
 * Manages state for multiple products and interactions.
 */
const RoomViewer = ({ initialProducts = [] }) => {
  const [products, setProducts] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState(null);

  const handleUpdateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleDeleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setSelectedId(null);
  };

  const selectedProduct = products.find(p => p.id === selectedId);

  return (
    <div className="relative w-full h-[700px] bg-white rounded-3xl shadow-inner overflow-hidden border border-slate-200">
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Room...</div>}>
        <Scene>
          <RoomEnvironment category={selectedProduct?.category} />
          
          {products.map((product) => (
            <TransformControls 
              key={product.id}
              onDragStart={() => setSelectedId(product.id)}
            >
              <ProductLoader
                url={product.url}
                category={product.category}
                position={product.position}
                rotation={product.rotation}
                scaleMultiplier={product.scaleMultiplier}
                isSelected={selectedId === product.id}
                onClick={() => setSelectedId(product.id)}
              />
            </TransformControls>
          ))}
        </Scene>
      </Suspense>

      {/* Control UI Overlay */}
      <ConfiguratorUI 
        selectedProduct={selectedProduct}
        onUpdate={(updates) => handleUpdateProduct(selectedId, updates)}
        onDelete={() => handleDeleteProduct(selectedId)}
        onAdd={() => {/* Future implementation */}}
      />

      {/* Help Hint */}
      {!selectedId && products.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/80 px-4 py-2 rounded-full text-xs text-slate-500 shadow-sm pointer-events-none">
          Click an item to configure
        </div>
      )}
    </div>
  );
};

export default RoomViewer;
