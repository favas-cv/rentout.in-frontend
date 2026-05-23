import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Store & Services
import { selectCurrentUser, logout, updateUser } from '../store/authSlice';
import { clearCartItems } from '../store/cartSlice';
import { logoutUser, fetchCurrentUser, updateProfile } from '../services/authService';
import { fetchBookings, cancelBooking } from '../services/bookingService';
import { fetchOwnerProducts, fetchOwnerOrders, createProduct, updateOrderStatus } from '../services/ownerService';
import { fetchwishlist } from '../services/cartService';
import { fetchCategories } from '../services/productService';
import { fetchKYCDocuments, addKYCDocuments } from '../services/kycService';
import { toast } from 'react-hot-toast';

// Modular Components
import ProfileHeader from '../components/profile/ProfileHeader';
import DashboardGrid from '../components/profile/DashboardGrid';
import EditProfileModal from '../components/profile/EditProfileModal';
import OrderDetailsModal from '../components/profile/OrderDetailsModal';
import ProductListingModal from '../components/profile/ProductListingModal';
import { RentalsView, WishlistView, ListingsView, PaymentsView, NotificationsView, KYCView } from '../components/profile/Sections';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reduxUser = useSelector(selectCurrentUser);
  const { updateUser: contextUpdateUser } = useAuth();
  
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  
  // Product Listing Form State
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Queries
  const { data: userData, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchCurrentUser,
    enabled: !!reduxUser,
  });

  const { data: activeBookings } = useQuery({
    queryKey: ['active-bookings'],
    queryFn: fetchBookings,
    enabled: !!reduxUser && (activeSection === 'dashboard' || activeSection === 'orders'),
  });

  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchwishlist,
    enabled: !!reduxUser && reduxUser?.is_live !== false && activeSection === 'wishlist',
  });

  const { data: myProducts } = useQuery({
    queryKey: ['owner-products'],
    queryFn: fetchOwnerProducts,
    enabled: !!reduxUser && reduxUser?.is_live !== false && activeSection === 'listings',
  });

  const { data: ownerOrders } = useQuery({
    queryKey: ['owner-orders'],
    queryFn: fetchOwnerOrders,
    enabled: !!reduxUser && activeSection === 'payments',
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: isListingModalOpen
  });

  const { data: kycData, isLoading: kycLoading } = useQuery({
    queryKey: ['kyc-status'],
    queryFn: fetchKYCDocuments,
    enabled: !!reduxUser,
  });

  useEffect(() => {
    if (userData) {
      dispatch(updateUser(userData));
      contextUpdateUser(userData);
    }
  }, [userData, dispatch]);

  const user = userData || reduxUser;
  const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';
  const displayName = fullName || user?.username || user?.email?.split('@')[0] || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  // Mutations
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      dispatch(logout());
      dispatch(clearCartItems());
      queryClient.clear();
      toast.success('Signed out successfully', { position: 'top-center' });
      // Full refresh to clear all application state and go to home page on success
      window.location.href = '/';
    },
    onError: (err) => {
      console.error("Logout API failed inside profile page mutation:", err);
      toast.error(err.response?.data?.error || "Logout API call failed! Staying on page to debug.", { position: 'top-center' });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['user-profile']);
      dispatch(updateUser(data));
      setIsEditModalOpen(false);
      toast.success('Profile updated successfully!', { position: 'top-center' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to update profile', { position: 'top-center' });
    }
  });

  const addKYCMutation = useMutation({
    mutationFn: addKYCDocuments,
    onSuccess: () => {
      queryClient.invalidateQueries(['kyc-status']);
      toast.success("KYC documents uploaded successfully! Verification is pending.", { position: 'top-center' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to upload KYC documents. Please try again.", { position: 'top-center' });
    }
  });

  const createListingMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-products']);
      setIsListingModalOpen(false);
      setPreviews([]);
      setSelectedImages([]);
      toast.success("Product listed successfully!", { position: 'top-center' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to list product", { position: 'top-center' });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, statusData }) => updateOrderStatus(orderId, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-orders']);
      toast.success("Order updated!", { position: 'top-center' });
      setSelectedOrder(null);
    },
    onError: (err) => {
      const errorData = err.response?.data;
      const msg = errorData?.detail || (errorData && typeof errorData === 'object' ? Object.values(errorData)[0] : "Update failed");
      toast.error(Array.isArray(msg) ? msg[0] : msg, { position: 'top-center' });
    }
  });

  const cancelBookingMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error, { position: 'top-center' });
        return;
      }
      queryClient.invalidateQueries(['active-bookings']);
      toast.success(data?.msg || "Booking cancelled successfully", { position: 'top-center' });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        "Something went wrong",
        { position: 'top-center' }
      );
    }
  });

  // Handlers
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData();
    formData.append('first_name', form.first_name.value);
    formData.append('last_name', form.last_name.value);
    
    const picFile = form.profile_pic.files[0];
    if (picFile) {
      formData.append('profile_pic', picFile);
    }
    
    updateProfileMutation.mutate(formData);
  };

  const handleListingSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    selectedImages.forEach(file => formData.append('product_image', file));
    createListingMutation.mutate(formData);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  if (!reduxUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-slate-500 font-medium text-lg">You are not logged in.</p>
        <a href="/auth" className="text-[#635465] font-bold hover:underline">Go to Login →</a>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-[#635465]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      <ProfileHeader 
        user={user} 
        initials={initials} 
        displayName={displayName} 
        onEditClick={() => setIsEditModalOpen(true)} 
        onSetupOwnerClick={() => setActiveSection('kyc')}
      />

      <div className="max-w-7xl mx-auto px-6 pb-20">
        
        {activeSection === 'dashboard' ? (
          <>
            <DashboardGrid 
              user={user} 
              onSectionChange={setActiveSection} 
              onLogout={() => logoutMutation.mutate()} 
            />

            {/* Promo Banner */}
            <div className="bg-gradient-to-r from-[#635465] to-[#403542] rounded-[3rem] p-12 md:p-16 relative overflow-hidden shadow-2xl shadow-[#635465]/30">
              <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-xl text-center md:text-left">
                  <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Elevate Your Living Experience</h2>
                  <p className="text-white/70 font-medium mb-8">Unlock exclusive furniture collections, priority delivery, and a personal interior consultant with our Premier Concierge Membership.</p>
                  <button className="px-10 py-4 bg-white text-[#635465] rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
                    Explore Membership
                  </button>
                </div>
                <div className="w-64 h-64 bg-white/10 rounded-[2.5rem] border border-white/20 flex items-center justify-center backdrop-blur-md">
                  <div className="text-center">
                    <div className="text-6xl font-black text-white mb-2">Srue</div>
                    <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.5em]">Male Rework</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            <button 
              onClick={() => setActiveSection('dashboard')}
              className="flex items-center gap-2 text-slate-400 hover:text-[#635465] font-black uppercase text-[10px] tracking-widest mb-10 transition-colors"
            >
              <X size={16} /> Back to Dashboard
            </button>

            {activeSection === 'orders' && (
              <RentalsView 
                bookings={activeBookings} 
                onCancelBooking={cancelBookingMutation.mutate}
                isCancelling={cancelBookingMutation.isPending}
              />
            )}
            {activeSection === 'wishlist' && <WishlistView wishlist={wishlistData} />}
            {activeSection === 'listings' && <ListingsView user={user} products={myProducts} onAddClick={() => setIsListingModalOpen(true)} onSectionChange={setActiveSection} />}
            {activeSection === 'payments' && (
              <PaymentsView 
                user={user} 
                orders={ownerOrders} 
                onOrderClick={setSelectedOrder} 
                kycData={kycData}
                kycLoading={kycLoading}
                onSectionChange={setActiveSection}
              />
            )}
            {activeSection === 'kyc' && (
              <KYCView 
                kycData={kycData} 
                isLoading={kycLoading} 
                onSubmit={addKYCMutation.mutate} 
                isPending={addKYCMutation.isPending} 
              />
            )}
            {activeSection === 'notifications' && <NotificationsView />}
          </div>
        )}
      </div>

      <EditProfileModal 
        user={user} 
        preview={profilePreview} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSubmit={handleEditSubmit} 
        onImageChange={handleProfilePicChange} 
        isPending={updateProfileMutation.isPending} 
      />

      <ProductListingModal 
        isOpen={isListingModalOpen} 
        onClose={() => setIsListingModalOpen(false)} 
        onSubmit={handleListingSubmit} 
        categories={categories} 
        previews={previews} 
        onImageChange={handleImageChange} 
        isPending={createListingMutation.isPending} 
      />

      <OrderDetailsModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        onUpdateStatus={updateStatusMutation.mutate} 
        isUpdating={updateStatusMutation.isPending} 
      />

    </div>
  );
};

export default ProfilePage;
