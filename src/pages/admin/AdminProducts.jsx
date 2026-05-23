import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminProducts, updateAdminProduct } from '../../services/kycService';
import { 
  Package, 
  Star, 
  Eye, 
  Sparkles, 
  Ban, 
  CheckCircle, 
  Search, 
  Filter, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, ACTIVE, BLOCKED, FEATURED, TRENDING, SEASONAL

  // Fetch all products using react-query
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['admin-products-list'],
    queryFn: fetchAdminProducts,
  });

  // Extract products array safely (handles both paginated structure and raw array)
  const productsList = productsData?.results || (Array.isArray(productsData) ? productsData : []);

  // Mutation to update product status
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminProduct(id, data),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries(['admin-products-list']);
      toast.success(`Product "${updatedProduct.title}" updated successfully`);
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to update product status';
      toast.error(errorMsg);
    }
  });

  const handleToggleStatus = (id, fieldName, currentValue) => {
    updateProductMutation.mutate({
      id,
      data: { [fieldName]: !currentValue }
    });
  };

  // Filter products based on search term and active tab
  const filteredProducts = productsList.filter(product => {
    // 1. Search term match
    const titleMatch = product.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const brandMatch = product.brand_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const ownerMatch = product.owner_details?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSearch = titleMatch || brandMatch || ownerMatch;
    if (!matchesSearch) return false;

    // 2. Tab filter match
    switch (activeTab) {
      case 'ACTIVE':
        return product.is_active === true;
      case 'BLOCKED':
        return product.is_active === false;
      case 'FEATURED':
        return product.is_featured === true;
      case 'TRENDING':
        return product.is_trending === true;
      case 'SEASONAL':
        return product.is_seasonal === true;
      case 'ALL':
      default:
        return true;
    }
  });

  // Metrics calculations
  const metrics = {
    total: productsList.length,
    active: productsList.filter(p => p.is_active === true).length,
    blocked: productsList.filter(p => p.is_active === false).length,
    featured: productsList.filter(p => p.is_featured === true).length,
    trending: productsList.filter(p => p.is_trending === true).length,
    seasonal: productsList.filter(p => p.is_seasonal === true).length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-2">
              <Package className="text-[#635465]" size={36} />
              Platform Inventory
            </h1>
            <p className="text-slate-500 font-medium">Manage product listings, toggle visibility, and promote items to featured, trending, or seasonal sections.</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Items</div>
            <div className="text-3xl font-black text-slate-800">{metrics.total}</div>
          </div>
          <div className="bg-emerald-50/50 rounded-3xl p-5 border border-emerald-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2">Active</div>
            <div className="text-3xl font-black text-emerald-700">{metrics.active}</div>
          </div>
          <div className="bg-rose-50/50 rounded-3xl p-5 border border-rose-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="text-rose-600 text-xs font-bold uppercase tracking-wider mb-2">Blocked</div>
            <div className="text-3xl font-black text-rose-700">{metrics.blocked}</div>
          </div>
          <div className="bg-amber-50/50 rounded-3xl p-5 border border-amber-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-500" /> Featured
            </div>
            <div className="text-3xl font-black text-amber-700">{metrics.featured}</div>
          </div>
          <div className="bg-blue-50/50 rounded-3xl p-5 border border-blue-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Eye size={12} className="text-blue-500" /> Trending
            </div>
            <div className="text-3xl font-black text-blue-700">{metrics.trending}</div>
          </div>
          <div className="bg-purple-50/50 rounded-3xl p-5 border border-purple-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="text-purple-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles size={12} className="text-purple-500" /> Seasonal
            </div>
            <div className="text-3xl font-black text-purple-700">{metrics.seasonal}</div>
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
                placeholder="Search products by title, brand, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-[#635465]/20 focus:bg-white text-sm font-medium transition-all outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {['ALL', 'ACTIVE', 'BLOCKED', 'FEATURED', 'TRENDING', 'SEASONAL'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === tab 
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
              <span className="text-sm font-semibold text-slate-400">Loading products...</span>
            </div>
          ) : error ? (
            <div className="p-20 text-center">
              <AlertTriangle className="mx-auto text-rose-500 mb-4" size={40} />
              <h3 className="text-lg font-bold text-slate-800 mb-1">Failed to load products</h3>
              <p className="text-slate-400 text-sm">{error.message || 'Please check your connection and try again.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="p-6 whitespace-nowrap">Product</th>
                    <th className="p-6 whitespace-nowrap">Owner</th>
                    <th className="p-6 whitespace-nowrap">Pricing</th>
                    <th className="p-6 whitespace-nowrap text-center">Promotions</th>
                    <th className="p-6 whitespace-nowrap text-center">Status</th>
                    <th className="p-6 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-16 text-center text-slate-400 font-semibold">
                        No products found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => {
                      const image = product.product_image && product.product_image.length > 0 
                        ? product.product_image[0].image_url 
                        : 'https://via.placeholder.com/150?text=No+Image';

                      const isMutating = updateProductMutation.isPending && 
                        updateProductMutation.variables?.id === product.id;

                      return (
                        <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                          {/* Product Info */}
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0 relative">
                                <img src={image} alt={product.title} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 line-clamp-1 capitalize">{product.title}</h3>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-400 font-medium">
                                  <span>{product.brand_name || 'Generic'}</span>
                                  <span>•</span>
                                  <span>{product.locality || 'Locality'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Owner details */}
                          <td className="p-6">
                            <div className="font-bold text-[#635465]">
                              {product.owner_details?.username || 'Owner'}
                            </div>
                            <div className="text-xs text-slate-400">
                              {product.owner_details?.email || 'No email'}
                            </div>
                          </td>

                          {/* Pricing */}
                          <td className="p-6">
                            <div className="font-extrabold text-slate-800">
                              ₹{product.price_per_day}
                            </div>
                            <div className="text-xs text-slate-400 font-medium">
                              per day (Min {product.min_rental_days || 1} d)
                            </div>
                          </td>

                          {/* Promotions toggles */}
                          <td className="p-6">
                            <div className="flex items-center justify-center gap-3">
                              {/* Featured Toggle (Star) */}
                              <button
                                onClick={() => handleToggleStatus(product.id, 'is_featured', product.is_featured)}
                                disabled={isMutating}
                                title={product.is_featured ? "Remove from Featured" : "Mark as Featured"}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  product.is_featured 
                                    ? 'bg-amber-50 border-amber-200 text-amber-500 shadow-sm' 
                                    : 'border-slate-100 hover:bg-slate-50 text-slate-300 hover:text-slate-500'
                                }`}
                              >
                                <Star size={16} fill={product.is_featured ? "currentColor" : "none"} />
                              </button>

                              {/* Trending Toggle (Eye as requested) */}
                              <button
                                onClick={() => handleToggleStatus(product.id, 'is_trending', product.is_trending)}
                                disabled={isMutating}
                                title={product.is_trending ? "Remove from Trending" : "Mark as Trending"}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  product.is_trending 
                                    ? 'bg-blue-50 border-blue-200 text-blue-500 shadow-sm' 
                                    : 'border-slate-100 hover:bg-slate-50 text-slate-300 hover:text-slate-500'
                                }`}
                              >
                                <Eye size={16} />
                              </button>

                              {/* Seasonal Toggle (Sparkles) */}
                              <button
                                onClick={() => handleToggleStatus(product.id, 'is_seasonal', product.is_seasonal)}
                                disabled={isMutating}
                                title={product.is_seasonal ? "Remove from Seasonal" : "Mark as Seasonal"}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  product.is_seasonal 
                                    ? 'bg-purple-50 border-purple-200 text-purple-500 shadow-sm' 
                                    : 'border-slate-100 hover:bg-slate-50 text-slate-300 hover:text-slate-500'
                                }`}
                              >
                                <Sparkles size={16} />
                              </button>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="p-6 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              product.is_active 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-rose-50 text-rose-600'
                            }`}>
                              {product.is_active ? 'Active' : 'Blocked'}
                            </span>
                          </td>

                          {/* Block/Unblock Button */}
                          <td className="p-6 text-right">
                            {product.is_active ? (
                              <button
                                onClick={() => handleToggleStatus(product.id, 'is_active', product.is_active)}
                                disabled={isMutating}
                                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all inline-flex items-center gap-1.5"
                              >
                                {isMutating ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                                Block Product
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(product.id, 'is_active', product.is_active)}
                                disabled={isMutating}
                                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all inline-flex items-center gap-1.5"
                              >
                                {isMutating ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                Unblock Product
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

export default AdminProducts;
