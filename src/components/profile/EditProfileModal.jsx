import React from 'react';
import { X, Camera, Loader2 } from 'lucide-react';

const EditProfileModal = ({ user, preview, isOpen, onClose, onSubmit, onImageChange, isPending }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-xl p-12 relative shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={28} />
        </button>
        <h2 className="text-4xl font-black mb-10 text-slate-900">Edit Profile</h2>
        
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 relative group">
              <img src={preview || user?.profile_pic_url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="" />
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
                <input type="file" name="profile_pic" onChange={onImageChange} className="hidden" />
              </label>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Change Photo</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">First Name</label>
              <input name="first_name" defaultValue={user?.first_name} className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Last Name</label>
              <input name="last_name" defaultValue={user?.last_name} className="w-full bg-slate-50 rounded-2xl px-6 py-4 outline-none border border-slate-100 font-bold" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#635465] text-white py-5 rounded-2xl font-black shadow-xl shadow-[#635465]/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {isPending ? <Loader2 className="animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
