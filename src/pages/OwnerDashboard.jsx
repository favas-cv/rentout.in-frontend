import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, ShoppingBag, Package, Loader2, X } from 'lucide-react';
import { 
  fetchOwnerProducts, 
  createProduct, 
  deleteProduct, 
  updateProduct,
  fetchOwnerDashboard, 
  fetchOwnerOrders,
  updateOrderStatus
} from '../services/ownerService';
import { fetchCategories } from '../services/productService';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectDisplayName } from '../store/authSlice';

// Sub-components
import StatsGrid from '../components/owner/DashboardStats';
import OwnerProducts from '../components/owner/OwnerProducts';
import OwnerOrders from '../components/owner/OwnerOrders';
import OrderDetailModal from '../components/owner/OrderDetailModal';
import AddProductModal from '../components/owner/AddProductModal';

const OwnerDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const user = useSelector(selectCurrentUser);
  const displayName = useSelector(selectDisplayName);

  // Fetch Data
  const { 
    data: stats, 
    isLoading: statsLoading, 
    isError: statsError, 
    error: statsErr 
  } = useQuery({
    queryKey: ['owner-stats'],
    queryFn: fetchOwnerDashboard
  });

  const { 
    data: products, 
    isLoading: productsLoading, 
    isError: productsError, 
    error: productsErr 
  } = useQuery({
    queryKey: ['owner-products'],
    queryFn: fetchOwnerProducts
  });

  const { 
    data: ordersData, 
    isLoading: ordersLoading, 
    isError: ordersError, 
    error: ordersErr 
  } = useQuery({
    queryKey: ['owner-orders'],
    queryFn: fetchOwnerOrders
  });

  const { 
    data: categoriesData, 
    isLoading: categoriesLoading, 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const categories = categoriesData || [];
  const orders = ordersData?.results || (Array.isArray(ordersData) ? ordersData : []);
  const productsList = products?.results || (Array.isArray(products) ? products : []);

  // Sync selectedOrder when ordersData updates (keeps modal fresh after status change)
  useEffect(() => {
    if (selectedOrder && orders.length > 0) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    }
  }, [orders, selectedOrder?.id]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-products']);
      queryClient.invalidateQueries(['owner-stats']);
      handleCloseModal();
      toast.success("Product listed successfully!");
    },
    onError: (err) => {
      const errorData = err.response?.data;
      const firstError = errorData ? Object.values(errorData)[0] : "Upload failed";
      toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-products']);
      handleCloseModal();
      toast.success("Product updated successfully!");
    },
    onError: (err) => {
      const errorData = err.response?.data;
      const firstError = errorData ? Object.values(errorData)[0] : "Update failed";
      toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-products']);
      queryClient.invalidateQueries(['owner-stats']);
      toast.info("Product removed from inventory");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, statusData }) => updateOrderStatus(orderId, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-orders']);
      toast.success("Order status updated!");
    },
    onError: (err) => {
      const errorData = err.response?.data;
      const msg = errorData?.detail || (errorData && typeof errorData === 'object' ? Object.values(errorData)[0] : "Update failed");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  });

  const allowedTransitions = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['SHIPPED', 'CANCELLED'],
    'SHIPPED': ['DELIVERED', 'CANCELLED'],
    'DELIVERED': ['RETURNED'],
    'RETURNED': [],
    'CANCELLED': []
  };

  const depositTransitions = {
    'PENDING': ['HOLD'],
    'HOLD': ['REFUND_INITIATED'],
    'REFUND_INITIATED': ['REFUNDED'],
    'REFUNDED': []
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePreview = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setSelectedImages([]);
    setPreviews([]);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setPreviews(product.product_image?.map(img => img.image_url) || []);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (!editingProduct && selectedImages.length === 0) {
      toast.warning("Please upload at least one image");
      return;
    }

    selectedImages.forEach(file => formData.append('images', file));

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (statsLoading || productsLoading || ordersLoading || categoriesLoading) return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <Loader2 className="animate-spin text-[#635465]" size={40} />
      <p className="text-slate-400 font-medium">Loading your dashboard...</p>
    </div>
  );

  if (statsError || productsError || ordersError) return (
    <div className="flex flex-col justify-center items-center h-screen gap-4 sm:gap-6 p-4 sm:p-6 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500">
        <X size={32} />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800">Something went wrong</h2>
        <p className="text-slate-500 max-w-md text-sm">
          {statsErr?.message || productsErr?.message || ordersErr?.message || "Failed to connect to the server. Please check your connection."}
        </p>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="bg-[#635465] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-bold shadow-lg shadow-[#635465]/20 hover:scale-105 transition-all text-sm"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="bg-white border-b border-slate-100 pt-6 sm:pt-8 md:pt-10 pb-4 sm:pb-6 px-4 sm:px-6 mb-6 sm:mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                  Welcome back, {displayName}
                </span>
                {user?.email && (
                  <span className="text-[10px] text-slate-300 font-medium hidden sm:inline">{user.email}</span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 sm:gap-3">
                <LayoutDashboard className="text-[#635465]" size={24} />
                Owner Dashboard
              </h1>
            </div>

            {/* Tab bar — scrollable on mobile */}
            <div className="flex bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl w-full overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex-1 min-w-[100px] px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutDashboard size={14} />
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('products')}
                className={`flex-1 min-w-[100px] px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Package size={14} />
                Inventory
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex-1 min-w-[100px] px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ShoppingBag size={14} />
                Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StatsGrid stats={stats} products={productsList} ordersData={ordersData} orders={orders} />
            <div className="grid grid-cols-1 gap-6 sm:gap-8 mt-6 sm:mt-8">
              <OwnerOrders orders={orders.slice(0, 5)} onSelectOrder={setSelectedOrder} />
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <OwnerProducts 
              products={productsList} 
              onDelete={(id) => deleteMutation.mutate(id)} 
              onEdit={handleEditClick}
              onAddClick={() => setIsModalOpen(true)} 
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <OwnerOrders orders={orders} onSelectOrder={setSelectedOrder} />
          </div>
        )}
      </div>

      <OrderDetailModal 
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        updateStatusMutation={updateStatusMutation}
        allowedTransitions={allowedTransitions}
        depositTransitions={depositTransitions}
      />

      <AddProductModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        product={editingProduct}
        categories={categories}
        previews={previews}
        handleImageChange={handleImageChange}
        removePreview={removePreview}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default OwnerDashboard;
