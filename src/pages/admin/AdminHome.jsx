import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { selectCurrentUser } from '../../store/authSlice';
import { ShieldCheck, Package, Users, UserCog, Clock, ArrowRight } from 'lucide-react';

const cards = [
  {
    label: 'KYC Requests',
    description: 'Review and approve user identity verifications.',
    icon: <ShieldCheck className="w-7 h-7 text-blue-600" />,
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    to: '/admin/kyc',
    active: true,
  },
  {
    label: 'Products',
    description: 'Manage all listings and rental products on the platform.',
    icon: <Package className="w-7 h-7 text-violet-500" />,
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    to: '/admin/products',
    active: true,
  },
  {
    label: 'Users',
    description: 'View and manage registered user accounts.',
    icon: <Users className="w-7 h-7 text-emerald-600" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    to: '/admin/users',
    active: true,
  },
  {
    label: 'Owners',
    description: 'Manage property and product owner profiles.',
    icon: <UserCog className="w-7 h-7 text-amber-600" />,
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    to: '/admin/owners',
    active: true,
  },
];

const AdminHome = () => {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="py-6">
      {/* Welcome header */}
      <div className="mb-10">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">
          Admin Section
        </p>
        <h1 className="text-3xl font-black text-slate-800 mb-2">
          Welcome to Rentout<span className="text-blue-600">.in</span> Admin
        </h1>
        <p className="text-slate-500 text-base">
          Hello{user?.username ? `, ${user.username}` : ''}! Use the panels below to manage the platform.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border ${card.border} ${card.bg} p-6 flex flex-col gap-4 shadow-sm transition-all duration-200 ${
              card.active ? 'hover:shadow-md hover:-translate-y-0.5' : 'opacity-60'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border ${card.border}`}>
              {card.icon}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">{card.label}</h2>
              <p className="text-sm text-slate-500 leading-snug">{card.description}</p>
            </div>

            {card.active ? (
              <NavLink
                to={card.to}
                className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
              >
                Open <ArrowRight className="w-4 h-4" />
              </NavLink>
            ) : (
              <span className="mt-auto flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-100 w-fit px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3" /> Coming Soon
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
