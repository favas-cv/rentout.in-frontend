import React from 'react';
import { X, Trash2, UploadCloud, Loader2, Package, Box, Edit } from 'lucide-react';

const AddProductModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  product,
  categories, 
  previews, 
  handleImageChange, 
  removePreview, 
  isPending 
}) => {
  if (!isOpen) return null;

  const isEditing = !!product;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-12 relative shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-10 right-10 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={28} />
        </button>

        <h2 className="text-4xl font-black mb-2 text-slate-900">{isEditing ? 'Edit Listing' : 'New Listing'}</h2>
        <p className="text-slate-400 mb-10">{isEditing ? `Updating details for ${product.title}` : 'Add a new item to your rental inventory.'}</p>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Product Title</label>
            <input
              name="title"
              defaultValue={product?.title}
              placeholder="e.g. Sony A7 III Mirrorless Camera"
              required
              className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#635465]/20 border border-slate-100 transition-all font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Category</label>
            <select
              name="category"
              defaultValue={product?.category}
              required
              className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium appearance-none cursor-pointer"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Brand</label>
            <input name="brand_name" defaultValue={product?.brand_name} placeholder="Sony" className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Material</label>
            <input name="material" defaultValue={product?.material} placeholder="e.g. Wood, Fabric" className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Daily Rent (₹)</label>
            <input name="price_per_day" defaultValue={product?.price_per_day} type="number" required placeholder="0" className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Security Deposit (₹)</label>
            <input name="security_deposit" defaultValue={product?.security_deposit} type="number" placeholder="0" className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Locality</label>
            <input name="locality" defaultValue={product?.locality} placeholder="e.g. Koramangala, Bangalore" className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Color</label>
            <input name="color" defaultValue={product?.color} placeholder="e.g. Royal Blue" className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Age (Years)</label>
            <input name="age_years" defaultValue={product?.age_years} type="number" placeholder="e.g. 2" className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Min Rental Days</label>
            <input name="min_rental_days" defaultValue={product?.min_rental_days || 15} type="number" className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-medium" />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Description</label>
            <textarea
              name="description"
              defaultValue={product?.description}
              placeholder="Describe your product in detail..."
              rows={4}
              className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#635465]/20 border border-slate-100 transition-all font-medium resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Gallery Images</label>
            <div className="mt-2 grid grid-cols-3 md:grid-cols-4 gap-4">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img src={src} className="w-full h-full object-cover" alt="preview" />
                  <button
                    type="button"
                    onClick={() => removePreview(i)}
                    className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all group">
                <UploadCloud className="text-slate-300 group-hover:text-[#635465] transition-colors" size={32} />
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Upload</span>
                <input type="file" multiple onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            {isEditing && (
              <p className="mt-3 text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                * Uploading new images will add to your existing gallery.
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">
              3D Model (.glb / .gltf) <span className="text-slate-300 ml-1">(Optional)</span>
            </label>
            <div className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-100 relative group hover:border-[#635465]/20 transition-all">
              <input 
                type="file" 
                name="model_3d" 
                accept=".glb,.gltf" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const label = e.target.nextSibling;
                    label.innerHTML = `
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        </div>
                        <div class="text-left">
                          <p class="text-xs font-bold text-slate-700">${file.name}</p>
                          <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest">${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to Launch</p>
                        </div>
                      </div>
                    `;
                  }
                }}
              />
              <div className="flex flex-col items-center justify-center text-center">
                {isEditing && product.product_image?.some(img => img.model3d_url) ? (
                   <>
                     <div className="w-10 h-10 bg-[#635465]/10 text-[#635465] rounded-xl flex items-center justify-center mb-2">
                       <Box size={24} />
                     </div>
                     <p className="text-xs font-bold text-[#635465] uppercase tracking-widest">Existing 3D Model found</p>
                     <p className="text-[10px] text-slate-400 mt-1 italic">Click to replace with a new one</p>
                   </>
                ) : (
                  <>
                    <Box className="text-slate-200 group-hover:text-[#635465] transition-colors mb-3" size={32} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Click to upload 3D model</p>
                    <p className="text-[10px] text-slate-300 mt-1">Maximum size: 50MB</p>
                  </>
                )}
              </div>
            </div>
          </div>


          <div className="md:col-span-2 flex gap-6 mt-10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-5 font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Discard
            </button>
            <button
              disabled={isPending}
              className="flex-[2] bg-[#635465] text-white py-5 rounded-2xl font-bold shadow-xl shadow-[#635465]/30 flex items-center justify-center gap-3 hover:bg-[#524554] transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  {isEditing ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                <>
                  {isEditing ? <Edit size={20} /> : <Package size={20} />}
                  {isEditing ? 'Save Changes' : 'Launch Listing'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default AddProductModal;
