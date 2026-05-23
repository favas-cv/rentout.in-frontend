import React from 'react';
import { ShieldCheck, Mail, MapPin, Camera, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileHeader = ({ user, initials, displayName, onEditClick, onSetupOwnerClick }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
      <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        {/* Avatar Section */}
        <div className="relative group">
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10">
            {user?.profile_pic_url ? (
              <img src={user.profile_pic_url} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#635465] to-[#CDB4DB] flex items-center justify-center text-4xl font-black text-white">
                {initials}
              </div>
            )}
          </div>
          <button 
            onClick={onEditClick}
            className="absolute bottom-2 right-2 z-20 p-3 bg-white rounded-full shadow-lg text-slate-500 hover:text-[#635465] transition-all hover:scale-110 border border-slate-100"
          >
            <Camera size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{displayName}</h1>
            <span className="w-fit mx-auto md:mx-0 px-3 py-1 bg-indigo-50 text-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 border border-indigo-100/50">
              <ShieldCheck size={12} /> Verified
            </span>
          </div>
          
          <div className="flex flex-col gap-2 text-slate-400 font-bold text-sm">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Mail size={16} /> {user?.email}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <MapPin size={16} /> {user?.locality || 'Location not set'}
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
            {user?.is_owner ? (
              <button 
                onClick={() => navigate('/owner/dashboard')}
                className="px-8 py-3 bg-[#635465] text-white rounded-2xl font-black text-sm shadow-xl shadow-[#635465]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <LayoutDashboard size={18} /> Owner Dashboard
              </button>
            ) : (
              <button 
                onClick={onSetupOwnerClick}
                className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <ShieldCheck size={18} /> Setup to become Owner
              </button>
            )}
            <button 
              onClick={onEditClick}
              className="px-8 py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all border border-slate-100"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
