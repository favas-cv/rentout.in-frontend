import React from 'react';
import { Package, Trash2, Plus, Edit } from 'lucide-react';

const OwnerProducts = ({ products, onDelete, onEdit, onAddClick }) => {
  return (
    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Your Inventory</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Manage your listed products</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-[#635465] text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#524554] shadow-xl shadow-[#635465]/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>New Product</span>
        </button>
      </div>
      
      <div className="p-10">
        {products?.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No products listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products?.map((product) => (
              <div key={product.id} className="group bg-[#F8FAFC] rounded-[2.5rem] p-6 border border-slate-100 hover:border-[#635465]/30 transition-all hover:shadow-xl hover:shadow-[#635465]/5">
                <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6 bg-white">
                  <img src={product.product_image?.[0]?.image_url || '/placeholder.jpg'} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => onEdit(product)}
                      className="p-3 bg-white text-[#635465] rounded-2xl shadow-lg hover:bg-[#635465] hover:text-white transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(product.id)}
                      className="p-3 bg-red-500 text-white rounded-2xl shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center my-2">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="mx-2 text-red-600 font-semibold uppercase tracking-wider">{product.category_name || "No Category"}</span>
                    <hr className="flex-grow border-t border-gray-300" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-black text-xl text-slate-900 line-clamp-1">{product.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{product.brand_name}</p>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price / Day</p>
                      <p className="text-2xl font-black text-[#635465]">₹{product.price_per_day}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Security</p>
                      <p className="font-bold text-slate-700">₹{product.security_deposit}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerProducts;
