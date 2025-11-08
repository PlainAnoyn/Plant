'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import FlyToCartAnimation from '@/components/FlyToCartAnimation';
import Reviews from '@/components/Reviews';
import ProductRecommendations from '@/components/ProductRecommendations';

interface Plant {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPercentage?: number;
  category: string;
  imageUrl: string;
  stock: number;
  careInstructions?: string;
  sunlight?: string;
  water?: string;
}

export default function PlantDetailsPage() {
  const params = useParams();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationStart, setAnimationStart] = useState({ x: 0, y: 0 });
  const { addToCart } = useCart();

  const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22 viewBox=%220 0 800 600%22%3E%3Crect width=%22800%22 height=%22600%22 fill=%22%23e5e7eb%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%239ca3af%22 font-size=%2220%22 font-family=%22Arial, sans-serif%22%3ENo Image%3C/text%3E%3C/svg%3E';
  
  const getImageUrl = (url?: string, category?: string): string => {
    if (!url || !url.trim()) {
      return category 
        ? `https://source.unsplash.com/1200x1200/?${encodeURIComponent(category)}`
        : PLACEHOLDER;
    }
    
    try {
      const u = new URL(url.trim());
      
      // If it's source.unsplash.com, use it directly (most reliable)
      if (u.hostname === 'source.unsplash.com') {
        return url;
      }
      
      // For images.unsplash.com, try to use it but will fallback on error
      if (u.hostname === 'images.unsplash.com') {
        if (!u.search) {
          u.search = '?auto=format&fit=crop&w=1200&q=80';
        }
        return u.toString();
      }
      
      // For unsplash.com page URLs, use category-based placeholder
      if (u.hostname === 'unsplash.com' && u.pathname.startsWith('/photos/')) {
        return category 
          ? `https://source.unsplash.com/1200x1200/?${encodeURIComponent(category)}`
          : PLACEHOLDER;
      }
      
      // For any other URL, try it
      return url;
    } catch {
      // Invalid URL - use category-based placeholder
      return category 
        ? `https://source.unsplash.com/1200x1200/?${encodeURIComponent(category)}`
        : PLACEHOLDER;
    }
  };
  
  const [imageSrc, setImageSrc] = useState<string>(plant ? getImageUrl(plant.imageUrl, plant.category) : PLACEHOLDER);
  
  // Enhanced error handler that uses category-based placeholder
  const handleImageError = () => {
    if (plant) {
      const categoryFallback = `https://source.unsplash.com/1200x1200/?${encodeURIComponent(plant.category || 'plant')}`;
      if (imageSrc !== categoryFallback && imageSrc !== PLACEHOLDER) {
        setImageSrc(categoryFallback);
      } else {
        setImageSrc(PLACEHOLDER);
      }
    } else {
      setImageSrc(PLACEHOLDER);
    }
    setImageLoaded(true); // Stop loading state
  };

  useEffect(() => {
    if (params.id) {
      fetchPlant(params.id as string);
    }
  }, [params.id]);
  
  useEffect(() => {
    if (plant) {
      const newSrc = getImageUrl(plant.imageUrl, plant.category);
      setImageSrc(newSrc);
      setImageLoaded(false);
    }
  }, [plant?.imageUrl, plant?.category]);

  const fetchPlant = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/plants/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setPlant(data.data);
      } else {
        setError(data.error || 'Plant not found');
      }
    } catch (error) {
      console.error('Error fetching plant:', error);
      setError('Failed to load plant details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (!plant || plant.stock === 0) return;
    
    // Get button position for animation
    if (e) {
      const button = e.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      setAnimationStart({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    
    setAddingToCart(true);
    setShowAnimation(true);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        _id: plant._id,
        name: plant.name,
        price: plant.price,
        imageUrl: plant.imageUrl,
      });
    }
    
    setAddingToCart(false);
    alert(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`);
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-600 dark:border-emerald-500 border-t-transparent"></div>
          <p className="mt-6 text-gray-600 dark:text-slate-300 text-lg">Loading plant details...</p>
        </div>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-200 mb-2">Oops!</h2>
          <p className="text-red-600 dark:text-red-400 text-lg mb-6">{error || 'Plant not found'}</p>
          <Link href="/plants">
            <Button variant="primary">← Back to Plants</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {showAnimation && (
        <FlyToCartAnimation
          imageUrl={plant.imageUrl}
          from={animationStart}
          onComplete={handleAnimationComplete}
        />
      )}
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/plants" 
          className="inline-flex items-center text-primary-600 dark:text-emerald-400 hover:text-primary-700 dark:hover:text-emerald-300 mb-6 transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Plants
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl dark:shadow-slate-900/50 overflow-hidden animate-scale-in border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 lg:p-12">
            {/* Image Section */}
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-700">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-slate-600 animate-pulse"></div>
              )}
              <Image
                src={imageSrc}
                alt={plant.name}
                fill
                className={`object-cover transition-opacity duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                onLoad={() => setImageLoaded(true)}
                onError={handleImageError}
                unoptimized={typeof imageSrc === 'string' && (imageSrc.includes('images.unsplash.com') || imageSrc.includes('source.unsplash.com'))}
              />
              {plant.stock === 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Out of Stock
                </div>
              )}
              {plant.stock > 0 && plant.stock < 5 && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Only {plant.stock} left!
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col justify-center animate-slide-up">
              <div className="mb-4">
                <span className="inline-block bg-primary-100 dark:bg-emerald-900/30 text-primary-800 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-semibold">
                  {plant.category}
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-slate-100 mb-4">{plant.name}</h1>
              
              <div className="mb-6 flex items-baseline gap-4">
                {plant.discountPercentage && plant.discountPercentage > 0 ? (
                  <>
                    <p className="text-4xl font-bold text-primary-600 dark:text-emerald-400">${(plant.price * (1 - plant.discountPercentage / 100)).toFixed(2)}</p>
                    <span className="text-lg line-through text-gray-500 dark:text-slate-400">${plant.price.toFixed(2)}</span>
                    <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-semibold">-{plant.discountPercentage}%</span>
                  </>
                ) : (
                  <p className="text-4xl font-bold text-primary-600 dark:text-emerald-400">${plant.price.toFixed(2)}</p>
                )}
                {plant.stock > 0 ? (
                  <span className="inline-flex items-center text-green-600 dark:text-green-400 font-semibold">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    In Stock ({plant.stock} available)
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 font-semibold">Out of Stock</span>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-3">Description</h2>
                <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-lg">{plant.description}</p>
              </div>

              {/* Care Information */}
              {(plant.sunlight || plant.water || plant.careInstructions) && (
                <div className="mb-8 border-t border-gray-200 dark:border-slate-700 pt-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-4">Care Information</h2>
                  <div className="space-y-4">
                    {plant.sunlight && (
                      <div className="flex items-start space-x-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
                        <span className="text-3xl flex-shrink-0">☀️</span>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-slate-200 mb-1">Sunlight</p>
                          <p className="text-gray-600 dark:text-slate-300">{plant.sunlight}</p>
                        </div>
                      </div>
                    )}
                    {plant.water && (
                      <div className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
                        <span className="text-3xl flex-shrink-0">💧</span>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-slate-200 mb-1">Watering</p>
                          <p className="text-gray-600 dark:text-slate-300">{plant.water}</p>
                        </div>
                      </div>
                    )}
                    {plant.careInstructions && (
                      <div className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50">
                        <span className="text-3xl flex-shrink-0">📝</span>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-slate-200 mb-1">Care Instructions</p>
                          <p className="text-gray-600 dark:text-slate-300">{plant.careInstructions}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                {plant.stock > 0 && (
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Quantity:</label>
                    <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-slate-200"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-6 py-2 border-x border-gray-300 dark:border-slate-600 font-semibold text-gray-900 dark:text-slate-100">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(plant.stock, quantity + 1))}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-slate-200"
                        disabled={quantity >= plant.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
                
                <Button
                  size="lg"
                  variant="primary"
                  disabled={plant.stock === 0 || addingToCart}
                  loading={addingToCart}
                  onClick={handleAddToCart}
                  className="w-full"
                >
                  {plant.stock > 0 ? `Add ${quantity} to Cart` : 'Out of Stock'}
                </Button>
                
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Free shipping on orders over $50</span>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Reviews plantId={plant._id} />
        </div>

        {/* Product Recommendations */}
        <ProductRecommendations plantId={plant._id} category={plant.category} limit={4} />
      </div>
    </>
  );
}
