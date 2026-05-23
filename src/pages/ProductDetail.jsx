import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ShieldCheck,
  MapPin,
  Calendar,
  Info,
  Box,
  Palette,
  Truck,
  Heart,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { fetchProductById } from '../services/productService';
import { addToCart, fetchwishlist, addtowishlist, removefromwishlist } from '../services/cartService';
import { sendChatRequest, fetchMyRequests } from '../services/ownerChatService';
import { addItem, selectCartItems } from '../store/cartSlice';
import { toast } from 'react-toastify';
import roomService from '../services/roomService';
import ARViewer from '../components/ARViewer';


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const currentUser = useSelector(selectCurrentUser);
  const [activeImage, setActiveImage] = useState(0);
  const [showAR, setShowAR] = useState(false);

  const cartItems = useSelector(selectCartItems);
  const isInCart = cartItems?.some(item => (item.product?.id || item.product_id) === Number(id));

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['product-detail', id],
    queryFn: () => fetchProductById(id),
  });

  const addToCartMutation = useMutation({
    mutationFn: () => addToCart({ productId: id }),
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error, { position: 'top-center' });
        return;
      }
      dispatch(addItem(data));
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err) => {
      const errorData = err.response?.data;
      // Handle both { error: "msg" } and { detail: "msg" } and nested field errors
      const msg = errorData?.error || errorData?.detail || (errorData && typeof errorData === 'object' ? Object.values(errorData)[0] : null) || 'Already in cart';
      toast.error(Array.isArray(msg) ? msg[0] : msg, { position: 'top-center' });
    },
  });

  // Fetch user's existing requests to check if they already contacted this owner
  const { data: myRequests } = useQuery({
    queryKey: ['my-chat-requests'],
    queryFn: fetchMyRequests,
    enabled: !!localStorage.getItem('access_token'),
  });

  const chatRequestMutation = useMutation({
    mutationFn: (receiverId) => sendChatRequest(receiverId),
    onSuccess: (data) => {
      if (data.msg) {
        toast.success(data.msg);
        queryClient.invalidateQueries({ queryKey: ['my-chat-requests'] });
      } else if (data.error) {
        toast.warning(data.error);
      }
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.error || 'Failed to send request';
      toast.error(errorMsg);
    }
  });

  const { data: wishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchwishlist,
    enabled: !!localStorage.getItem('access_token'),
  });

  const isInWishlist = wishlist?.some(item => {
    const p = item.product || item;
    return p.id === Number(id);
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: () => {
      if (isInWishlist) {
        return removefromwishlist({ productId: id });
      } else {
        return addtowishlist({ productId: id });
      }
    },
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error, { position: 'top-center' });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (err) => {
      const errorData = err.response?.data;
      const msg = errorData?.error || errorData?.detail || 'Failed to update wishlist. Please login.';
      toast.error(msg, { position: 'top-center' });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#635465]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-4">
        <h2 className="text-xl font-bold text-red-500">Product not found</h2>
        <button onClick={() => navigate('/products')} className="text-[#635465] font-bold hover:underline">
          Back to Listings
        </button>
      </div>
    );
  }

  const ownerId = product.owner_id || product.owner || product.owner_details?.id;
  const existingRequest = myRequests?.find(req => req.receiver === ownerId);
  const currentUserId = currentUser ? (currentUser.id || currentUser.pk) : null;
  const isOwner = currentUserId && ownerId && Number(currentUserId) === Number(ownerId);

  const images = product.product_image?.length > 0
    ? product.product_image
    : [{ image_url: 'https://via.placeholder.com/800x1000?text=RentOut.in' }];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-[#635465] transition-colors font-bold text-sm uppercase tracking-widest">
          <ChevronLeft size={20} /> Back
        </button>
        <div className="flex gap-4">
          {product.product_image?.some(img => img.model3d_url) && (
            <button 
              onClick={() => setShowAR(true)}
              className="flex items-center gap-2 bg-[#635465]/10 text-[#635465] px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#635465] hover:text-white transition-all border border-[#635465]/20 shadow-sm"
            >
              <Box size={16} /> View in Room
            </button>
          )}
          <button 
            onClick={() => toggleWishlistMutation.mutate()}
            disabled={toggleWishlistMutation.isPending}
            className={`p-3 rounded-2xl shadow-sm border border-slate-100 transition-all disabled:opacity-50 ${isInWishlist ? 'bg-red-50 text-red-500' : 'bg-white text-slate-400 hover:text-red-500'}`}
          >
            <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
          </button>
          <button className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-[#635465] transition-all">
            <Share2 size={20} />
          </button>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 aspect-[4/5] relative group">
            <img
              src={images[activeImage].image_url}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            
            {images.length > 1 && (
              <>
                {/* Left Arrow */}
                <button
                  onClick={() => setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-slate-800 shadow-md transition-all z-10"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {/* Right Arrow */}
                <button
                  onClick={() => setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-slate-800 shadow-md transition-all z-10"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm transition-all">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`h-2 rounded-full transition-all ${
                        activeImage === idx ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {product.is_active === false && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs">Currently Unavailable</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === idx ? 'border-[#635465] shadow-lg scale-105' : 'border-transparent opacity-60'
                    }`}
                >
                  <img src={img.image_url || null} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Action */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-[#635465] uppercase tracking-[0.2em] bg-[#635465]/5 px-3 py-1.5 rounded-full w-fit">
              <CheckCircle2 size={12} /> Quality Verified
            </div>
            <h1 className="text-4xl font-black text-slate-900 leading-tight">{product.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
              <span className="flex items-center gap-1.5"><MapPin size={16} /> {product.locality}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Box size={16} /> {product.category_name}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Daily Rental</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹{product.price_per_day}</span>
                  <span className="text-slate-400 font-bold">/ day</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Deposit</p>
                <p className="text-xl font-bold text-slate-800">₹{product.security_deposit || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Min. Rental</span>
                </div>
                <p className="font-bold text-slate-800">{product.min_rental_days || 1} Days</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Truck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Delivery</span>
                </div>
                <p className="font-bold text-slate-800">Available</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => addToCartMutation.mutate()}
                disabled={addToCartMutation.isPending || product.is_active === false || isInCart}
                className={`py-5 rounded-[1.5rem] font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isInCart 
                    ? 'bg-green-50 text-green-600 border border-green-200' 
                    : 'bg-[#635465] text-white shadow-[#635465]/30 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {addToCartMutation.isPending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                ) : isInCart ? (
                  <>
                    <CheckCircle2 size={18} />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Add to Cart
                  </>
                )}
              </button>

              <AddProductToRoomButton productId={id} hasModel={product.product_image?.some(img => img.model3d_url)} />
            </div>

            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Price includes GST & Routine Maintenance
            </p>
          </div>

          {/* Details Tabs/List */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 italic">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <SpecItem icon={<Palette size={18} />} label="Color" value={product.color || 'Multi'} />
              <SpecItem icon={<Box size={18} />} label="Brand" value={product.brand_name || 'Generic'} />
              <SpecItem icon={<ShieldCheck size={18} />} label="Material" value={product.material || 'Premium Fabric'} />
              <SpecItem icon={<Info size={18} />} label="Condition" value="Like New" />
            </div>
          </div>

          {/* Owner Card */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#CDB4DB] to-[#A2D2FF] rounded-full flex items-center justify-center text-white font-bold">
                {product.owner_details?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listed by</p>
                <p className="font-bold text-slate-800">@{product.owner_details?.username}</p>
              </div>
            </div>
            {isOwner ? (
              <span className="text-xs font-black uppercase px-4 py-2 rounded-xl text-[#635465] bg-[#635465]/10 border border-[#635465]/20">
                Owner is you
              </span>
            ) : (
              <button
                onClick={() => chatRequestMutation.mutate(product.owner_id)}
                disabled={chatRequestMutation.isPending || !!existingRequest}
                className={`text-xs font-black uppercase border px-4 py-2 rounded-xl transition-all disabled:opacity-50 ${existingRequest?.status === 'accepted'
                  ? 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
                  : existingRequest?.status === 'pending'
                    ? 'border-amber-500 text-amber-500 bg-amber-50'
                    : 'border-[#635465]/20 text-[#635465] hover:bg-[#635465] hover:text-white'
                  }`}
              >
                {chatRequestMutation.isPending ? 'Sending...' :
                  existingRequest?.status === 'accepted' ? 'Chat Now' :
                    existingRequest?.status === 'pending' ? 'Request Sent' :
                      'Contact Owner'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AR Modal Overlay */}
      {showAR && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10 overflow-hidden animate-in fade-in duration-300">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
             <div className="flex-1 min-h-0">
               <ARViewer 
                 products={[{
                   modelUrl: product.product_image.find(img => img.model3d_url)?.model3d_url,
                   usdzUrl: product.product_image.find(img => img.usdz_url)?.usdz_url,
                   thumbnail: images[0].image_url,
                   name: product.title
                 }]}
                 onClose={() => setShowAR(false)}
               />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SpecItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 group">
    <div className="p-3 bg-white rounded-xl text-slate-400 group-hover:text-[#635465] transition-colors border border-slate-50 shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

const AddProductToRoomButton = ({ productId, hasModel }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms-list'],
    queryFn: () => roomService.getRooms(),
    enabled: showDropdown,
  });

  const addToRoomMutation = useMutation({
    mutationFn: (roomId) => roomService.addProductToRoom(roomId, productId),
    onSuccess: () => {
      toast.success('Added to room successfully!');
      setShowDropdown(false);
    },
    onError: (err) => {
      toast.error('Failed to add to room. Make sure you have created a room.');
    },
  });

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full py-5 rounded-[1.5rem] font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95"
      >
        <Box size={18} className={hasModel ? 'text-green-500' : 'text-slate-400'} />
        Add to Room
      </button>

      {showDropdown && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[60] max-h-48 overflow-y-auto scrollbar-hide">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-2 mb-1 border-b border-slate-50">Select Room</p>
          {isLoading ? (
            <div className="p-4 text-center"><div className="animate-spin rounded-full h-4 w-4 border-2 border-[#635465] border-t-transparent mx-auto" /></div>
          ) : rooms?.results?.length > 0 ? (
            rooms.results.map(room => (
              <button
                key={room.id}
                onClick={() => addToRoomMutation.mutate(room.id)}
                disabled={addToRoomMutation.isPending}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between transition-colors disabled:opacity-50"
              >
                {room.title}
                {addToRoomMutation.isPending && <div className="animate-spin rounded-full h-3 w-3 border-2 border-[#635465] border-t-transparent" />}
              </button>
            ))
          ) : (
            <div className="p-4 text-center">
              <p className="text-[10px] text-slate-400 font-bold mb-2">No rooms found</p>
              <a href="/room" className="text-[10px] text-[#635465] font-black uppercase hover:underline">Create a Room</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;

