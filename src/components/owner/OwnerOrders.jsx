import React from 'react';
import { Calendar, Eye, ShoppingBag } from 'lucide-react';

const OwnerOrders = ({ orders, onSelectOrder }) => {
  return (
    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Rental Orders</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Track and fulfill your bookings</p>
        </div>
      </div>
      
      <div className="p-10">
        {orders?.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No orders received yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                  <th className="pb-6">Item & Customer</th>
                  <th className="pb-6">Rental Period</th>
                  <th className="pb-6">Earnings</th>
                  <th className="pb-6">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders?.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                          <img 
                            src={order.image || '/placeholder.jpg'} 
                            className="w-full h-full object-cover" 
                            alt="" 
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 mb-0.5 line-clamp-1">
                            {order.product_name || "Unknown Item"}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span>Order #{order.id}</span>
                            <span>•</span>
                            <span className="lowercase">{order.customer_email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-8">
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <Calendar size={14} className="text-slate-300" />
                        {order.start_date} - {order.end_date}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-1">Duration period</div>
                    </td>
                    <td className="py-8">
                      <div className="text-xl font-black text-slate-900">₹{order.rate && order.rented_days ? (order.rate * order.rented_days * order.quantity).toLocaleString() : '-'}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Earnings</div>
                    </td>
                    <td className="py-8">
                      <div className="flex items-center justify-between gap-4">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          order.status?.toUpperCase() === 'CONFIRMED' ? 'bg-green-50 text-green-600' : 
                          order.status?.toUpperCase() === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                          order.status?.toUpperCase() === 'SHIPPED' ? 'bg-purple-50 text-purple-600' :
                          order.status?.toUpperCase() === 'DELIVERED' ? 'bg-blue-50 text-blue-600' :
                          order.status?.toUpperCase() === 'RETURNED' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {order.status?.toUpperCase()}
                        </span>
                        <button 
                          onClick={() => onSelectOrder(order)}
                          className="p-2 text-slate-400 hover:text-[#635465] hover:bg-[#635465]/5 rounded-lg transition-all"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerOrders;
