import React, { useState, useRef, useEffect } from 'react';
import '@google/model-viewer';
import { 
  Maximize, 
  Minimize, 
  RefreshCcw, 
  Box, 
  Smartphone, 
  Loader2, 
  X,
  Move,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Image
} from 'lucide-react';

const ARViewer = ({ products, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [arStatus, setArStatus] = useState('checking'); 
  const modelRef = useRef(null);

  const productList = Array.isArray(products) ? products : [products];
  const currentProduct = productList[currentIndex];

  useEffect(() => {
    // Reset state for new product
    setIsLoading(true);
    setLoadError(false);

    // If no model URL, stop loading immediately
    if (!currentProduct?.modelUrl) {
      setIsLoading(false);
      setLoadError(true);
    }

    const checkAR = () => {
      const modelViewer = modelRef.current;
      if (modelViewer) {
        const handleStatus = (event) => {
          setArStatus(event.detail.status === 'not-present' ? 'unsupported' : 'supported');
        };
        const handleError = (error) => {
          console.error("Model load error:", error);
          setIsLoading(false);
          setLoadError(true);
        };
        const handleLoad = () => {
          setIsLoading(false);
          setLoadError(false);
        };

        modelViewer.addEventListener('ar-status', handleStatus);
        modelViewer.addEventListener('error', handleError);
        modelViewer.addEventListener('load', handleLoad);

        return () => {
          modelViewer.removeEventListener('ar-status', handleStatus);
          modelViewer.removeEventListener('error', handleError);
          modelViewer.removeEventListener('load', handleLoad);
        };
      }
    };
    checkAR();
  }, [currentIndex, currentProduct?.modelUrl]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % productList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + productList.length) % productList.length);
  };

  if (!currentProduct) return null;

  return (
    <div className="relative w-full aspect-[4/5] bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
      
      {/* Model Viewer */}
      {currentProduct.modelUrl ? (
        <model-viewer
          key={currentProduct.modelUrl} 
          ref={modelRef}
          src={currentProduct.modelUrl}
          ios-src={currentProduct.usdzUrl}
          poster={currentProduct.thumbnail}
          alt={`A 3D model of ${currentProduct.name}`}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          environment-image="neutral"
          exposure="1"
          loading="eager"
          reveal="auto"
          touch-action="pan-y"
          style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#111827' 
          }}
        >
          
          {/* Simple Poster / Loading Overlay */}
          <div slot="poster" className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 transition-opacity duration-500 z-10">
            <img src={currentProduct.thumbnail} className="absolute inset-0 w-full h-full object-contain opacity-20" alt="" />
            <div className="relative z-20 flex flex-col items-center">
              {loadError ? (
                <>
                  <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Failed to Load 3D</p>
                  <p className="text-[8px] text-slate-400 mt-1">Please try again later</p>
                </>
              ) : (
                <>
                  <Loader2 className="w-10 h-10 text-[#635465] animate-spin" />
                  <p className="mt-4 text-[9px] font-black text-[#635465] uppercase tracking-[0.2em] animate-pulse">
                    {isLoading ? 'Loading 3D Model...' : 'Ready'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Native AR Button Slot */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
             {arStatus === 'supported' && !isLoading && !loadError && (
               <button 
                 slot="ar-button"
                 className="pointer-events-auto flex items-center gap-2 bg-[#635465] text-white px-6 py-3 rounded-full font-bold text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all"
               >
                 <Smartphone size={16} />
                 VIEW IN ROOM
               </button>
             )}
          </div>

        </model-viewer>
      ) : (
        /* Fallback when NO model URL exists at all */
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
           <img src={currentProduct.thumbnail} className="max-w-[70%] max-h-[60%] object-contain drop-shadow-xl mb-6" alt="" />
           <div className="bg-amber-100/50 text-amber-700 px-4 py-2 rounded-xl flex items-center gap-2 border border-amber-200">
             <AlertCircle size={16} />
             <span className="text-[10px] font-black uppercase tracking-wider">No 3D Model Available</span>
           </div>
           <p className="mt-2 text-[9px] text-slate-400 font-medium max-w-[200px]">This product only has 2D images available at the moment.</p>
        </div>
      )}

      {/* UI Overlays (Always Visible) */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none z-50">
        <div className="flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 pointer-events-auto">
             <div className={`w-2 h-2 rounded-full ${loadError ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{currentProduct.name}</span>
          </div>
          {productList.length > 1 && (
            <div className="bg-[#635465] text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest w-fit pointer-events-auto">
              Item {currentIndex + 1} of {productList.length}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pointer-events-auto">
           {onClose && (
             <button onClick={onClose} className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 text-slate-400 hover:text-red-500 transition-all">
               <X size={20} />
             </button>
           )}
           {currentProduct.modelUrl && !loadError && (
             <button 
               onClick={() => {
                 if (modelRef.current) {
                   modelRef.current.cameraOrbit = '0deg 75deg 105%';
                   modelRef.current.cameraTarget = 'auto auto auto';
                 }
               }} 
               className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 text-slate-400 hover:text-[#635465] transition-all"
             >
               <RefreshCcw size={20} />
             </button>
           )}
        </div>
      </div>

      {/* Navigation (Always Visible) */}
      {productList.length > 1 && (
        <div className="absolute top-1/2 -translate-y-1/2 left-6 right-6 flex justify-between pointer-events-none z-50">
          <button onClick={handlePrev} className="p-3 bg-white/90 rounded-full shadow-lg text-[#635465] hover:scale-110 active:scale-95 transition-all pointer-events-auto"><ChevronLeft size={24} /></button>
          <button onClick={handleNext} className="p-3 bg-white/90 rounded-full shadow-lg text-[#635465] hover:scale-110 active:scale-95 transition-all pointer-events-auto"><ChevronRight size={24} /></button>
        </div>
      )}

    </div>
  );
};

export default ARViewer;
