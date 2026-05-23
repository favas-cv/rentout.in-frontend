import React from 'react';
import { Clock, Calendar, Heart, ShoppingBag, ShoppingCart, LayoutDashboard, Package, CreditCard, Plus, X, Bell, Check, CheckCircle2, AlertTriangle, MessageCircle, Shield, ShieldCheck, ShieldAlert, Trash2, Camera, Loader2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import { addToCart } from '../../services/cartService';
import { addItem, selectCartItems } from '../../store/cartSlice';
import { toast } from 'react-hot-toast';

export const RentalsView = ({ bookings, onCancelBooking, isCancelling }) => {
  const navigate = useNavigate();
  const [confirmCancelId, setConfirmCancelId] = React.useState(null);
  const bookingList = Array.isArray(bookings) ? bookings : bookings?.results || [];

  return (
    <section>
      <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
        <Clock size={32} className="text-[#635465]" /> My Rentals
      </h2>
      {bookingList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookingList.map(order => (
            <div key={order.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between mb-6 pb-6 border-b border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order #{order.id}</span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.1em] mt-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                {order.total_paid && (
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-slate-900">₹{order.total_paid}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Paid</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                {order.items?.map(item => (
                  <div key={item.id} className="relative pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="flex gap-6">
                      <img src={item.product_snapshot?.image} className="w-24 h-24 rounded-2xl object-cover" alt="" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-800">{item.product_snapshot?.title}</h3>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              item.status === 'CONFIRMED' ? 'bg-green-50 text-green-600' : 
                              item.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                              item.status === 'SHIPPED' ? 'bg-purple-50 text-purple-600' :
                              item.status === 'DELIVERED' ? 'bg-blue-50 text-blue-600' :
                              item.status === 'RETURNED' ? 'bg-indigo-50 text-indigo-600' :
                              item.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                              'bg-slate-50 text-slate-400'
                            }`}>{item.status}</span>
                            {['PENDING', 'CONFIRMED'].includes(item.status) && (
                              <button 
                                onClick={() => setConfirmCancelId(item.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
                          <Calendar size={12} /> {item.start_date} - {item.end_date}
                        </p>
                        <div className="flex justify-between items-end">
                          <div className="text-sm font-bold text-slate-600">
                             ₹{item.product_snapshot?.price_per_day} <span className="text-[10px] text-slate-400 font-normal uppercase tracking-widest">/ day</span>
                          </div>
                          {['PENDING', 'CONFIRMED'].includes(item.status) && (
                            <button 
                              onClick={() => setConfirmCancelId(item.id)}
                              className="text-xs text-red-500 font-bold hover:underline"
                            >
                              Cancel Item
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Item-level Cancellation Confirmation Overlay */}
                    {confirmCancelId === item.id && (
                      <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-200 rounded-2xl">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
                          <X size={24} />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-1">Cancel this item?</h4>
                        <p className="text-slate-500 text-xs mb-4">This action cannot be undone.</p>
                        <div className="flex gap-3 w-full max-w-[200px]">
                          <button 
                            onClick={() => setConfirmCancelId(null)}
                            className="flex-1 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 text-xs hover:bg-slate-50 transition-all"
                          >
                            Keep It
                          </button>
                          <button 
                            onClick={() => {
                              onCancelBooking(item.id);
                              setConfirmCancelId(null);
                            }}
                            disabled={isCancelling}
                            className="flex-1 py-2 bg-red-500 text-white rounded-xl font-black text-xs shadow-lg shadow-red-500/20 hover:scale-105 transition-all disabled:opacity-50"
                          >
                            {isCancelling ? '...' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100">
          <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">You haven't rented anything yet.</p>
          <button onClick={() => navigate('/products')} className="mt-6 text-[#635465] font-black text-sm uppercase tracking-widest hover:underline">Explore Products →</button>
        </div>
      )}
    </section>
  );
};

export const WishlistView = ({ wishlist }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const cartItems = useSelector(selectCartItems);

  const addToCartMutation = useMutation({
    mutationFn: (productId) => addToCart({ productId }),
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error, { position: 'top-center' });
        return;
      }
      dispatch(addItem(data));
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart!', { position: 'top-center' });
    },
    onError: (err) => {
      const errorData = err.response?.data;
      const msg = errorData?.error || errorData?.detail || 'Already in cart';
      toast.error(Array.isArray(msg) ? msg[0] : msg, { position: 'top-center' });
    },
  });

  return (
    <section>
      <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
        <Heart size={32} className="text-red-500" /> Wishlist Items
      </h2>
      {wishlist?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(item => {
            const p = item.product || item;
            const isUnavailable = item.available === false;
            const reason = item.unavailable_reason;
            const isInCart = cartItems?.some(ci => (ci.product?.id || ci.product_id) === p.id);

            return (
              <div
                key={p.id}
                className={`bg-white rounded-[2.5rem] p-6 border shadow-sm group transition-all duration-300 ${
                  isUnavailable ? 'border-red-100 bg-slate-50/50' : 'border-slate-100 hover:shadow-md'
                }`}
              >
                {/* Image with overlay */}
                <div
                  className="aspect-square rounded-[2rem] overflow-hidden mb-6 relative cursor-pointer"
                  onClick={() => navigate(`/products/${p.id}`)}
                >
                  <img
                    src={p.product_image?.[0]?.image_url || p.image}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      isUnavailable ? 'blur-[0.5px] opacity-60' : 'group-hover:scale-110'
                    }`}
                    alt={p.title}
                  />
                  {isUnavailable && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <span className="text-sm font-medium text-red-600">
                        {reason || 'Currently Unavailable'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3
                  className={`font-bold line-clamp-1 mb-2 cursor-pointer transition-colors ${
                    isUnavailable ? 'text-slate-400 line-through' : 'text-slate-800 hover:text-[#635465]'
                  }`}
                  onClick={() => navigate(`/products/${p.id}`)}
                >
                  {p.title}
                </h3>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-2xl font-black text-slate-900">
                    ₹{p.price_per_day}
                    <span className="text-xs text-slate-400 font-bold ml-1">/ day</span>
                  </p>

                  {/* Add to Cart Button */}
                  {isUnavailable ? (
                    <button
                      disabled
                      className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    >
                      <AlertTriangle size={14} />
                      Unavailable
                    </button>
                  ) : isInCart ? (
                    <button
                      disabled
                      className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-green-50 text-green-600 border border-green-100 cursor-default"
                    >
                      <CheckCircle2 size={14} />
                      In Cart
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCartMutation.mutate(p.id);
                      }}
                      disabled={addToCartMutation.isPending}
                      className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#635465] hover:bg-[#524554] text-white transition-all hover:scale-[1.02] active:scale-95 shadow-sm disabled:opacity-50"
                    >
                      {addToCartMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ShoppingCart size={14} />
                      )}
                      {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100">
          <Heart size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">Your wishlist is empty.</p>
          <button onClick={() => navigate('/products')} className="mt-6 text-[#635465] font-black text-sm uppercase tracking-widest hover:underline">Go to Shop →</button>
        </div>
      )}
    </section>
  );
};

export const ListingsView = ({ user, products, onAddClick, onSectionChange }) => {
  return (
    <section>
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <LayoutDashboard size={32} className="text-emerald-500" /> My Inventory
        </h2>
        {(user?.is_owner || user?.is_verified) && (
          <button 
            onClick={onAddClick}
            className="px-6 py-3 bg-[#635465] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Plus size={16} /> List New Product
          </button>
        )}
      </div>

      {!(user?.is_owner || user?.is_verified) ? (
         <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-2xl" />
          <Package size={64} className="mx-auto text-emerald-100 mb-6" />
          <h3 className="text-2xl font-black text-slate-800 mb-2">Start Listing & Earn Money</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">Turn your idle assets into income. Join our community of owners and start renting your furniture, appliances, or gadgets today. First, complete your KYC verification.</p>
          <button 
            onClick={() => onSectionChange?.('kyc')}
            className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
          >
            Complete KYC to Become Owner
          </button>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(products?.results || products)?.map(product => (
            <div key={product.id} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div className="aspect-video rounded-[2rem] overflow-hidden mb-6">
                <img src={product.product_image?.[0]?.image_url} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-800">{product.title}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${product.is_active ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                  {product.is_active ? 'Active' : 'Draft'}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-2">₹{product.price_per_day}</div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Revenue</p>
            </div>
          ))}
          {(products?.results?.length === 0 || (!products?.results && products?.length === 0)) && (
            <div className="col-span-full bg-white rounded-[3rem] p-16 text-center border border-slate-100">
              <p className="text-slate-400 font-bold">You haven't listed any products yet.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export const PaymentsView = ({ user, orders, onOrderClick, kycData, kycLoading, onSectionChange }) => {
  const kycStatus = kycData?.results?.[0]?.status || null;

  return (
    <section>
      <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
        <CreditCard size={32} className="text-amber-500" /> Owner Income
      </h2>

      {/* KYC Verification Banner */}
      {(user?.is_owner || user?.is_verified) && (
        <>
          {kycLoading ? (
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 mb-8 animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ) : kycStatus === 'VERIFIED' ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 mb-8 flex items-center gap-4 text-emerald-800 animate-in fade-in duration-300">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-black text-lg">KYC Fully Verified</h4>
                <p className="text-xs font-semibold text-emerald-600">Your profile has been verified. You are eligible to receive and withdraw all payouts.</p>
              </div>
            </div>
          ) : kycStatus === 'PENDING' ? (
            <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 mb-8 flex items-center gap-4 text-amber-800 animate-pulse">
              <div className="p-3 bg-amber-500 text-white rounded-2xl flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="font-black text-lg">KYC Verification Pending</h4>
                <p className="text-xs font-semibold text-amber-600">Your verification documents are currently under review. Payouts may be temporarily on hold.</p>
              </div>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-rose-800 animate-in fade-in duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-500 text-white rounded-2xl flex items-center justify-center">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h4 className="font-black text-lg">{kycStatus === 'REJECTED' ? 'KYC Verification Rejected' : 'KYC Verification Required'}</h4>
                  <p className="text-xs font-semibold text-rose-600">
                    {kycStatus === 'REJECTED'
                      ? 'Your previous KYC submission was rejected. Please review and re-submit your documents.'
                      : 'Please complete your identity verification to enable owner payouts and list items.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onSectionChange?.('kyc')}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 shrink-0 cursor-pointer"
              >
                Complete KYC
              </button>
            </div>
          )}
        </>
      )}
      
      {!(user?.is_owner || user?.is_verified) ? (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-sm">
          <CreditCard size={48} className="mx-auto text-amber-100 mb-4" />
          <p className="text-slate-400 font-bold">Earnings tracking will appear once you complete KYC and become an owner.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                  <th className="pb-6">Item / Customer</th>
                  <th className="pb-6">Status</th>
                  <th className="pb-6">Date</th>
                  <th className="pb-6 text-right">Earnings</th>
                  <th className="pb-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(orders?.results || orders)?.map(order => (
                  <tr key={order.id} className="group">
                    <td className="py-6">
                      <div className="font-bold text-slate-800">{order.product_name}</div>
                      <div className="text-xs text-slate-400">Order #{order.id} • {order.customer_name}</div>
                    </td>
                    <td className="py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'CONFIRMED' ? 'bg-green-50 text-green-600' : 
                        order.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                        order.status === 'SHIPPED' ? 'bg-purple-50 text-purple-600' :
                        order.status === 'DELIVERED' ? 'bg-blue-50 text-blue-600' :
                        order.status === 'RETURNED' ? 'bg-indigo-50 text-indigo-600' :
                        'bg-slate-50 text-slate-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-6 text-sm font-bold text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-6 text-right font-black text-slate-900">
                      ₹{order.rate && order.rented_days ? (order.rate * order.rented_days * order.quantity).toLocaleString() : '-'}
                    </td>
                    <td className="py-6 text-right">
                      <button onClick={() => onOrderClick(order)} className="p-2 text-slate-300 hover:text-[#635465] hover:bg-slate-50 rounded-lg transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(orders?.results?.length === 0 || (!orders?.results && orders?.length === 0)) && (
              <p className="text-slate-400 font-medium py-10 text-center">No order history found.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

const Eye = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);

export const NotificationsView = () => {
  const { data: notificationsData, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
        const res = await api.get('/notifications/');
        return res.data;
    },
  });

  const notifications = Array.isArray(notificationsData) ? notificationsData : (notificationsData?.results ?? []);

  const markAllRead = async () => {
    try {
        await api.patch('/notifications/read-all/');
        refetch();
    } catch (err) {
        console.error('Failed to mark all as read', err);
    }
  };

  const markSingleRead = async (id) => {
    try {
        await api.patch(`/notifications/${id}/read/`);
        refetch();
    } catch (err) {
        console.error('Failed to mark notification as read', err);
    }
  };

  return (
    <section>
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Bell size={32} className="text-purple-500" /> Notifications
        </h2>
        {notifications.length > 0 && (
          <button 
            onClick={markAllRead}
            className="px-6 py-2 bg-purple-50 text-purple-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-100 transition-all"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100">
            <Bell size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">You have no notifications.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id}
              className={`p-6 bg-white rounded-[2rem] border transition-all flex items-center justify-between gap-6 ${!n.is_read ? 'border-purple-200 shadow-md shadow-purple-100/50' : 'border-slate-100 shadow-sm opacity-70'}`}
            >
              <div className="flex gap-6 items-center">
                <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 ${
                  n.notification_type === 'MESSAGE' ? 'bg-indigo-50 text-indigo-500' :
                  n.notification_type === 'ORDER' ? 'bg-emerald-50 text-emerald-500' :
                  'bg-slate-50 text-slate-500'
                }`}>
                  {n.notification_type === 'MESSAGE' ? <MessageCircle size={24} /> : <Check size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className={`font-black text-lg ${!n.is_read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm ${!n.is_read ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>{n.message}</p>
                </div>
              </div>
              
              {!n.is_read && (
                <button 
                  onClick={() => markSingleRead(n.id)}
                  className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all group"
                  title="Mark as read"
                >
                  <Check size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export const KYCView = ({ kycData, isLoading, onSubmit, isPending }) => {
  const [aadhaarFile, setAadhaarFile] = React.useState(null);
  const [panFile, setPanFile] = React.useState(null);
  const [selfieFile, setSelfieFile] = React.useState(null);

  const [aadhaarPreview, setAadhaarPreview] = React.useState(null);
  const [panPreview, setPanPreview] = React.useState(null);
  const [selfiePreview, setSelfiePreview] = React.useState(null);

  const [forceResubmit, setForceResubmit] = React.useState(false);

  const kycRecord = kycData?.results?.[0];
  const status = kycRecord?.status || null;

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (type === 'aadhaar') {
      setAadhaarFile(file);
      setAadhaarPreview(previewUrl);
    } else if (type === 'pan') {
      setPanFile(file);
      setPanPreview(previewUrl);
    } else if (type === 'selfie') {
      setSelfieFile(file);
      setSelfiePreview(previewUrl);
    }
  };

  const handleRemove = (type) => {
    if (type === 'aadhaar') {
      setAadhaarFile(null);
      setAadhaarPreview(null);
    } else if (type === 'pan') {
      setPanFile(null);
      setPanPreview(null);
    } else if (type === 'selfie') {
      setSelfieFile(null);
      setSelfiePreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!aadhaarFile || !panFile || !selfieFile) {
      toast.error("Please upload Aadhaar Card, PAN Card, and a Selfie to proceed.", { position: 'top-center' });
      return;
    }
    const formData = new FormData();
    formData.append('document1', aadhaarFile);
    formData.append('document2', panFile);
    formData.append('selfie', selfieFile);
    onSubmit(formData);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#635465] mb-4" size={40} />
        <p className="text-slate-400 font-bold">Loading KYC Details...</p>
      </div>
    );
  }

  // Show status screen if KYC exists and not forcing a resubmit
  if (status && !forceResubmit) {
    return (
      <section className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden p-12 text-center relative">
          {status === 'VERIFIED' && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          )}
          {status === 'PENDING' && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          )}

          <div className="flex flex-col items-center mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${
              status === 'VERIFIED' ? 'bg-green-500 text-white shadow-green-500/20' :
              status === 'PENDING' ? 'bg-amber-500 text-white shadow-amber-500/20 animate-pulse' :
              'bg-rose-500 text-white shadow-rose-500/20'
            }`}>
              {status === 'VERIFIED' ? <ShieldCheck size={48} /> : 
               status === 'PENDING' ? <Shield size={48} /> : 
               <ShieldAlert size={48} />}
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 mb-2">
              {status === 'VERIFIED' ? 'Verification Successful' : 
               status === 'PENDING' ? 'KYC Under Verification' : 
               'Verification Rejected'}
            </h2>
            <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
              {status === 'VERIFIED' ? 'Awesome! Your identity has been verified. You are now a Rentouter and can list your own inventory, earn money, and withdraw payouts without restrictions.' : 
               status === 'PENDING' ? 'Our verification agents are currently reviewing your documents. Once verified you can become a Rentouter and start earning by listing your items. This process typically takes up to 24 hours.' : 
               'We were unable to verify your profile using the submitted documents. Please check the details and try again.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
              <h4 className="font-bold text-slate-700 text-sm mb-4">Aadhaar Card</h4>
              {kycRecord?.document1 && (
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 shadow-sm border border-slate-100">
                  <a href={kycRecord.document1} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    <img src={kycRecord.document1} className="w-full h-full object-cover hover:scale-105 transition-transform" alt="Aadhaar" />
                  </a>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
              <h4 className="font-bold text-slate-700 text-sm mb-4">PAN Card</h4>
              {kycRecord?.document2 && (
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 shadow-sm border border-slate-100">
                  <a href={kycRecord.document2} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    <img src={kycRecord.document2} className="w-full h-full object-cover hover:scale-105 transition-transform" alt="PAN Card" />
                  </a>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
              <h4 className="font-bold text-slate-700 text-sm mb-4">Selfie Photograph</h4>
              {kycRecord?.selfie && (
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 shadow-sm border border-slate-100">
                  <a href={kycRecord.selfie} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    <img src={kycRecord.selfie} className="w-full h-full object-cover hover:scale-105 transition-transform" alt="Selfie" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {status === 'REJECTED' && (
            <button 
              type="button"
              onClick={() => setForceResubmit(true)}
              className="px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              Resubmit KYC Documents
            </button>
          )}
        </div>
      </section>
    );
  }

  // Upload Form State (Empty status, or rejected forcing resubmit)
  return (
    <section className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Shield size={32} className="text-[#635465]" /> KYC Verification
          </h2>
          <p className="text-slate-400 font-medium text-xs mt-1">Upload your documents to complete your profile verification.</p>
        </div>
        {status === 'REJECTED' && (
          <button 
            type="button"
            onClick={() => setForceResubmit(false)}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Aadhaar Card Dropzone */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden group min-h-[300px]">
            <input 
              type="file" 
              id="aadhaar-input" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, 'aadhaar')} 
            />
            <div className="w-full">
              <h3 className="text-lg font-black text-slate-800 mb-2">Aadhaar Card</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">Government Issued ID</p>
            </div>
            
            {aadhaarPreview ? (
              <div className="w-full relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-md border border-slate-100">
                <img src={aadhaarPreview} className="w-full h-full object-cover" alt="Aadhaar Preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                  <button 
                    type="button" 
                    onClick={() => handleRemove('aadhaar')}
                    className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <label 
                htmlFor="aadhaar-input"
                className="flex-1 w-full border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#635465] hover:bg-slate-50/50 transition-all group-hover:scale-[0.98]"
              >
                <div className="p-4 bg-indigo-50 text-[#635465] rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <span className="text-sm font-bold text-slate-600">Select Image File</span>
                <span className="text-[10px] text-slate-400 font-medium mt-1">PNG, JPG up to 10MB</span>
              </label>
            )}
          </div>

          {/* PAN Card Dropzone */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden group min-h-[300px]">
            <input 
              type="file" 
              id="pan-input" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, 'pan')} 
            />
            <div className="w-full">
              <h3 className="text-lg font-black text-slate-800 mb-2">PAN Card</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">Taxpayer ID Identification</p>
            </div>
            
            {panPreview ? (
              <div className="w-full relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-md border border-slate-100">
                <img src={panPreview} className="w-full h-full object-cover" alt="PAN Preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                  <button 
                    type="button" 
                    onClick={() => handleRemove('pan')}
                    className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <label 
                htmlFor="pan-input"
                className="flex-1 w-full border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#635465] hover:bg-slate-50/50 transition-all group-hover:scale-[0.98]"
              >
                <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <span className="text-sm font-bold text-slate-600">Select Image File</span>
                <span className="text-[10px] text-slate-400 font-medium mt-1">PNG, JPG up to 10MB</span>
              </label>
            )}
          </div>

          {/* Selfie Dropzone */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden group min-h-[300px]">
            <input 
              type="file" 
              id="selfie-input" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, 'selfie')} 
            />
            <div className="w-full">
              <h3 className="text-lg font-black text-slate-800 mb-2">Selfie</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">Camera Capture Photograph</p>
            </div>
            
            {selfiePreview ? (
              <div className="w-full relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-md border border-slate-100">
                <img src={selfiePreview} className="w-full h-full object-cover" alt="Selfie Preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                  <button 
                    type="button" 
                    onClick={() => handleRemove('selfie')}
                    className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <label 
                htmlFor="selfie-input"
                className="flex-1 w-full border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#635465] hover:bg-slate-50/50 transition-all group-hover:scale-[0.98]"
              >
                <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Camera size={24} />
                </div>
                <span className="text-sm font-bold text-slate-600">Select Image File</span>
                <span className="text-[10px] text-slate-400 font-medium mt-1">PNG, JPG up to 10MB</span>
              </label>
            )}
          </div>

        </div>

        <div className="flex justify-center">
          <button 
            type="submit"
            disabled={isPending || !aadhaarFile || !panFile || !selfieFile}
            className={`px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer ${
              (!aadhaarFile || !panFile || !selfieFile) 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#635465] text-white hover:bg-[#4d404f] hover:scale-105 shadow-xl shadow-[#635465]/20 hover:shadow-2xl'
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Submitting Documents...
              </>
            ) : (
              <>
                <Shield size={18} />
                Submit Verification Documents
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
