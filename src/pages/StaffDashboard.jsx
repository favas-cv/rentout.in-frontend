import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminKYCDocuments, updateAdminKYCStatus } from '../services/kycService';
import { Shield, CheckCircle, XCircle, Clock, Eye, X, Loader2, Filter, ZoomIn } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';


const StaffDashboard = () => {
  const queryClient = useQueryClient();
  const currentUser = useSelector(selectCurrentUser);
  const [filter, setFilter] = useState('ALL');
  const [selectedKyc, setSelectedKyc] = useState(null);



  const { data: kycData, isLoading } = useQuery({
    queryKey: ['admin-kyc-list'],
    queryFn: fetchAdminKYCDocuments,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ pk, status }) => updateAdminKYCStatus(pk, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-kyc-list']);
      toast.success('KYC status updated successfully');
      setSelectedKyc(null); // Close modal on success
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to update KYC status');
    }
  });

  const handleApprove = (pk) => {
    updateStatusMutation.mutate({ pk, status: 'VERIFIED' });
  };

  const handleReject = (pk) => {
    updateStatusMutation.mutate({ pk, status: 'REJECTED' });
  };

  const kycList = kycData?.results || [];

  const filteredList = kycList.filter(item => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const metrics = {
    total: kycList.length,
    pending: kycList.filter(i => i.status === 'PENDING').length,
    verified: kycList.filter(i => i.status === 'VERIFIED').length,
    rejected: kycList.filter(i => i.status === 'REJECTED').length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-2">
            <Shield className="text-[#635465]" size={36} />
            Staff Control Center
          </h1>
          <p className="text-slate-500 font-medium">Manage user identity verifications and platform security.</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Requests</div>
            <div className="text-4xl font-black text-slate-800">{metrics.total}</div>
          </div>
          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 shadow-sm flex flex-col justify-between">
            <div className="text-amber-600 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
               <Clock size={16} /> Pending
            </div>
            <div className="text-4xl font-black text-amber-700">{metrics.pending}</div>
          </div>
          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col justify-between">
            <div className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <CheckCircle size={16} /> Verified
            </div>
            <div className="text-4xl font-black text-emerald-700">{metrics.verified}</div>
          </div>
          <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100 shadow-sm flex flex-col justify-between">
            <div className="text-rose-600 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <XCircle size={16} /> Rejected
            </div>
            <div className="text-4xl font-black text-rose-700">{metrics.rejected}</div>
          </div>
        </div>

        {/* Filters & List */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center gap-4">
            <Filter size={20} className="text-slate-400" />
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    filter === f 
                      ? 'bg-[#635465] text-white shadow-md' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="animate-spin text-slate-300" size={40} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-6 whitespace-nowrap">Request ID</th>
                    <th className="p-6 whitespace-nowrap">User</th>
                    <th className="p-6 whitespace-nowrap">Submitted On</th>
                    <th className="p-6 whitespace-nowrap">Status</th>
                    <th className="p-6 whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-slate-400 font-medium">
                        No KYC requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6 font-bold text-slate-700">#{item.id}</td>
                        <td className="p-6">
                          <div className="font-bold text-[#635465]">{item.username}</div>
                          <div className="text-xs text-slate-400">{item.email}</div>
                        </td>
                        <td className="p-6 text-sm text-slate-500 font-medium">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            item.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' :
                            item.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                            'bg-rose-50 text-rose-600'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <button
                            onClick={() => setSelectedKyc(item)}
                            className="p-2 bg-slate-100 text-slate-500 hover:bg-[#635465] hover:text-white rounded-lg transition-all"
                            title="Review Documents"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedKyc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedKyc(null)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800">Review KYC Request #{selectedKyc.id}</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">User: {selectedKyc.username} ({selectedKyc.email}) • Submitted: {new Date(selectedKyc.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    selectedKyc.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' :
                    selectedKyc.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {selectedKyc.status}
                </span>
                <button onClick={() => setSelectedKyc(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body - Document Viewer */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Aadhaar */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700 text-sm">Aadhaar Card</h3>
                    <a href={selectedKyc.document1} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#635465]">
                      <ZoomIn size={16} />
                    </a>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden relative group min-h-[200px]">
                    {selectedKyc.document1 ? (
                      <img src={selectedKyc.document1} alt="Aadhaar" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                       <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-bold">No Image</div>
                    )}
                  </div>
                </div>

                {/* PAN */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700 text-sm">PAN Card</h3>
                    <a href={selectedKyc.document2} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#635465]">
                      <ZoomIn size={16} />
                    </a>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden relative group min-h-[200px]">
                    {selectedKyc.document2 ? (
                      <img src={selectedKyc.document2} alt="PAN" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                       <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-bold">No Image</div>
                    )}
                  </div>
                </div>

                {/* Selfie */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700 text-sm">Selfie</h3>
                    <a href={selectedKyc.selfie} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#635465]">
                      <ZoomIn size={16} />
                    </a>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden relative group min-h-[200px]">
                     {selectedKyc.selfie ? (
                      <img src={selectedKyc.selfie} alt="Selfie" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                       <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-bold">No Image</div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer - Actions */}
            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4">
              <button
                onClick={() => handleReject(selectedKyc.id)}
                disabled={updateStatusMutation.isPending || selectedKyc.status === 'REJECTED'}
                className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-rose-600 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Reject Documents
              </button>
              <button
                onClick={() => handleApprove(selectedKyc.id)}
                disabled={updateStatusMutation.isPending || selectedKyc.status === 'VERIFIED'}
                className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center gap-2"
              >
                {updateStatusMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Approve & Verify
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
