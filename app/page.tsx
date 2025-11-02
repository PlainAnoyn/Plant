'use client';

import { useEffect, useState } from 'react';
import PlantCard from '@/components/PlantCard';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Counter from '@/components/Counter';
import CustomerTestimonials from '@/components/CustomerTestimonials';

interface Plant {
  _id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

const categories = ['All', 'Indoor', 'Outdoor', 'Succulent', 'Flowering', 'Herb', 'Tree', 'Shrub'];

export default function HomePage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollDarkness, setScrollDarkness] = useState(0);

  useEffect(() => {
    fetchPlants();
  }, [selectedCategory, searchQuery]);

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
          {/* Darkening overlay */}
          <div 
            className="absolute inset-0 bg-black transition-opacity duration-300 z-10"
            style={{
              opacity: scrollDarkness,
            }}
          ></div>
          
          {/* Plant Leaf Overlays - Animated */}
          <div className="absolute inset-0 opacity-15 overflow-hidden z-0">
          {/* Large leaf shapes with animation */}
          <div className="absolute top-10 left-10 w-64 h-80 animate-leaf-drift">
            <svg viewBox="0 0 200 300" className="w-full h-full">
              <path d="M100,20 Q140,80 130,150 Q120,200 90,220 Q60,240 40,200 Q20,160 50,120 Q80,80 100,20" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"/>
              <path d="M120,50 Q150,100 145,160 Q140,210 115,225 Q90,240 70,210 Q50,180 70,140 Q90,100 120,50" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
            </svg>
          </div>
          <div className="absolute top-20 right-20 w-72 h-96 animate-float-delayed">
            <svg viewBox="0 0 250 350" className="w-full h-full">
              <path d="M125,30 Q170,90 160,160 Q150,230 120,250 Q90,270 65,230 Q40,190 60,140 Q80,90 125,30" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"/>
            </svg>
          </div>
          <div className="absolute bottom-20 left-20 w-80 h-72 animate-float-slow">
            <svg viewBox="0 0 300 250" className="w-full h-full">
              <path d="M150,230 Q110,170 100,100 Q90,30 120,10 Q150,-10 180,20 Q210,50 190,100 Q170,150 150,230" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"/>
            </svg>
          </div>
          <div className="absolute bottom-10 right-10 w-60 h-80 animate-float">
            <svg viewBox="0 0 200 300" className="w-full h-full">
              <path d="M100,280 Q60,220 70,150 Q80,80 110,60 Q140,40 170,70 Q200,100 180,150 Q160,200 100,280" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"/>
            </svg>
          </div>
          
          {/* Floating particles/circles */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/20 rounded-full animate-pulse-glow"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/30 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-white/15 rounded-full animate-float-slow"></div>
          <div className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-white/25 rounded-full animate-float"></div>
          </div>
        </div>
        
        {/* Content Layer - Always Clear (Not Blurred) */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
                  {/* Main Title */}
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-slide-up leading-tight">
                    Bring <span className="text-emerald-400 relative inline-block">
                      <span className="relative z-10">Nature</span>
                      <span className="absolute inset-0 bg-emerald-400/20 blur-2xl rounded-lg animate-pulse-glow -z-0"></span>
                    </span> Closer to Your Home
                  </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl mb-10 text-white/90 max-w-3xl mx-auto animate-slide-up-delay">
              Discover beautiful indoor & outdoor plants to refresh your space, improve air quality, and create a calming environment.
            </p>
            
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up-delay-2">
                    <button 
                      onClick={() => {
                        const section = document.getElementById('featured-plants');
                        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="relative bg-emerald-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-all duration-300 shadow-2xl hover:shadow-emerald-900/50 transform hover:scale-110 border border-emerald-500/30 group overflow-hidden cursor-pointer"
                    >
                      <span className="relative z-10">Shop Now</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                    <Link href="/about">
                      <button className="border-2 border-white/30 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 flex items-center gap-3 backdrop-blur-sm bg-white/5 hover:scale-105 group relative overflow-hidden">
                        <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                          <polygon points="10,8 16,12 10,16" fill="currentColor"/>
                        </svg>
                        <span className="relative z-10">Learn Plant Care</span>
                        <div className="absolute inset-0 bg-white/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </button>
                    </Link>
                  </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up-delay-2">
              <div className="group relative">
                <div className="absolute inset-0 bg-emerald-400/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-5xl md:text-6xl font-bold mb-2 animate-float">
                    <Counter end={20000} suffix="+" duration={2500} />
                  </div>
                  <div className="text-white/80 text-lg group-hover:text-white transition-colors duration-300">Plant Collection</div>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-emerald-400/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-5xl md:text-6xl font-bold mb-2 animate-float-delayed">
                    <Counter end={60} suffix="+" duration={2000} />
                  </div>
                  <div className="text-white/80 text-lg group-hover:text-white transition-colors duration-300">Categories</div>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-emerald-400/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-5xl md:text-6xl font-bold mb-2 animate-float-slow">
                    <Counter end={500000} suffix="+" duration={3000} />
                  </div>
                  <div className="text-white/80 text-lg group-hover:text-white transition-colors duration-300">Customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

             {/* Content Below Hero - Scrolls Over */}
             <div className="relative z-20 bg-white">
               {/* Smooth Top Edge with Gradient */}
               <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none"></div>
             {/* Features Section */}
             <section className="py-16 bg-cream-50 relative pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🌿</div>
              <h3 className="text-xl font-semibold text-emerald-900 mb-2">Fresh Plants</h3>
              <p className="text-emerald-800">Hand-picked, healthy plants delivered to your door</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💚</div>
              <h3 className="text-xl font-semibold text-emerald-900 mb-2">Expert Care</h3>
              <p className="text-emerald-800">Detailed care instructions for every plant</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold text-emerald-900 mb-2">Easy Delivery</h3>
              <p className="text-emerald-800">Fast and secure shipping nationwide</p>
            </div>
          </div>
        </div>
      </section>

             {/* Search and Filter Section */}
             <section className="py-12 bg-cream-100">
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
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                     className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
                         selectedCategory === category
                           ? 'bg-emerald-700 text-white shadow-lg scale-105 border border-emerald-600'
                           : 'bg-white text-emerald-800 hover:bg-emerald-50 shadow-sm hover:shadow-md border border-cream-200'
                       }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Plants Section */}
      <section id="featured-plants" className="py-16 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-12">
                   <h2 className="text-4xl font-bold text-emerald-900 mb-4">
                     {selectedCategory === 'All' ? 'Featured Plants' : `${selectedCategory} Plants`}
                   </h2>
                   <p className="text-emerald-800 text-lg max-w-2xl mx-auto">
                     Explore our carefully curated collection of beautiful plants, perfect for any space or occasion.
                   </p>
                 </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : plants.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🌱</div>
              <p className="text-gray-600 text-lg mb-4">No plants found.</p>
              <p className="text-gray-500">Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {plants.map((plant, index) => (
                <div
                  key={plant._id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PlantCard plant={plant} />
                </div>
              ))}
            </div>
          )}

                 {plants.length > 0 && (
                   <div className="flex justify-center mt-12">
                     <Link href="/plants">
                       <Button size="lg" variant="primary">
                         View All Plants
                       </Button>
                     </Link>
                   </div>
                 )}
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <CustomerTestimonials />
      </div>
    </div>
  );
}
