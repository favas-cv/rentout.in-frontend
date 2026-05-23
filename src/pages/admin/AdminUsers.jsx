import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminUsers, updateAdminUser } from '../../services/kycService';
import { 
  Users, 
  ShieldAlert, 
  CheckCircle, 
  Ban, 
  Search, 
  User, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // ALL, OWNERS, RENTERS, ACTIVE, BLOCKED

  // Fetch users list
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: fetchAdminUsers,
  });

  // Extract users safely
  const usersList = usersData?.results || (Array.isArray(usersData) ? usersData : []);

  // Mutation to block/unblock user
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminUser(id, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries(['admin-users-list']);
      toast.success(`User "${updatedUser.email}" updated successfully`);
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to update user status';
      toast.error(errorMsg);
    }
  });

  const handleToggleActive = (id, currentActive) => {
    updateUserMutation.mutate({
      id,
      data: { is_active: !currentActive }
    });
  };

  // Filter users based on search query and role filters
  const filteredUsers = usersList.filter(userItem => {
    const matchesSearch = userItem.email?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    switch (roleFilter) {
      case 'OWNERS':
        return userItem.is_owner === true;
      case 'RENTERS':
        return userItem.is_owner === false;
      case 'ACTIVE':
        return userItem.is_active === true;
      case 'BLOCKED':
        return userItem.is_active === false;
      case 'ALL':
      default:
        return true;
    }
  });

  // Metrics
  const metrics = {
    total: usersList.length,
    owners: usersList.filter(u => u.is_owner === true).length,
    renters: usersList.filter(u => u.is_owner === false).length,
    active: usersList.filter(u => u.is_active === true).length,
    blocked: usersList.filter(u => u.is_active === false).length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-2">
            <Users className="text-[#635465]" size={36} />
            User Access Center
          </h1>
          <p className="text-slate-500 font-medium">Manage user credentials, review account roles, and suspend or restore user login access.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Accounts</div>
            <div className="text-3xl font-black text-slate-800">{metrics.total}</div>
          </div>
          <div className="bg-amber-50/50 rounded-3xl p-5 border border-amber-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">Owners</div>
            <div className="text-3xl font-black text-amber-700">{metrics.owners}</div>
          </div>
          <div className="bg-sky-50/50 rounded-3xl p-5 border border-sky-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="text-sky-600 text-xs font-bold uppercase tracking-wider mb-2">Renters</div>
            <div className="text-3xl font-black text-sky-700">{metrics.renters}</div>
          </div>
          <div className="bg-emerald-50/50 rounded-3xl p-5 border border-emerald-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2">Active</div>
            <div className="text-3xl font-black text-emerald-700">{metrics.active}</div>
          </div>
          <div className="bg-rose-50/50 rounded-3xl p-5 border border-rose-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="text-rose-600 text-xs font-bold uppercase tracking-wider mb-2">Blocked</div>
            <div className="text-3xl font-black text-rose-700">{metrics.blocked}</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search users by email address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-[#635465]/20 focus:bg-white text-sm font-medium transition-all outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {['ALL', 'OWNERS', 'RENTERS', 'ACTIVE', 'BLOCKED'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setRoleFilter(tab)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    roleFilter === tab 
                      ? 'bg-[#635465] text-white shadow-md' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          {isLoading ? (
            <div className="p-20 flex flex-col justify-center items-center gap-3">
              <Loader2 className="animate-spin text-slate-300" size={40} />
              <span className="text-sm font-semibold text-slate-400">Loading accounts...</span>
            </div>
          ) : error ? (
            <div className="p-20 text-center">
              <AlertTriangle className="mx-auto text-rose-500 mb-4" size={40} />
              <h3 className="text-lg font-bold text-slate-800 mb-1">Failed to load accounts</h3>
              <p className="text-slate-400 text-sm">{error.message || 'Please check your connection and try again.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="p-6 whitespace-nowrap">User</th>
                    <th className="p-6 whitespace-nowrap">User ID</th>
                    <th className="p-6 whitespace-nowrap">Account Role</th>
                    <th className="p-6 whitespace-nowrap text-center">Access Status</th>
                    <th className="p-6 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-16 text-center text-slate-400 font-semibold">
                        No users found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(userItem => {
                      const avatar = userItem.profile_pic 
                        ? userItem.profile_pic 
                        : null;

                      const isMutating = updateUserMutation.isPending && 
                        updateUserMutation.variables?.id === userItem.id;

                      return (
                        <tr key={userItem.id} className="hover:bg-slate-50/30 transition-colors group">
                          {/* User Info */}
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-100 shrink-0 flex items-center justify-center relative">
                                {avatar ? (
                                  <img src={avatar} alt={userItem.email} className="w-full h-full object-cover" />
                                ) : (
                                  <User size={16} className="text-slate-400" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 line-clamp-1">{userItem.email}</h3>
                              </div>
                            </div>
                          </td>

                          {/* ID */}
                          <td className="p-6">
                            <span className="font-mono text-slate-500 text-xs font-bold">#{userItem.id}</span>
                          </td>

                          {/* Role */}
                          <td className="p-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold ${
                              userItem.is_owner 
                                ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                : 'bg-sky-50 text-sky-600 border border-sky-100'
                            }`}>
                              {userItem.is_owner ? 'Owner / Landlord' : 'Renter / Customer'}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="p-6 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              userItem.is_active 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-rose-50 text-rose-600'
                            }`}>
                              {userItem.is_active ? 'Active' : 'Suspended'}
                            </span>
                          </td>

                          {/* Block/Unblock Button */}
                          <td className="p-6 text-right">
                            {userItem.is_active ? (
                              <button
                                onClick={() => handleToggleActive(userItem.id, userItem.is_active)}
                                disabled={isMutating}
                                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all inline-flex items-center gap-1.5"
                              >
                                {isMutating ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                                Suspend Account
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleActive(userItem.id, userItem.is_active)}
                                disabled={isMutating}
                                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all inline-flex items-center gap-1.5"
                              >
                                {isMutating ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                Activate Account
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
