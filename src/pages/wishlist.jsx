import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { fetchwishlist } from '../services/cartService';
import { selectCurrentUser } from '../store/authSlice';
import ProductCard from './productcard';
import { Link, Navigate } from 'react-router-dom';

const WishlistPage = () => {
  const currentUser = useSelector(selectCurrentUser);
  const { data: wishlistItems, isLoading, isError, error } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchwishlist,
    enabled: currentUser?.is_live !== false,
  });

  // Blocked users cannot access wishlist
  if (currentUser?.is_live === false) {
    return <Navigate to="/profile" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#635465]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-10 text-red-500 font-medium min-h-[60vh] flex items-center justify-center">
        <div>
          <p className="text-xl mb-2">Failed to load wishlist</p>
          <p className="text-sm text-slate-500">{error?.message || 'Make sure you are logged in.'}</p>
        </div>
      </div>
    );
  }

  // Handle case where wishlist returns either { id: item_id, product: {...} } or product directly
  const products = (wishlistItems || []).map(item => {
    if (item.product && typeof item.product === 'object') {
      return {
        ...item.product,
        available: item.available,
        unavailable_reason: item.unavailable_reason
      };
    }
    return item;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-[#F8FAFC] min-h-[80vh]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-slate-900">My Wishlist</h1>
        <span className="text-slate-500 font-medium">{products.length} Items</span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-6xl mb-4">🤍</p>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your wishlist is empty</h2>
          <p className="text-slate-400 mb-6">Save items you like to your wishlist to easily find them later.</p>
          <Link
            to="/products"
            className="inline-block bg-[#635465] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#524554] hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
