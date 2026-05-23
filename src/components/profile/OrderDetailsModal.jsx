import React from 'react';
import { X, User, Package, CheckCircle, Calendar } from 'lucide-react';

const OrderDetailsModal = ({ order, onClose, onUpdateStatus, isUpdating }) => {
  if (!order) return null;

  const allowedTransitions = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['SHIPPED', 'CANCELLED'],
    'SHIPPED': ['DELIVERED', 'CANCELLED'],
    'DELIVERED': ['RETURNED'],
    'RETURNED': [],
    'CANCELLED': []
  };

  const depositTransitions = {
    'PENDING': ['HOLD'],
    'HOLD': ['REFUND_INITIATED'],
    'REFUND_INITIATED': ['REFUNDED'],
    'REFUNDED': []
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-[#F8FAFC] rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-white px-12 py-10 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Order Item Details</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Item #{order.id}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
        </div>
        
        <div className="p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><User size={20} className="text-indigo-500" /> Customer Info</h3>
              <div className="space-y-2 text-sm font-bold text-slate-700">
                <p>{order.customer_name}</p>
                <p className="text-slate-400">{order.customer_email}</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Package size={20} className="text-emerald-500" /> Product Details</h3>
              <div className="text-sm font-medium text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-800 text-lg mb-2">{order.product_name}</p>
                <p className="flex items-center gap-2"><Calendar size={16} className="text-slate-400"/> {order.start_date} to {order.end_date}</p>
                <p className="mt-2 text-slate-400">Qty: {order.quantity}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2"><CheckCircle size={20} className="text-indigo-500" /> Manage Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Order Status</label>
                <select 
                  onChange={(e) => onUpdateStatus({ orderId: order.id, statusData: { status: e.target.value } })} 
                  disabled={isUpdating || allowedTransitions[order.status]?.length === 0}
                  value={order.status}
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 border border-slate-100 font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <option value={order.status}>{order.status}</option>
                  {allowedTransitions[order.status]?.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Deposit Status</label>
                <select 
                  onChange={(e) => onUpdateStatus({ orderId: order.id, statusData: { deposit_status: e.target.value } })} 
                  disabled={isUpdating || depositTransitions[order.deposit_status]?.length === 0}
                  value={order.deposit_status} 
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 border border-slate-100 font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <option value={order.deposit_status}>{order.deposit_status}</option>
                  {depositTransitions[order.deposit_status]?.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
