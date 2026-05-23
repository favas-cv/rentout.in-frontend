import React, { useState, useEffect } from 'react';
import '@google/model-viewer';

const ModelViewerDebug = ({ modelUrl, usdzUrl, name }) => {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('Initializing...');

  const addLog = (msg) => {
    console.log(`[AR-Debug] ${msg}`);
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    addLog('Component mounted');
    addLog(`Model URL: ${modelUrl}`);
    
    const mv = document.querySelector('model-viewer#debug-mv');
    if (mv) {
      mv.addEventListener('load', () => {
        addLog('Model loaded successfully');
        setStatus('Loaded');
      });
      mv.addEventListener('error', (e) => {
        addLog(`Error: ${e.detail.type}`);
        setStatus(`Error: ${e.detail.type}`);
      });
      mv.addEventListener('progress', (e) => {
        if (e.detail.totalProgress === 1) addLog('Progress 100%');
      });
      mv.addEventListener('ar-status', (e) => {
        addLog(`AR Status: ${e.detail.status}`);
      });
    }
  }, [modelUrl]);

  return (
    <div className="fixed inset-0 z-[10001] bg-black flex flex-col p-4 text-white font-mono text-[10px]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xs font-bold">AR DEBUGGER</h2>
        <button onClick={() => window.location.reload()} className="bg-red-600 px-2 py-1 rounded">RELOAD</button>
      </div>
      
      {/* Test Container - Simplified */}
      <div className="relative flex-1 bg-slate-800 rounded-lg overflow-hidden border border-white/20">
        <model-viewer
          id="debug-mv"
          src={modelUrl}
          ios-src={usdzUrl}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          interaction-prompt="auto"
          shadow-intensity="1"
          environment-image="neutral"
          exposure="1"
          loading="eager"
          style={{ width: '100%', height: '100%' }}
        >
          <div slot="poster" className="absolute inset-0 bg-slate-700 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent animate-spin rounded-full mx-auto mb-2"></div>
              <p>LOADING {name}...</p>
            </div>
          </div>
          
          <button slot="ar-button" className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 px-6 py-3 rounded-full font-bold">
            OPEN AR CAMERA
          </button>
        </model-viewer>
      </div>

      <div className="mt-4 bg-black/50 p-2 rounded border border-white/10 h-40 overflow-y-auto">
        <p className="text-blue-400 font-bold mb-1">LOGS (Status: {status}):</p>
        {logs.map((log, i) => (
          <div key={i} className="border-b border-white/5 py-1">{log}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-[8px]">
        <div className="bg-slate-900 p-2 rounded">
          <p className="text-slate-500">USER AGENT:</p>
          <p className="truncate">{navigator.userAgent}</p>
        </div>
        <div className="bg-slate-900 p-2 rounded">
          <p className="text-slate-500">WEBGL SUPPORT:</p>
          <p>{window.WebGLRenderingContext ? 'YES' : 'NO'}</p>
        </div>
      </div>
    </div>
  );
};

export default ModelViewerDebug;
