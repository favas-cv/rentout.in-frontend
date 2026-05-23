import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Plus, Trash2, Package, Image as ImageIcon, Loader2, X, UploadCloud } from 'lucide-react';
import { fetchOwnerProducts, createProduct, deleteProduct } from '../services/ownerService';
import { selectCurrentUser } from '../store/authSlice';
import { toast } from 'react-toastify';

const ManageProducts = () => {
  const queryClient = useQueryClient();
  const currentUser = useSelector(selectCurrentUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Blocked users cannot manage products
  if (currentUser?.is_live === false) {
    return <Navigate to="/profile" replace />;
  }

  // Fetch Data
  const { data: products, isLoading } = useQuery({
    queryKey: ['owner-products'],
    queryFn: fetchOwnerProducts
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-products']);
      setIsModalOpen(false);
      setSelectedImages([]);
      setPreviews([]);
      toast.success("Product listed successfully!");
    },
    onError: (err) => {
      const errorData = err.response?.data;
      const firstError = errorData ? Object.values(errorData)[0] : "Upload failed";
      toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-products']);
      toast.info("Product removed from inventory");
    }
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePreview = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedImages.length === 0) {
      toast.warning("Please upload at least one image");
      return;
    }

    const formData = new FormData(e.target);
    selectedImages.forEach(file => formData.append('images', file));
    createMutation.mutate(formData);
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-96 gap-4">
      <Loader2 className="animate-spin text-[#635465]" size={40} />
      <p className="text-slate-400 font-medium">Loading your inventory...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 min-h-screen bg-[#F8FAFC]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inventory Manager</h1>
          <p className="text-slate-500 mt-1">List, track, and manage your rental products</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#635465] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#635465]/20 hover:bg-[#524554] hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <Plus size={20} /> List New Product
        </button>
      </div>

      {/* Product List */}
      {!products?.results || products.results.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="text-slate-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No products found</h3>
          <p className="text-slate-400 max-w-xs mx-auto mb-8">You haven't listed any items for rent yet. Start earning by adding your first product.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[#635465] font-bold hover:underline"
          >
            Create your first listing →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.results.map(product => (
            <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group">
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={product.product_image?.[0]?.image_url || '/placeholder.jpg'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={product.title}
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this listing?')) deleteMutation.mutate(product.id);
                    }}
                    className="p-2 bg-white/90 backdrop-blur rounded-xl text-slate-400 hover:text-red-500 shadow-sm transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{product.title}</h3>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${product.is_active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    {product.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">{product.category_name} • {product.locality || 'No location'}</p>
                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">₹{product.price_per_day}</span>
                    <span className="text-xs text-slate-400">/ day</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-10 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-black mb-2 text-slate-900">Create Listing</h2>
            <p className="text-slate-400 mb-8">Fill in the details to list your item for rent.</p>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Product Title</label>
                <input
                  name="title"
                  placeholder="e.g. Luxury 3 Seater Sofa"
                  required
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#635465]/20 border border-slate-100 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Category ID</label>
                <input
                  name="category"
                  type="number"
                  required
                  placeholder="e.g. 1"
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none border border-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Brand Name</label>
                <input name="brand_name" placeholder="e.g. IKEA" className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none border border-slate-100" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Daily Rent (₹)</label>
                <input name="price_per_day" type="number" required placeholder="0" className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none border border-slate-100" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Security Deposit (₹)</label>
                <input name="security_deposit" type="number" placeholder="0" className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none border border-slate-100" />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Product Images</label>
                <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-4">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={src} className="w-full h-full object-cover" alt="preview" />
                      <button
                        type="button"
                        onClick={() => removePreview(i)}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all group">
                    <UploadCloud className="text-slate-300 group-hover:text-[#635465] transition-colors" size={24} />
                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Add</span>
                    <input type="file" multiple onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Discard
                </button>
                <button
                  disabled={createMutation.isPending}
                  className="flex-[2] bg-[#635465] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#635465]/20 flex items-center justify-center gap-2 hover:bg-[#524554] transition-all"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Listing Product...
                    </>
                  ) : 'Launch Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
