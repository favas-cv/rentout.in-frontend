import React, { useEffect, useRef, useState } from 'react';
import '@google/model-viewer';
import { getCategoryScale } from '../../config/modelConfig';

/**
 * Production-ready AR Viewer using <model-viewer>
 * Supports GLB (Android/Web) and USDZ (iOS)
 * Automatically applies category-based scaling
 */
const ARViewer = ({ 
  modelUrl, 
  usdzUrl, 
  category = 'default',
  name = 'Product',
  debug = false 
}) => {
  const mvRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scale = getCategoryScale(category);

  useEffect(() => {
    const mv = mvRef.current;
    if (!mv) return;

    const handleLoad = () => {
      setLoading(false);
      if (debug) console.log(`[ARViewer] Loaded: ${name} with scale ${scale}`);
    };

    const handleError = (e) => {
      setError(e.detail.type);
      setLoading(false);
      console.error(`[ARViewer] Error loading ${name}:`, e.detail);
    };

    mv.addEventListener('load', handleLoad);
    mv.addEventListener('error', handleError);

    return () => {
      mv.removeEventListener('load', handleLoad);
      mv.removeEventListener('error', handleError);
    };
  }, [modelUrl, debug, name, scale]);

  return (
    <div className="relative w-full h-full bg-slate-100 rounded-2xl overflow-hidden group">
      <model-viewer
        ref={mvRef}
        src={modelUrl}
        ios-src={usdzUrl}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        touch-action="pan-y"
        shadow-intensity="1"
        shadow-softness="1"
        environment-image="neutral"
        exposure="1"
        autoplay
        scale={`${scale} ${scale} ${scale}`}
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        {/* Loading Poster */}
        {loading && (
          <div slot="poster" className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm transition-opacity duration-500">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-600 font-medium animate-pulse">Preparing {name}...</p>
          </div>
        )}

        {/* Error Fallback */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-6 text-center">
            <p className="text-red-600 font-bold mb-2">Failed to load 3D model</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* AR Trigger Button - Premium Styled */}
        <button
          slot="ar-button"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold shadow-2xl shadow-blue-500/40 transition-all active:scale-95 group-hover:bottom-8"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h3m-3 0H9m11 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          VIEW IN YOUR ROOM
        </button>

        {/* Custom Controls Slot (Optional) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           {debug && (
             <div className="bg-black/80 text-white text-[10px] p-2 rounded font-mono">
               Scale: {scale}x
             </div>
           )}
        </div>
      </model-viewer>
    </div>
  );
};

export default ARViewer;
