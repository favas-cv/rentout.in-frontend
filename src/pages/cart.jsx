import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { fetchCart, removeFromCart } from '../services/cartService';
import { setCartItems, removeItem, selectCartItems } from '../store/cartSlice';
import { selectCurrentUser } from '../store/authSlice';
import CartItem from './cartitem';
import OrderSummary from './ordersummary';
import { toast } from 'react-toastify';

const CartPage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const cartItems = useSelector(selectCartItems);
  const currentUser = useSelector(selectCurrentUser);

  // Blocked users cannot access the cart
  if (currentUser?.is_live === false) {
    return <Navigate to="/profile" replace />;
  }

  // Fetch cart
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });

  // Sync data to Redux manually since onSuccess is removed in TanStack Query v5
  useEffect(() => {
    if (data) {
      dispatch(setCartItems(data));
    }
  }, [data, dispatch]);

  // Remove item
  const removeMutation = useMutation({
    mutationFn: removeFromCart,
    onMutate: (itemId) => {
      dispatch(removeItem(itemId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.info('Item removed from cart');
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.error('Failed to remove item');
    },
  });
  console.log("cartItems:", cartItems);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#635465]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-10 text-red-500 font-medium">
        {error?.message || 'Failed to load cart'}. Make sure you are logged in.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-[#F8FAFC]">

      {/* Empty */}
      {!cartItems || cartItems.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
          <p className="text-slate-400 mb-6">Browse our collection and add items to rent.</p>
          <a
            href="/products"
            className="inline-block bg-[#635465] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#524554]"
          >
            Browse Products
          </a>
        </div>
      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Items */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Your Selection</h2>
                <span className="text-slate-500 text-sm">{cartItems.length} Items</span>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onRemove={() => removeMutation.mutate(item.id)}
                    isRemoving={removeMutation.isPending}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <OrderSummary />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;