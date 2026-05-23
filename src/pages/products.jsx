import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts } from '../services/productService';
import { setActiveCategory, selectActiveCategory, selectSearchQuery, setSearchQuery } from '../store/uiSlice';
import ProductCard from './productcard';

// ─── Category config — name matches what the backend expects ──────────────────
const CATEGORIES = [
  { name: 'ALL', icon: '🏠' },
  { name: 'Sofa', icon: '🛋️' },
  { name: 'Table', icon: '🧱' },
  { name: 'Cupboard', icon: '🚪' },
  { name: 'Chair', icon: '🪑' },
  { name: 'Bed', icon: '🛏️' },
  { name: 'Kitchen Appliances', icon: '🍳' },
  { name: 'Art', icon: '🎨' },
  { name: 'Electronics', icon: '💻' },
  { name: 'TV Unit', icon: '📺' },
  { name: 'Outdoor Furniture', icon: '🌳' },
  { name: 'Tents', icon: '⛺' },
  { name: 'Lighting', icon: '💡' },
  { name: 'Bean Bags', icon: '🔴' },
  { name: 'Bags', icon: '🎒' },
  { name: 'Shelf', icon: '📚' },
  { name: 'Coffee Table', icon: '☕' },
  { name: 'Gaming Chair', icon: '🎮' },
  { name: 'Mattress', icon: '🛌' },
  { name: 'Home Decor', icon: '🏺' },
  { name: 'Carpets', icon: '🧶' },
];

const COLORS = ['Red', 'Blue', 'Green', 'Black', 'White', 'Brown', 'Grey', 'Yellow', 'Orange'];

const SORT_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Price: Low → High', value: 'price_per_day' },
  { label: 'Price: High → Low', value: '-price_per_day' },
  { label: 'Title A → Z', value: 'title' },
  { label: 'Title Z → A', value: '-title' },
];

// Debounce hook removed as filters now apply on Enter

// ─── Component ─────────────────────────────────────────────────────────────────
const ProductListing = () => {
  const dispatch = useDispatch();
  // activeCategory stores the category NAME (e.g. "CHAIR") or null
  const activeCategory = useSelector(selectActiveCategory);
  // searchQuery comes from navbar search → Redux
  const globalSearch = useSelector(selectSearchQuery);

  const [searchParams, setSearchParams] = useSearchParams();

  // Read applied filters from URL
  const appliedSearch = searchParams.get('search') || '';
  const appliedBrand = searchParams.get('brand') || '';
  const appliedLocality = searchParams.get('locality') || '';
  const colorFilter = searchParams.get('color') || '';
  const ordering = searchParams.get('ordering') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Local filter state for typing
  const [searchInput, setSearchInput] = useState(appliedSearch);
  const [brandInput, setBrandInput] = useState(appliedBrand);
  const [localityInput, setLocalityInput] = useState(appliedLocality);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const updateURLParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      // Reset page to 1 whenever any filter changes
      if (key !== 'page') {
        newParams.delete('page');
      }
      return newParams;
    });
  }, [setSearchParams]);

  // Sync navbar search into URL when it changes
  useEffect(() => {
    if (globalSearch) {
      setSearchInput(globalSearch);
      updateURLParam('search', globalSearch);
      // Clear the global so it doesn't keep overriding user typing
      dispatch(setSearchQuery(''));
    }
  }, [globalSearch, dispatch, updateURLParam]);

  // Build filter object — service strips empty values automatically
  // Category filter: send category_name to the API
  const filters = {
    category: activeCategory && activeCategory !== 'ALL' ? activeCategory : undefined,
    search: appliedSearch.length >= 2 ? appliedSearch : undefined,
    brand_name: appliedBrand || undefined,
    color: colorFilter || undefined,
    locality: appliedLocality || undefined,
    ordering: ordering || undefined,
    page: page > 1 ? page : undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    keepPreviousData: true,
  });

  const products = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;

  const handlePageChange = (newPage) => {
    updateURLParam('page', newPage > 1 ? newPage.toString() : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = useCallback(() => {
    dispatch(setActiveCategory(null));
    setSearchInput('');
    setBrandInput('');
    setLocalityInput('');
    setSearchParams(new URLSearchParams());
  }, [dispatch, setSearchParams]);

  const hasActiveFilters =
    (activeCategory && activeCategory !== 'ALL') ||
    appliedSearch || appliedBrand || colorFilter || appliedLocality || ordering;

  // ── Category bar ──────────────────────────────────────────────────────────────
  const categoryBarContent = (
    <div className="flex gap-6 md:gap-10 mb-10 border-b border-slate-100 pb-4 overflow-x-auto scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const isActive =
          cat.name === 'ALL'
            ? !activeCategory || activeCategory === 'ALL'
            : activeCategory === cat.name;
        return (
          <button
            key={cat.name}
            onClick={() =>
              dispatch(setActiveCategory(cat.name === 'ALL' ? null : cat.name))
            }
            className="flex flex-col items-center gap-1.5 group min-w-fit"
          >
            <span
              className={`text-2xl p-3 rounded-xl transition-all duration-200 ${isActive
                ? 'bg-white shadow-md scale-110 ring-1 ring-[#635465]/20'
                : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-90 group-hover:scale-105'
                }`}
            >
              {cat.icon}
            </span>
            <span
              className={`text-[10px] font-black tracking-widest ${isActive ? 'text-slate-800' : 'text-slate-400'
                }`}
            >
              {cat.name}
            </span>
            {isActive && <div className="h-0.5 w-full bg-[#635465] rounded-full" />}
          </button>
        );
      })}
    </div>
  );

  // ── Sidebar filters ───────────────────────────────────────────────────────────
  const sidebarContent = (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-8 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-800 text-sm tracking-wide">Filters</h4>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-[#635465] hover:underline font-semibold flex items-center gap-1"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* ── Title / Keyword Search ── */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          Search
        </label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateURLParam('search', searchInput);
            }}
            placeholder="Min. 2 chars… (Press Enter)"
            className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635465]/30 focus:border-[#635465] transition"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                updateURLParam('search', '');
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
        {/* hint shown when user has typed but below threshold */}
        {appliedSearch.length === 1 && (
          <p className="text-[10px] text-amber-500 mt-1">Type at least 2 characters to search</p>
        )}
      </div>

      {/* ── Brand Name ── */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          Brand
        </label>
        <input
          type="text"
          value={brandInput}
          onChange={(e) => setBrandInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateURLParam('brand', brandInput);
          }}
          placeholder="e.g. BMW, IKEA… (Press Enter)"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635465]/30 focus:border-[#635465] transition"
        />
      </div>

      {/* ── Location ── */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          Location
        </label>
        <input
          type="text"
          value={localityInput}
          onChange={(e) => setLocalityInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateURLParam('locality', localityInput);
          }}
          placeholder="e.g. Bangalore, Delhi… (Press Enter)"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635465]/30 focus:border-[#635465] transition"
        />
      </div>

      {/* ── Color chips ── */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() =>
                updateURLParam('color', colorFilter === c.toLowerCase() ? '' : c.toLowerCase())
              }
              className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${colorFilter === c.toLowerCase()
                ? 'bg-[#635465] text-white border-[#635465]'
                : 'border-slate-200 text-slate-500 hover:border-[#635465] hover:text-[#635465]'
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sort ── */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          Sort by Price
        </label>
        <div className="relative">
          <select
            value={ordering}
            onChange={(e) => updateURLParam('ordering', e.target.value)}
            className="w-full appearance-none px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635465]/30 focus:border-[#635465] transition bg-white cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 bg-[#F8FAFC] min-h-screen">
      {categoryBarContent}

      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <p className="text-sm text-slate-500">
          <span className="font-bold text-slate-800">{totalCount}</span> products
        </p>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="flex items-center gap-2 text-sm font-semibold text-[#635465] border border-[#635465]/30 px-4 py-2 rounded-xl"
        >
          <SlidersHorizontal size={15} />
          Filters{' '}
          {hasActiveFilters && (
            <span className="bg-[#635465] text-white text-[10px] px-1.5 py-0.5 rounded-full">•</span>
          )}
        </button>
      </div>

      {mobileSidebarOpen && (
        <div className="lg:hidden mb-6">
          {sidebarContent}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          {sidebarContent}
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Result header + active chips */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <h2 className="text-lg font-bold text-slate-800">
              Showing{' '}
              <span className="text-[#635465]">
                {totalCount} item{totalCount !== 1 ? 's' : ''}
              </span>
              {activeCategory && activeCategory !== 'ALL' && (
                <span className="text-sm font-normal text-slate-400 ml-2">
                  in {activeCategory}
                </span>
              )}
            </h2>

            <div className="flex flex-wrap gap-2">
              {appliedSearch.length >= 2 && (
                <Chip label={`"${appliedSearch}"`} onRemove={() => { setSearchInput(''); updateURLParam('search', ''); }} />
              )}
              {appliedBrand && (
                <Chip label={`Brand: ${appliedBrand}`} onRemove={() => { setBrandInput(''); updateURLParam('brand', ''); }} />
              )}
              {colorFilter && (
                <Chip label={`Color: ${colorFilter}`} onRemove={() => updateURLParam('color', '')} />
              )}
              {appliedLocality && (
                <Chip label={`📍 ${appliedLocality}`} onRemove={() => { setLocalityInput(''); updateURLParam('locality', ''); }} />
              )}
              {ordering && (
                <Chip
                  label={SORT_OPTIONS.find((o) => o.value === ordering)?.label}
                  onRemove={() => updateURLParam('ordering', '')}
                />
              )}
            </div>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse"
                >
                  <div className="aspect-[4/5] bg-slate-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-8 bg-slate-100 rounded w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="text-center p-10 text-red-500 font-medium">
              {error?.message || 'Failed to load products'}. Make sure your Django server is running.
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="text-center py-24 text-slate-400">
              <p className="text-6xl mb-4">📭</p>
              <p className="font-semibold text-slate-600 text-lg mb-1">No products found</p>
              <p className="text-sm">Try adjusting your filters or search term.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-6 bg-[#635465] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#524554] transition"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {!isLoading && !isError && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {(hasNext || hasPrevious) && (
                <div className="flex items-center justify-center gap-4 mt-16">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!hasPrevious}
                    className={`p-3 rounded-2xl border transition-all ${hasPrevious
                      ? 'bg-white text-slate-700 border-slate-200 hover:border-[#635465] hover:text-[#635465] shadow-sm'
                      : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      }`}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest px-4">
                      Page <span className="text-slate-900">{page}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!hasNext}
                    className={`p-3 rounded-2xl border transition-all ${hasNext
                      ? 'bg-white text-slate-700 border-slate-200 hover:border-[#635465] hover:text-[#635465] shadow-sm'
                      : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Chip badge ────────────────────────────────────────────────────────────────
const Chip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 bg-[#635465]/10 text-[#635465] text-xs font-semibold px-3 py-1 rounded-full">
    {label}
    <button onClick={onRemove} className="hover:text-red-500 transition-colors">
      <X size={11} />
    </button>
  </span>
);

export default ProductListing;