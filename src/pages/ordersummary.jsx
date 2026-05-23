import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, ShoppingBag, AlertTriangle } from 'lucide-react';
import { selectCartTotals, selectCartItems } from '../store/cartSlice';

const OrderSummary = () => {
  const navigate = useNavigate();
  // Read real totals from Redux selector (computed from cart items)
  const { rent, deposit, minTotal } = useSelector(selectCartTotals);
  const cartItems = useSelector(selectCartItems);

  const hasUnavailableItems = cartItems?.some(item => item.available === false);

  const formatINR = (n) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="bg-[#EFF6FF] rounded-2xl p-8 shadow-sm">
      <h3 className="text-xl font-bold mb-6 text-slate-900">Order Summary</h3>

      <div className="space-y-4 text-sm text-slate-600 mb-8">
        <div className="flex justify-between">
          <span>Per Day Rent</span>
          <span className="font-medium text-slate-900">{formatINR(rent)}</span>
        </div>
        <div className="flex justify-between">
          <span>Security Deposit (Refundable)</span>
          <span className="font-medium text-slate-900">{formatINR(deposit)}</span>
        </div>
      </div>

      <div className="border-t border-blue-100 pt-6 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Minimum Estimated Total</span>
        </div>
        <div className="text-4xl font-black text-slate-900">{formatINR(minTotal)}</div>
      </div>


      <button 
        onClick={() => !hasUnavailableItems && navigate('/checkout')}
        disabled={hasUnavailableItems}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mb-4 ${
          hasUnavailableItems 
            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            : 'bg-[#635465] text-white hover:bg-[#524554] hover:scale-[1.01] active:scale-95'
        }`}
      >
        <ShoppingBag size={20} />
        {hasUnavailableItems ? 'Please remove unavailable items' : 'Proceed to Checkout'}
      </button>
      <p className="text-[10px] text-center text-slate-400 uppercase tracking-tighter flex items-center justify-center gap-1 mt-6">
        <ShieldCheck size={12} /> Payments are held in a secure escrow account
      </p>
    </div>
  );
};

export default OrderSummary;