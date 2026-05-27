import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, MessageSquare, Home, Shield, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!localSearch.trim()) return;
    dispatch(setSearchQuery(localSearch.trim())); // products page reads this on mount
    navigate('/products');
    setLocalSearch(''); // clear navbar input after submit
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
        {/* Logo */}
        <Link to="/">
          <div className="text-lg sm:text-xl font-bold tracking-tight text-[#756477]">Rentout.in</div>
        </Link>

        {/* Search Bar — desktop only */}
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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          {/* Chats Link */}
          {isAuthenticated && (
            <Link to="/my-chats" className="relative cursor-pointer text-slate-700 hover:text-[#635465] transition-colors" title="My Chats">
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

        {/* Mobile: Cart + Hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Cart on mobile */}
          {currentUser?.is_live !== false && (
            <div className="relative cursor-pointer">
              <Link to="/cart">
                <ShoppingCart size={20} className="text-slate-700" />
              </Link>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] z-40 bg-white/95 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col p-6 gap-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative mb-4">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search curated furniture..."
                className="w-full py-3 pl-10 pr-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                autoFocus
              />
            </form>

            {/* Mobile Links */}
            <Link to="/room" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors">
              <Home size={20} className="text-[#635465]" /> 3D Room Visualizer
            </Link>

            {isAuthenticated && (
              <Link to="/my-chats" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors">
                <MessageSquare size={20} className="text-[#635465]" /> My Chats
              </Link>
            )}

            {currentUser?.is_staff && (
              <Link to="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors">
                <Shield size={20} className="text-[#635465]" /> Staff Dashboard
              </Link>
            )}

            {/* Divider */}
            <div className="border-t border-slate-100 my-2" />

            {/* Auth */}
            {isAuthenticated ? (
              <Link to={currentUser?.is_staff ? "/admin" : "/profile"} onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors">
                <User size={20} className="text-[#635465]" /> My Profile
              </Link>
            ) : (
              <Link
                to="/auth"
                onClick={closeMobileMenu}
                className="mt-2 text-center text-sm font-bold text-white bg-[#635465] rounded-2xl px-6 py-3.5 hover:bg-[#524554] transition-all"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;