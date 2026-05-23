import React from 'react';
import { X, UploadCloud, Loader2, Package } from 'lucide-react';

const ProductListingModal = ({ isOpen, onClose, onSubmit, categories, previews, onImageChange, isPending }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-12 relative shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-400 hover:text-slate-600 transition-colors"><X size={28} /></button>
        <h2 className="text-4xl font-black mb-2 text-slate-900">New Listing</h2>
        <p className="text-slate-400 mb-10">Add a new item to your rental inventory.</p>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Product Title</label>
            <input name="title" placeholder="e.g. Sony A7 III" required className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Category</label>
            <select name="category" required className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium appearance-none cursor-pointer">
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.category}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Brand</label>
            <input name="brand_name" placeholder="Sony" className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Daily Rent (₹)</label>
            <input name="price_per_day" type="number" required placeholder="0" className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Security Deposit (₹)</label>
            <input name="security_deposit" type="number" placeholder="0" className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Gallery</label>
            <div className="mt-2 grid grid-cols-3 md:grid-cols-4 gap-4">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img src={src} className="w-full h-full object-cover" alt="preview" />
                </div>
              ))}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                <UploadCloud className="text-slate-300" size={32} />
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Upload</span>
                <input type="file" multiple onChange={onImageChange} className="hidden" />
              </label>
            </div>
          </div>
          <div className="md:col-span-2 flex gap-6 mt-10">
            <button type="button" onClick={onClose} className="flex-1 py-5 font-bold text-slate-400">Discard</button>
            <button disabled={isPending} className="flex-[2] bg-[#635465] text-white py-5 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3">
              {isPending ? <Loader2 className="animate-spin" /> : <><Package size={20} /> Launch Listing</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductListingModal;
