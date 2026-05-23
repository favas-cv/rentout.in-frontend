import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, ShoppingCart, CheckCircle2, Home, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { addItem, selectCartItems } from '../store/cartSlice';
import { selectIsAuthenticated } from '../store/authSlice';
import { addToCart, fetchwishlist, addtowishlist, removefromwishlist } from '../services/cartService';
import roomService from '../services/roomService';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const cartItems = useSelector(selectCartItems);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [roomList, setRoomList] = useState([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowRoomDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    id,
    title,
    price_per_day,
    owner_details,
    color,
    is_active,
    product_image,
    brand_name,
    locality,
    material,
    min_rental_days,
    available,
    unavailable_reason,
  } = product;

  const isInCart = cartItems?.some(item => (item.product?.id || item.product_id) === id);

  const imageUrl =
    product_image && product_image.length > 0
      ? product_image[0].image_url
      : 'https://via.placeholder.com/400x500?text=RentOut.in';

  // Add to cart mutation
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

  const { data: wishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchwishlist,
    enabled: !!localStorage.getItem('access_token'),
  });

  const isInWishlist = wishlist?.some(item => {
    const p = item.product || item;
    return p.id === id;
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
      const msg = errorData?.error || errorData?.detail || 'Please login to wishlist products';
      toast.error(msg, { position: 'top-center' });
    }
  });

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 group relative ${
        available === false ? 'border-red-100 bg-slate-50/50' : 'border-slate-100 hover:shadow-md'
      } ${is_active === false ? 'opacity-60' : ''}`}
    >
      {/* IMAGE - Clickable */}
      <Link to={`/products/${id}`} className="block relative aspect-[4/5] overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-500 ${
              available === false ? 'blur-[0.5px] opacity-60' : 'group-hover:scale-105'
          }`}
        />
        {available === false && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-sm font-medium text-red-600">
              {unavailable_reason || 'Currently Unavailable'}
            </span>
          </div>
        )}

        {price_per_day < 1000 && available !== false && (
          <span className="absolute top-4 left-4 bg-green-600/90 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
            Budget Pick
          </span>
        )}

        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlistMutation.mutate(); }}
          disabled={toggleWishlistMutation.isPending}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors disabled:opacity-50 z-20 ${isInWishlist ? 'bg-red-50 text-red-500' : 'bg-white/80 text-slate-400 hover:text-red-500'}`}
        >
          <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>
      </Link>

      {/* CONTENT */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-1">
          <Link to={`/products/${id}`} className="hover:text-[#635465] transition-colors">
            <h3 className="font-bold text-slate-800 text-lg capitalize line-clamp-1">{title}</h3>
          </Link>
          <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-500">
            @{owner_details?.username}
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-2 italic">{brand_name} • {material}</p>
        <p className="text-xs text-slate-400 mb-3">📍 {locality} • Color: {color || 'Multi'}</p>
        <p className="text-xs text-slate-400 mb-4">Min {min_rental_days} days</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900">₹{price_per_day}</span>
            <span className="text-xs text-slate-400">/ day</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Add to Room button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={async (e) => {
                  e.preventDefault(); e.stopPropagation();
                  if (!isAuthenticated) { toast.info('Login to add products to your room'); return; }
                  if (showRoomDropdown) { setShowRoomDropdown(false); return; }
                  setRoomLoading(true);
                  try {
                    const data = await roomService.getRooms();
                    setRoomList(data.results || []);
                    setShowRoomDropdown(true);
                  } catch { toast.error('Could not fetch rooms'); }
                  finally { setRoomLoading(false); }
                }}
                title="Add to Room"
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:border-[#635465] hover:text-[#635465] transition-all"
              >
                {roomLoading ? <Loader2 size={14} className="animate-spin" /> : <Home size={14} />}
              </button>

              {/* Room dropdown */}
              {showRoomDropdown && (
                <div className="absolute right-0 bottom-10 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 min-w-[160px]">
                  {roomList.length === 0 ? (
                    <p className="text-[10px] font-bold text-slate-400 px-3 py-2 uppercase tracking-widest">No rooms yet.<br/>Create one first.</p>
                  ) : (
                    roomList.map(room => (
                      <button
                        key={room.id}
                        onClick={async (e) => {
                          e.preventDefault(); e.stopPropagation();
                          try {
                            await roomService.addProductToRoom(room.id, id);
                            toast.success(`Added to "${room.title}"!`);
                          } catch { toast.error('Failed to add to room'); }
                          setShowRoomDropdown(false);
                        }}
                        className="w-full text-left text-xs font-bold text-slate-700 hover:bg-[#635465]/10 hover:text-[#635465] px-3 py-2 rounded-xl transition-all block truncate"
                      >
                        {room.title}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Cart button */}
            {available === false ? (
              <button
                disabled
                className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              >
                Please Remove
              </button>
            ) : (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCartMutation.mutate(); }}
                disabled={addToCartMutation.isPending || is_active === false || isInCart}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                  isInCart 
                    ? 'bg-green-50 text-green-600 border border-green-100 cursor-default' 
                    : 'bg-[#635465] hover:bg-[#524554] text-white disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isInCart ? (
                  <>
                    <CheckCircle2 size={14} />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} />
                    {addToCartMutation.isPending ? 'Adding...' : 'Add'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;