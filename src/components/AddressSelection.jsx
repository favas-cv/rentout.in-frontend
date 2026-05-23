import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MapPin, Plus, CheckCircle2 } from 'lucide-react';
import { fetchAddresses, createAddress } from '../services/addressService';
import { toast } from 'react-toastify';

const AddressSelection = ({ selectedAddressId, setSelectedAddressId, allAvailable }) => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    house_name: '', street: '', landmark: '', city: '', district: '', state: '', country: '', zipcode: '', phone: '', is_default: false
  });

  const { data: addressesData, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
    enabled: allAvailable, // only fetch if all items are available to save requests
  });

  // Handle potential paginated response
  const addresses = Array.isArray(addressesData) ? addressesData : addressesData?.results || [];

  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: (data) => {
      toast.success('Address added successfully!');
      setShowAddressForm(false);
      setAddressForm({ house_name: '', street: '', landmark: '', city: '', district: '', state: '', country: '', zipcode: '', phone: '', is_default: false });
      refetchAddresses();
      setSelectedAddressId(data.id);
    },
    onError: () => {
      toast.error('Failed to add address');
    }
  });

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    createAddressMutation.mutate(addressForm);
  };

  if (!allAvailable) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="text-[#635465]" /> Select Delivery Address
        </h3>
        <button 
          onClick={() => setShowAddressForm(!showAddressForm)}
          className="text-sm font-bold text-[#635465] bg-[#635465]/10 px-4 py-2 rounded-lg hover:bg-[#635465]/20 flex items-center gap-1 transition-colors"
        >
          <Plus size={16} /> {showAddressForm ? 'Cancel' : 'Add New'}
        </button>
      </div>

      {!showAddressForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div 
              key={addr.id} 
              onClick={() => setSelectedAddressId(addr.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-[#635465] bg-[#635465]/5' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-800">{addr.house_name || 'Home'}</span>
                {selectedAddressId === addr.id && <CheckCircle2 size={18} className="text-[#635465]" />}
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">
                {addr.street}, {addr.landmark && `${addr.landmark}, `}{addr.city}, {addr.district}, {addr.state}, {addr.country} - {addr.zipcode}
              </p>
              {addr.phone && <p className="text-sm text-slate-500 mt-1 font-medium">{addr.phone}</p>}
            </div>
          ))}
          {addresses.length === 0 && (
            <div className="col-span-full text-center py-6 text-slate-400">
              No saved addresses found. Please add a new one.
            </div>
          )}
        </div>
      )}

      {showAddressForm && (
        <form onSubmit={handleAddressSubmit} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">House Name</label>
              <input name="house_name" value={addressForm.house_name} onChange={handleAddressInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#635465]/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Street</label>
              <input name="street" value={addressForm.street} onChange={handleAddressInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#635465]/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">City *</label>
              <input name="city" required value={addressForm.city} onChange={handleAddressInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#635465]/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">District *</label>
              <input name="district" required value={addressForm.district} onChange={handleAddressInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#635465]/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">State</label>
              <input name="state" value={addressForm.state} onChange={handleAddressInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#635465]/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Country *</label>
              <input name="country" required value={addressForm.country} onChange={handleAddressInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#635465]/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Zipcode</label>
              <input name="zipcode" value={addressForm.zipcode} onChange={handleAddressInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#635465]/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Phone</label>
              <input name="phone" value={addressForm.phone} onChange={handleAddressInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#635465]/20" />
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={createAddressMutation.isPending}
              className="bg-[#635465] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#635465]/90 transition-colors flex items-center gap-2"
            >
              {createAddressMutation.isPending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Save Address
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddressSelection;
