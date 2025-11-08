'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PlantCard from '@/components/PlantCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Button from '@/components/ui/Button';

interface Plant {
  _id: string;
  name: string;
  price: number;
  discountPercentage?: number;
  category: string;
  imageUrl: string;
  stock: number;
}

function PlantsContent() {
  const searchParams = useSearchParams();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('name');

  useEffect(() => {
    fetchPlants();
  }, [page, selectedCategory, searchQuery, priceRange, stockFilter, sortBy]);

  const fetchPlants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (priceRange.min) {
        params.append('minPrice', priceRange.min);
      }
      if (priceRange.max) {
        params.append('maxPrice', priceRange.max);
      }
      if (stockFilter !== 'all') {
        params.append('stockFilter', stockFilter);
      }
      if (sortBy) {
        params.append('sortBy', sortBy);
      }
      params.append('page', page.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/plants?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setPlants(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setStockFilter('all');
    setSortBy('name');
    setSearchQuery('');
    setSelectedCategory('All');
    setPage(1);
  };

  const categories = ['All', 'Indoor', 'Outdoor', 'Succulent', 'Flowering', 'Herb', 'Tree', 'Shrub'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 animate-fade-in text-center">
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Shop</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-light">Discover our curated collection of plants</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm dark:shadow-slate-900/50 p-6 lg:p-7 sticky top-24">
              {/* Search */}
              <div className="mb-7">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search plants..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200/80 dark:border-slate-600/80 rounded-xl focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-400/60 dark:focus:border-emerald-500/60 transition-all text-sm bg-slate-50/50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-7">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Categories</label>
                <div className="space-y-1.5">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setPage(1);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-700/60 shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-7">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Price Range</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Min Price</label>
                    <input
                      type="number"
                      placeholder="$0"
                      value={priceRange.min}
                      onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 border border-slate-200/80 dark:border-slate-600/80 rounded-xl focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-400/60 dark:focus:border-emerald-500/60 text-sm bg-slate-50/50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Max Price</label>
                    <input
                      type="number"
                      placeholder="$1000"
                      value={priceRange.max}
                      onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 border border-slate-200/80 dark:border-slate-600/80 rounded-xl focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-400/60 dark:focus:border-emerald-500/60 text-sm bg-slate-50/50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Filter */}
              <div className="mb-7">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Stock Status</label>
                <select
                  value={stockFilter}
                  onChange={(e) => {
                    setStockFilter(e.target.value as 'all' | 'in-stock' | 'out-of-stock');
                    setPage(1);
                  }}
                  className="w-full px-4 py-2.5 border border-slate-200/80 dark:border-slate-600/80 rounded-xl focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-400/60 dark:focus:border-emerald-500/60 text-sm bg-slate-50/50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100"
                >
                  <option value="all">All Products</option>
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="mb-7">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'name' | 'price-low' | 'price-high' | 'newest');
                    setPage(1);
                  }}
                  className="w-full px-4 py-2.5 border border-slate-200/80 dark:border-slate-600/80 rounded-xl focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-400/60 dark:focus:border-emerald-500/60 text-sm bg-slate-50/50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(priceRange.min || priceRange.max || stockFilter !== 'all' || sortBy !== 'name' || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all font-medium border border-slate-200/80 dark:border-slate-600/80"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content - Products */}
          <div className="flex-1 min-w-0">
            {/* Plants Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(12)].map((_, i) => (
                  <LoadingSkeleton key={i} />
                ))}
              </div>
            ) : plants.length === 0 ? (
              <div className="text-center py-24 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm dark:shadow-slate-900/50">
                <div className="text-7xl mb-6">🌱</div>
                <p className="text-slate-700 dark:text-slate-200 text-lg font-medium mb-2">No plants found</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {plants.map((plant, index) => (
                    <div
                      key={plant._id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <PlantCard plant={plant} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center items-center space-x-6">
                    <Button
                      variant="outline"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-6 py-2.5"
                    >
                      Previous
                    </Button>
                    <span className="px-8 py-2.5 text-slate-600 dark:text-slate-300 font-medium text-sm tracking-wide">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-6 py-2.5"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlantsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <PlantsContent />
    </Suspense>
  );
}
