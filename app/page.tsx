'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PlantCard from '@/components/PlantCard';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Counter from '@/components/Counter';
import CustomerTestimonials from '@/components/CustomerTestimonials';
import ProductCarousel from '@/components/ProductCarousel';

const ThreadsBackground = dynamic(() => import('@/components/Threads'), {
  ssr: false,
});

interface Plant {
  _id: string;
  name: string;
  price: number;
  discountPercentage?: number;
  category: string;
  imageUrl: string;
  stock: number;
}

const categories = ['All', 'Indoor', 'Outdoor', 'Succulent', 'Flowering', 'Herb', 'Tree', 'Shrub'];

export default function HomePage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState<Plant[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [freeDelivery, setFreeDelivery] = useState<Plant[]>([]);
  const [freeLoading, setFreeLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollDarkness, setScrollDarkness] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Darkness levels with step thresholds
      // Each level activates after scrolling a certain distance
      const darknessLevels = [
        { threshold: 0, opacity: 0 },      // Level 0: No scroll - no darkness
        { threshold: 50, opacity: 0.1 },   // Level 1: Little scroll - slight darkness
        { threshold: 150, opacity: 0.2 },  // Level 2: More scroll - more darkness
        { threshold: 250, opacity: 0.3 }, // Level 3: Even more - darker
        { threshold: 350, opacity: 0.4 }, // Level 4: More - darker
        { threshold: 450, opacity: 0.5 },  // Level 5: Maximum - darkest
      ];

      // Find the current darkness level based on scroll position
      let currentDarkness = 0;
      for (let i = darknessLevels.length - 1; i >= 0; i--) {
        if (scrollY >= darknessLevels[i].threshold) {
          currentDarkness = darknessLevels[i].opacity;
          break;
        }
      }

      setScrollDarkness(currentDarkness);
    };

    window.addEventListener('scroll', handleScroll);
    // Set initial darkness on mount
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const loadSections = async () => {
      try {
        setFeaturedLoading(true);
        const fRes = await fetch('/api/plants?isFeatured=true&limit=8&sortBy=newest');
        const fJson = await fRes.json();
        if (fJson?.success) setFeatured(fJson.data);
      } catch (e) {
        console.error('Error fetching featured:', e);
      } finally {
        setFeaturedLoading(false);
      }

      try {
        setFreeLoading(true);
        const frRes = await fetch('/api/plants?isFreeDelivery=true&limit=8&sortBy=newest');
        const frJson = await frRes.json();
        if (frJson?.success) setFreeDelivery(frJson.data);
      } catch (e) {
        console.error('Error fetching free delivery:', e);
      } finally {
        setFreeLoading(false);
      }
    };
    loadSections();
  }, []);

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
      params.append('limit', '8');

      const response = await fetch(`/api/plants?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setPlants(data.data);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
            {/* Hero Section - Fixed/Sticky with Blur Effect */}
            <section 
              className="sticky top-0 z-10 h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-primary-950 text-white overflow-hidden"
            >
        {/* Background with Darkening Effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-primary-950 transition-all duration-300"
        >
          <ThreadsBackground
            className="absolute inset-0 opacity-60"
            amplitude={1.15}
            distance={0.35}
            enableMouseInteraction
            color={[0.4, 0.925, 0.7]}
            style={{ mixBlendMode: 'screen' }}
          />
          {/* Darkening overlay */}
          <div 
            className="absolute inset-0 bg-black transition-opacity duration-300 z-10"
            style={{
              opacity: scrollDarkness,
            }}
          ></div>
          
        </div>
        
        {/* Content Layer - Always Clear (Not Blurred) */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in space-y-8">
                  {/* Main Title */}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold mb-4 animate-slide-up leading-tight tracking-tight">
                    Bring <span className="text-emerald-300 relative inline-block">
                      <span className="relative z-10">Nature</span>
                    </span> Closer to Your Home
                  </h1>
            
            {/* Subtitle */}
            <p className="text-base md:text-lg mb-8 text-white/75 max-w-2xl mx-auto animate-slide-up-delay">
              Discover beautiful indoor and outdoor plants to refresh your space, improve air quality, and create a calming environment.
            </p>
            
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-slide-up-delay-2">
                    <Button
                      size="lg"
                      variant="primary"
                      className="px-8"
                      onClick={() => {
                        const section = document.getElementById('featured-plants');
                        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      Shop Now
                    </Button>
                    <Link href="/about" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        variant="outline"
                        className="px-8 w-full"
                      >
                        Learn Plant Care
                      </Button>
                    </Link>
                  </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-slide-up-delay-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-left">
                <div className="text-4xl md:text-5xl font-semibold mb-1 text-white">
                  <Counter end={20000} suffix="+" duration={2500} />
                </div>
                <div className="text-white/70 text-sm uppercase tracking-wide">Plant Collection</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-left">
                <div className="text-4xl md:text-5xl font-semibold mb-1 text-white">
                  <Counter end={60} suffix="+" duration={2000} />
                </div>
                <div className="text-white/70 text-sm uppercase tracking-wide">Categories</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-left">
                <div className="text-4xl md:text-5xl font-semibold mb-1 text-white">
                  <Counter end={500000} suffix="+" duration={3000} />
                </div>
                <div className="text-white/70 text-sm uppercase tracking-wide">Customers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

             {/* Content Below Hero - Scrolls Over */}
             <div className="relative z-20 bg-white dark:bg-slate-900">
               {/* Smooth Top Edge with Gradient */}
               <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-slate-900/50 dark:to-slate-900 pointer-events-none"></div>
             {/* Features Section */}
             <section className="py-16 bg-cream-50 dark:bg-slate-800/50 relative pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🌿</div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Fresh Plants</h3>
              <p className="text-slate-600 dark:text-slate-400">Hand-picked, healthy plants delivered to your door</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💚</div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Expert Care</h3>
              <p className="text-slate-600 dark:text-slate-400">Detailed care instructions for every plant</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Easy Delivery</h3>
              <p className="text-slate-600 dark:text-slate-400">Fast and secure shipping nationwide</p>
            </div>
          </div>
        </div>
      </section>

             {/* Search and Filter Section */}
             <section className="py-12 bg-cream-100 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-500 focus:border-emerald-300/70 dark:focus:border-emerald-500/70 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                     className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                         selectedCategory === category
                           ? 'bg-emerald-600 dark:bg-emerald-500 text-white border border-emerald-500 dark:border-emerald-400'
                           : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400'
                       }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Plants Section (from isFeatured flag) */}
      <section id="featured-plants" className="py-16 bg-white dark:bg-slate-900 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-12">
                   <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Featured Plants</h2>
                   <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">
                     Curated selection highlighted by our team.
                   </p>
                 </div>
         {featuredLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[...Array(8)].map((_, i) => (
               <LoadingSkeleton key={i} />
             ))}
           </div>
         ) : featured.length === 0 ? (
           <div className="text-center py-16">
             <div className="text-6xl mb-4">🌱</div>
             <p className="text-gray-600 dark:text-slate-300 text-lg mb-4">No plants found.</p>
             <p className="text-gray-500 dark:text-slate-400">Try a different search or category.</p>
           </div>
          ) : (
            <ProductCarousel
              items={featured}
              variant="light"
              getKey={(plant) => plant._id}
              renderItem={(plant) => <PlantCard plant={plant} />}
            />
          )}

                 {featured.length > 0 && (
                   <div className="flex justify-center mt-12">
                     <Link href="/plants">
                       <Button size="md" variant="primary" className="px-8">
                         View All Plants
                       </Button>
                     </Link>
                   </div>
                 )}
        </div>
      </section>

      {/* Free Delivery Section (from isFreeDelivery flag) */}
      <section className="py-16 bg-cream-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Free Delivery Picks</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">Popular choices with free delivery.</p>
          </div>
          {freeLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[...Array(8)].map((_, i) => (
                 <LoadingSkeleton key={i} />
                ))}
              </div>
            ) : freeDelivery.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🚚</div>
                <p className="text-gray-600 dark:text-slate-300 text-lg mb-4">No free delivery items right now.</p>
              </div>
          ) : (
            <ProductCarousel
              items={freeDelivery}
              variant="cream"
              getKey={(plant) => plant._id}
              renderItem={(plant) => <PlantCard plant={plant} />}
            />
          )}
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <CustomerTestimonials />
      </div>
    </div>
  );
}
