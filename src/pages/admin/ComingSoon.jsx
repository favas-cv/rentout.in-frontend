import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, UserCog, ArrowLeft, Wrench, Sparkles } from 'lucide-react';

const ComingSoon = ({ section }) => {
  // Get corresponding icon and details based on section name
  const getSectionDetails = () => {
    switch (section) {
      case 'Products':
        return {
          icon: <Package className="w-12 h-12 text-violet-500" />,
          title: 'Products Inventory',
          description: 'A comprehensive catalog management dashboard to oversee all products listed for rent, manage category trees, track stock cycles, and control inventory statuses.',
          progress: 85,
          colorClass: 'text-violet-500 bg-violet-50 border-violet-100',
          accentColor: '#8B5CF6',
        };
      case 'Users':
        return {
          icon: <Users className="w-12 h-12 text-emerald-600" />,
          title: 'User Management',
          description: 'An administrative hub to monitor registered users, manage permissions, resolve flags, track user activity logs, and secure user data compliance.',
          progress: 70,
          colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
          accentColor: '#10B981',
        };
      case 'Owners':
        return {
          icon: <UserCog className="w-12 h-12 text-amber-600" />,
          title: 'Owner Console',
          description: 'A dedicated control center to review landlord and owner profiles, track booking payout cycles, manage commissions, and monitor owner compliance guidelines.',
          progress: 60,
          colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
          accentColor: '#F59E0B',
        };
      default:
        return {
          icon: <Wrench className="w-12 h-12 text-blue-600" />,
          title: 'Admin Utility',
          description: 'This section is currently being updated to bring more control options to your fingertips.',
          progress: 50,
          colorClass: 'text-blue-600 bg-blue-50 border-blue-100',
          accentColor: '#2563EB',
        };
    }
  };

  const details = getSectionDetails();

  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in slide-in-from-bottom-5 duration-500">
      
      {/* Premium Outer Container */}
      <div className="max-w-2xl w-full bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-8 md:p-12 text-center relative overflow-hidden">
        
        {/* Decorative background elements */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-slate-50 rounded-full opacity-50 blur-xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-slate-50 rounded-full opacity-50 blur-xl pointer-events-none" />

        {/* Feature Icon Shield */}
        <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center shadow-lg border relative ${details.colorClass} mb-8`}>
          {details.icon}
          
          {/* Subtle Sparkle Badge */}
          <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-[#635465] to-[#8d7790] text-white p-1.5 rounded-xl shadow-md">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </span>
        </div>

        {/* Text Details */}
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-3">
          {details.title}
        </h1>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-[#635465] bg-slate-100 mb-6">
          Feature Coming Soon
        </div>

        <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-10 text-sm md:text-base">
          {details.description}
        </p>

        {/* Custom Progress Bar Indicator */}
        <div className="max-w-md mx-auto bg-slate-100 h-2.5 rounded-full mb-10 overflow-hidden relative" title={`Development Progress: ${details.progress}%`}>
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out" 
            style={{ 
              width: `${details.progress}%`,
              backgroundColor: details.accentColor,
              backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
              backgroundSize: '1rem 1rem'
            }}
          />
        </div>

        {/* Back Link Button */}
        <Link 
          to="/admin" 
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 hover:scale-105 active:scale-98 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Dashboard
        </Link>
      </div>
      
    </div>
  );
};

export default ComingSoon;
