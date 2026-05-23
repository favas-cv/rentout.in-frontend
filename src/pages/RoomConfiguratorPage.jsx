import React, { useState } from 'react';
import RoomViewer from '../components/room/RoomViewer';
import ARViewer from '../components/ar/ARViewer';

const RoomConfiguratorPage = () => {
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' or 'ar'
  
  // Example data that would normally come from an API
  const [product] = useState({
    id: 'prod-1',
    name: 'Nordic Cloud Sofa',
    category: 'sofa',
    url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', // Placeholder
    usdzUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz', // Placeholder
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scaleMultiplier: 1
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              PRO <span className="text-blue-600">CONFIGURATOR</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Production-grade 3D furniture staging</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
            <button 
              onClick={() => setViewMode('desktop')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              DESKTOP ROOM
            </button>
            <button 
              onClick={() => setViewMode('ar')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'ar' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              MOBILE AR
            </button>
          </div>
        </div>

        {/* Main Viewer Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Panel: Product Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase mb-4">
                Selected Item
              </span>
              <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
              <p className="text-slate-500 text-sm mt-2">Premium {product.category} for modern living spaces. Handcrafted with sustainable materials.</p>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Rent from</p>
                  <p className="text-xl font-black text-slate-900">₹1,299<span className="text-xs font-medium text-slate-400">/mo</span></p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                  RENT NOW
                </button>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl text-white">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Architecture Status
              </h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Category Scale</span>
                  <span className="font-mono text-blue-400">Applied (1.2x)</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Room Environment</span>
                  <span className="font-mono text-blue-400">Living Room</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Shadow Mode</span>
                  <span className="font-mono text-blue-400">PBR / Contact</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: 3D/AR Viewer */}
          <div className="lg:col-span-3">
            {viewMode === 'desktop' ? (
              <RoomViewer initialProducts={[product]} />
            ) : (
              <div className="h-[700px]">
                <ARViewer 
                  modelUrl={product.url}
                  usdzUrl={product.usdzUrl}
                  category={product.category}
                  name={product.name}
                  debug
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
           <div className="flex gap-4 items-start">
             <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 border border-slate-100">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
             </div>
             <div>
               <h4 className="font-bold text-slate-900 text-sm">Universal Scaling</h4>
               <p className="text-xs text-slate-500 mt-1">Automatic category-aware dimensioning across all view modes.</p>
             </div>
           </div>
           <div className="flex gap-4 items-start">
             <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 border border-slate-100">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </div>
             <div>
               <h4 className="font-bold text-slate-900 text-sm">One-Tap AR</h4>
               <p className="text-xs text-slate-500 mt-1">Seamless transition to real-world preview on iOS & Android.</p>
             </div>
           </div>
           <div className="flex gap-4 items-start">
             <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 border border-slate-100">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <div>
               <h4 className="font-bold text-slate-900 text-sm">Optimized Engine</h4>
               <p className="text-xs text-slate-500 mt-1">Hybrid architecture using ModelViewer for AR and R3F for Desktop.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RoomConfiguratorPage;
