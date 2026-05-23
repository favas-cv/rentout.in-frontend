import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Premium KYC update page for admin dashboard.
 * Provides a simple form to upload identity and address documents.
 * Uses glass‑morphism background and subtle micro‑animations.
 */
const KycUpdate = () => {
  const [idFile, setIdFile] = useState(null);
  const [addressFile, setAddressFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idFile || !addressFile) {
      setStatus('Please select both files');
      return;
    }
    // Placeholder: simulate upload
    setStatus('Uploading...');
    setTimeout(() => setStatus('KYC documents submitted successfully!'), 1500);
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6" /> KYC Update
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="idFile">
              Identity Document (PDF/JPG)
            </label>
            <input
              id="idFile"
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setIdFile(e.target.files[0])}
              className="w-full px-3 py-2 bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="addressFile">
              Address Proof (PDF/JPG)
            </label>
            <input
              id="addressFile"
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setAddressFile(e.target.files[0])}
              className="w-full px-3 py-2 bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition transform hover:scale-105"
          >
            Submit KYC
          </button>
        </form>
        {status && <p className="mt-4 text-center text-sm text-gray-200">{status}</p>}
      </div>
    </section>
  );
};

export default KycUpdate;
