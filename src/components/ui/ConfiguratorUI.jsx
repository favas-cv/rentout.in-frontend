import React from 'react';
import { RotateCcw, RotateCw, Trash2, Plus, Maximize2, Minimize2 } from 'lucide-react';

/**
 * Clean UI for Desktop Room Configurator
 * Intuitive controls for rotation, scaling, and deletion.
 */
const ConfiguratorUI = ({ selectedProduct, onUpdate, onDelete, onAdd }) => {
  if (!selectedProduct) return null;

  const handleRotate = (dir) => {
    const currentRotation = selectedProduct.rotation || [0, 0, 0];
    const step = Math.PI / 8;
    onUpdate({ rotation: [currentRotation[0], currentRotation[1] + (dir * step), currentRotation[2]] });
  };

  const handleScale = (dir) => {
    const currentScale = selectedProduct.scaleMultiplier || 1;
    const step = 0.1;
    onUpdate({ scaleMultiplier: Math.max(0.5, currentScale + (dir * step)) });
  };

  return (
    <div className="absolute top-6 right-6 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
      {/* Product Info Card */}
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-white/50 w-64">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {selectedProduct.name || 'Furniture Item'}
            </h3>
            <p className="text-[10px] text-blue-600 font-semibold">{selectedProduct.category}</p>
          </div>
          <button 
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Rotation Controls */}
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">Rotation</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleRotate(-1)}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl text-slate-700 transition-all active:scale-95"
              >
                <RotateCcw size={14} /> <span className="text-[10px] font-bold">LEFT</span>
              </button>
              <button 
                onClick={() => handleRotate(1)}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl text-slate-700 transition-all active:scale-95"
              >
                <RotateCw size={14} /> <span className="text-[10px] font-bold">RIGHT</span>
              </button>
            </div>
          </div>

          {/* Scale Controls */}
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">Sizing</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleScale(-1)}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl text-slate-700 transition-all active:scale-95"
              >
                <Minimize2 size={14} /> <span className="text-[10px] font-bold">SMALLER</span>
              </button>
              <button 
                onClick={() => handleScale(1)}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl text-slate-700 transition-all active:scale-95"
              >
                <Maximize2 size={14} /> <span className="text-[10px] font-bold">LARGER</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
  onClick={onAdd}
  className="self-end w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all active:scale-90"
>
  <Plus size={24} />
</button>
    </div>
  );
};

export default ConfiguratorUI;
