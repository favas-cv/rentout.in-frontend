import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Package, Users, UserCog, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Admin top navigation bar – white themed with nav links.
 * Products / Users / Owners are placeholders (API coming soon).
 */
const AdminNavbar = () => {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (logout) await logout();
    else navigate('/auth');
  };

  const navLinks = [
    {
      label: 'KYC Requests',
      to: '/admin/kyc',
      icon: <ShieldCheck className="w-4 h-4" />,
      active: true,
    },
    {
      label: 'Products',
      to: '/admin/products',
      icon: <Package className="w-4 h-4" />,
      active: true,
    },
    {
      label: 'Users',
      to: '/admin/users',
      icon: <Users className="w-4 h-4" />,
      active: true,
    },
    {
      label: 'Owners',
      to: '/admin/owners',
      icon: <UserCog className="w-4 h-4" />,
      active: true,
    },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* Brand */}
        <NavLink to="/admin" className="flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span className="text-base font-bold text-gray-800 tracking-tight">
            Rentout<span className="text-blue-600">.in</span>{' '}
            <span className="font-medium text-gray-500 text-sm">Admin</span>
          </span>
        </NavLink>

        {/* Nav links */}
        <nav className="flex items-center gap-1 overflow-x-auto">
          {navLinks.map((link) =>
            link.active ? (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ) : (
              <button
                key={link.label}
                disabled
                title="Coming soon"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap text-gray-400 cursor-not-allowed relative group"
              >
                {link.icon}
                {link.label}
                <span className="ml-1 flex items-center gap-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  <Clock className="w-2.5 h-2.5" /> Soon
                </span>
              </button>
            )
          )}
        </nav>

        {/* User + Logout */}
        <div className="flex items-center gap-3 shrink-0">
          {user && (
            <span className="text-sm text-gray-500 hidden sm:block max-w-[160px] truncate">
              {user.email || user.username}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
