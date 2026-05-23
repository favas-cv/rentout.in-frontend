import React from 'react';
import { Trash2 } from 'lucide-react';

const CartItem = ({ item, onRemove, isRemoving }) => {
  const product = item.product; // 🔥 key fix
  const isUnavailable = item.available === false;

  return (
    <div className="relative">
      {/* Main card */}
      <div className={`bg-white rounded-xl p-6 flex items-center gap-6 shadow-sm border transition-all ${
        isUnavailable ? 'border-slate-200 opacity-50 blur-[0.3px]' : 'border-slate-100'
      }`}>

        {/* Image — always clean, no overlay */}
        <div className="w-24 h-24 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={product?.product_image?.[0]?.image_url || '/placeholder.jpg'}
            alt={product?.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start">

            {/* Title — never crossed out */}
            <div>
              <h3 className={`font-bold text-lg transition-all ${isUnavailable ? 'text-slate-500' : 'text-slate-800'}`}>
                {product?.title}
              </h3>
            </div>

            {/* Remove Button */}
            <button
              onClick={onRemove}
              disabled={isRemoving}
              className="text-slate-400 hover:text-red-500 disabled:opacity-40 transition-colors pt-1"
              aria-label="Remove item"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Pricing Breakdown */}
          <div className="flex gap-10 mb-2">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rent / Day</span>
              <span className="font-bold text-slate-800 text-sm">₹{(product?.price_per_day || 0).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deposit</span>
              <span className="font-bold text-slate-800 text-sm">₹{(product?.security_deposit || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Quantity & Days */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty</span>
              <div className="bg-slate-100 px-3 py-1 rounded-lg font-bold text-slate-700 text-xs">
                {item.quantity}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Days</span>
              <div className="bg-slate-100 px-3 py-1 rounded-lg font-bold text-slate-700 text-xs">
                {product?.min_rental_days || 1}
              </div>
            </div>
          </div>

          {/* Item Min Total */}
          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#635465] uppercase tracking-widest">Min Estimated Total</span>
            <span className="font-black text-[#635465]">
              ₹{((((product?.min_rental_days || 1) * (product?.price_per_day || 0)) + (product?.security_deposit || 0)) * (item.quantity || 1)).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Unavailable overlay — covers entire card */}
      {isUnavailable && (
        <div className="absolute inset-0 rounded-xl pointer-events-none z-10 flex items-center justify-center">
          {/* Subtle dotted X cross across entire card */}
          <svg className="absolute inset-0 w-full h-full rounded-xl" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="#334155" strokeWidth="1" strokeDasharray="6 6" opacity="0.18" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke="#334155" strokeWidth="1" strokeDasharray="6 6" opacity="0.18" />
          </svg>

          {/* Center badge */}
          <span className="relative z-20 bg-white/80 backdrop-blur-sm text-slate-600 text-xs font-medium px-4 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
            {item.unavailable_reason || 'Owner unavailable now'}
          </span>
        </div>
      )}
    </div>
  );
};

export default CartItem;