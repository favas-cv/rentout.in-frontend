import React from 'react';
import { X, User, Truck, Package, IndianRupee, AlertCircle, CreditCard, CheckCircle } from 'lucide-react';

const OrderDetailModal = ({ 
  order, 
  onClose, 
  updateStatusMutation, 
  allowedTransitions, 
  depositTransitions 
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-[#F8FAFC] rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="bg-white px-12 py-10 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Order Details</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-12 space-y-10">
          {/* Customer & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl">
                  <User size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Customer Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                  <p className="font-bold text-slate-700">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                  <p className="font-bold text-slate-700">{order.customer_email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                  <p className="font-bold text-slate-700">{order.customer_phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                  <Truck size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Shipping Address</h3>
              </div>
              <div className="text-slate-600 font-medium leading-relaxed">
                {order.address_snapshot ? (
                  <>
                    <p className="font-bold text-slate-800 mb-1">{order.address_snapshot?.house_name}</p>
                    <p>{order.address_snapshot?.street}</p>
                    <p>{order.address_snapshot?.state}, {order.address_snapshot?.zipcode}</p>
                  </>
                ) : (
                  <p className="italic text-slate-400">Address details not available in this view.</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Package size={18} className="text-[#635465]" />
                Order Items
              </h3>
            </div>
            <div className="p-8">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="pb-4">Product</th>
                    <th className="pb-4">Duration</th>
                    <th className="pb-4 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr key={order.id}>
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <img src={order.image || '/placeholder.jpg'} className="w-12 h-12 rounded-xl object-cover" alt="" />
                        <div className="font-bold text-slate-800">{order.product_name}</div>
                      </div>
                    </td>
                    <td className="py-6 font-medium text-slate-500 text-sm">
                      {order.start_date} to {order.end_date}
                    </td>
                    <td className="py-6 text-right font-bold text-slate-800">{order.quantity}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Update & Financials */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Simplified Status Management */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Status Section */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Package size={18} className="text-slate-400" />
                    Order Status
                  </h3>
                  <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                    {order.status?.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Change status to:</p>
                  <div className="flex flex-wrap gap-2">
                    {allowedTransitions[order.status?.toUpperCase()]?.map(status => (
                      <button 
                        key={status}
                        onClick={() => updateStatusMutation.mutate({ orderId: order.id, statusData: { status } })}
                        disabled={updateStatusMutation.isPending}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          status === 'CANCELLED' 
                            ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                            : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                        } disabled:opacity-50`}
                      >
                        {status}
                      </button>
                    ))}
                    {allowedTransitions[order.status?.toUpperCase()]?.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No further actions available.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Deposit Status Section */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <IndianRupee size={18} className="text-slate-400" />
                    Deposit Status
                  </h3>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {order.deposit_status?.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Update deposit to:</p>
                  <div className="flex flex-wrap gap-2">
                    {depositTransitions[order.deposit_status?.toUpperCase()]?.map(status => {
                      const isRefundAction = ['REFUND_INITIATED', 'REFUNDED'].includes(status);
                      const canRefund = ['RETURNED', 'CANCELLED'].includes(order.status?.toUpperCase());
                      const isDisabled = updateStatusMutation.isPending || (isRefundAction && !canRefund);
                      
                      return (
                        <button 
                          key={status}
                          onClick={() => updateStatusMutation.mutate({ orderId: order.id, statusData: { deposit_status: status } })}
                          disabled={isDisabled}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            isDisabled 
                              ? 'bg-slate-50 text-slate-300 border-slate-50 cursor-not-allowed' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      );
                    })}
                    {depositTransitions[order.deposit_status?.toUpperCase()]?.length === 0 && (
                      <p className="text-xs text-slate-400 italic">Deposit cycle complete.</p>
                    )}
                  </div>
                  {['REFUND_INITIATED', 'REFUNDED'].some(s => depositTransitions[order.deposit_status?.toUpperCase()]?.includes(s)) && !['RETURNED', 'CANCELLED'].includes(order.status?.toUpperCase()) && (
                    <p className="text-[10px] text-amber-600 font-bold uppercase mt-2 flex items-center gap-1">
                      <AlertCircle size={12} /> Refund locked until item is RETURNED or CANCELLED
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            {order.rate && order.rented_days && (
              <div className="bg-[#635465] p-8 rounded-[2rem] text-white shadow-xl shadow-[#635465]/20">
                <div className="flex items-center gap-3 mb-8">
                  <CreditCard size={20} />
                  <h3 className="font-bold">Payment Summary</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Rent Rate (per day)</span>
                    <span className="font-bold">₹{order.rate}</span>
                  </div>
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Duration</span>
                    <span className="font-bold">{order.rented_days} Days</span>
                  </div>
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Quantity</span>
                    <span className="font-bold">{order.quantity}</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-xs uppercase font-bold">Total Rent Subtotal</span>
                    <span className="text-3xl font-black">₹{(order.rate * order.rented_days * order.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
