import React from 'react';
import { Package, ShoppingBag, IndianRupee, TrendingUp } from 'lucide-react';

const StatsGrid = ({ stats, products, orders }) => {
  const statCards = [
    { 
      label: "Total Products", 
      value: stats?.total_products || products?.length || 0, 
      icon: Package, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Active Orders", 
      value: stats?.active_orders || orders?.length || 0, 
      icon: ShoppingBag, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      label: "Total Revenue", 
      value: `₹${(stats?.total_revenue || 0).toLocaleString()}`, 
      icon: IndianRupee, 
      color: "text-amber-600", 
      bg: "bg-amber-50" 
    },
    { 
      label: "Monthly Growth", 
      value: "+12.5%", 
      icon: TrendingUp, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50" 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
      {statCards.map((stat, i) => (
        <div key={i} className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className={`p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <div>
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-0.5 sm:mb-1">{stat.label}</p>
            <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900">{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
