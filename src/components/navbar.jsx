import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, MessageSquare, Home, Shield } from 'lucide-react';
import { selectCartCount } from '../store/cartSlice';
import { selectIsAuthenticated, selectCurrentUser } from '../store/authSlice';
import { setSearchQuery } from '../store/uiSlice';
import NotificationBell from './notifications/NotificationBell';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartCount = useSelector(selectCartCount);           // From Redux cartSlice
  const isAuthenticated = useSelector(selectIsAuthenticated); // From Redux authSlice
  const currentUser = useSelector(selectCurrentUser);         // From Redux authSlice

  const [localSearch, setLocalSearch] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!localSearch.trim()) return;
    dispatch(setSearchQuery(localSearch.trim())); // products page reads this on mount
    navigate('/products');
    setLocalSearch(''); // clear navbar input after submit
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Logo */}
      <Link to="/">
        <div className="text-xl font-bold tracking-tight text-[#756477]">Rentout.india</div>
      </Link>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-1/3 hidden md:block">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search curated furniture..."
          className="w-full py-2 pl-10 pr-4 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-slate-200 outline-none"
        />
      </form>

      {/* Actions */}
      <div className="flex items-center gap-6">
        {/* Chats Link - Desktop Only */}
        {isAuthenticated && (
          <Link to="/my-chats" className="relative cursor-pointer text-slate-700 hover:text-[#635465] transition-colors hidden md:block" title="My Chats">
            <MessageSquare size={20} />
          </Link>
        )}

        {/* 3D Room Link */}
        <Link to="/room" className="relative cursor-pointer text-slate-700 hover:text-[#635465] transition-colors" title="3D Room Visualizer">
          <Home size={20} />
        </Link>

        {/* Staff Dashboard - Staff Only */}
        {currentUser?.is_staff && (
          <Link to="/admin" className="relative cursor-pointer text-slate-700 hover:text-[#635465] transition-colors" title="Staff Dashboard">
            <Shield size={20} />
          </Link>
        )}

        {/* Cart Icon with live badge from Redux – hidden for blocked users */}
        {currentUser?.is_live !== false && (
          <div className="relative cursor-pointer">
            <Link to="/cart">
              <ShoppingCart size={20} className="text-slate-700 hover:text-[#635465] transition-colors" />
            </Link>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
        )}

        {/* User avatar or login link */}
        {isAuthenticated ? (
          <Link to={currentUser?.is_staff ? "/admin" : "/profile"}>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden cursor-pointer border border-gray-100 hover:ring-2 hover:ring-[#CDB4DB] transition-all">
              <User size={20} className="text-slate-500" />
            </div>
          </Link>
        ) : (
          <Link
            to="/auth"
            className="text-xs font-bold text-[#635465] border border-[#635465] rounded-full px-4 py-1.5 hover:bg-[#635465] hover:text-white transition-all"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;