import React from 'react';
import { ShoppingBag, LayoutDashboard, CreditCard, Heart, Star, Shield, LogOut, ChevronRight, Bell, MessageSquare } from 'lucide-react';

const DashboardCard = ({ icon, title, subtitle, onClick, color }) => (
  <button 
    onClick={onClick}
    className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
  >
    <div className={`p-5 rounded-3xl mb-6 transition-transform group-hover:scale-110 ${color}`}>
      {icon}
    </div>
    <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
    <p className="text-xs text-slate-400 font-medium leading-relaxed">{subtitle}</p>
    <div className="mt-6 p-2 bg-slate-50 rounded-full text-slate-300 group-hover:bg-[#635465] group-hover:text-white transition-all">
      <ChevronRight size={16} />
    </div>
  </button>
);

const DashboardGrid = ({ user, onSectionChange, onLogout }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <DashboardCard 
          icon={<ShoppingBag size={24} />} 
          title="My Orders" 
          subtitle="Track your rentals and history" 
          onClick={() => onSectionChange('orders')}
          color="bg-indigo-50 text-indigo-500"
        />
        {user?.is_live !== false && (
          <DashboardCard 
            icon={<Heart size={24} />} 
            title="My Wishlist" 
            subtitle="Items saved for later" 
            onClick={() => onSectionChange('wishlist')}
            color="bg-red-50 text-red-500"
          />
        )}
        
        {user?.is_live !== false && (
          <DashboardCard 
            icon={<LayoutDashboard size={24} />} 
            title={user?.is_owner || user?.is_verified ? "Manage My Items" : "Start Listing"} 
            subtitle={user?.is_owner || user?.is_verified ? "Listings, availability, and pricing" : "Earn money by renting your items"} 
            onClick={() => onSectionChange('listings')}
            color="bg-emerald-50 text-emerald-500"
          />
        )}
        <DashboardCard 
          icon={<CreditCard size={24} />} 
          title={user?.is_owner || user?.is_verified ? "Payments & Invoices" : "Earnings"} 
          subtitle={user?.is_owner || user?.is_verified ? "Transaction history and billing" : "Track your rental income"} 
          onClick={() => onSectionChange('payments')}
          color="bg-amber-50 text-amber-500"
        />
        <DashboardCard 
          icon={<Bell size={24} />} 
          title="Notifications" 
          subtitle="Updates and alerts" 
          onClick={() => onSectionChange('notifications')}
          color="bg-purple-50 text-purple-500"
        />
        <DashboardCard 
          icon={<MessageSquare size={24} />} 
          title="My Chats" 
          subtitle="Conversations and requests" 
          onClick={() => { window.location.href = '/my-chats'; }}
          color="bg-blue-50 text-blue-500"
        />
        <DashboardCard 
          icon={<Shield size={24} />} 
          title="KYC Verification" 
          subtitle="Aadhaar, PAN & selfie verification" 
          onClick={() => onSectionChange('kyc')}
          color="bg-rose-50 text-rose-500"
        />
      </div>

      <div className="flex justify-center mb-16">
        <button 
          onClick={onLogout}
          className="group flex items-center gap-4 bg-white px-10 py-6 rounded-[2rem] border border-slate-100 shadow-sm hover:bg-red-50 hover:border-red-100 transition-all"
        >
          <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:scale-110 transition-transform">
            <LogOut size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-black text-slate-800 group-hover:text-red-600 transition-colors">Sign Out</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Securely end your session</p>
          </div>
        </button>
      </div>
    </>
  );
};

export default DashboardGrid;
