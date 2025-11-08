'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import FlyToCartAnimation from '@/components/FlyToCartAnimation';

interface PlantCardProps {
  plant: {
    _id: string;
    name: string;
    price: number;
    discountPercentage?: number;
    category: string;
    imageUrl: string;
    stock: number;
  };
}

export default function PlantCard({ plant }: PlantCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%32200%22 viewBox=%220 0 300 200%22%3E%3Crect width=%22300%22 height=%22200%22 fill=%22%23e5e7eb%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%239ca3af%22 font-size=%2214%22 font-family=%22Arial, sans-serif%22%3ENo Image%3C/text%3E%3C/svg%3E';

  const getImageUrl = (url?: string): string => {
    if (!url || !url.trim()) return PLACEHOLDER;
    
    try {
      const u = new URL(url.trim());
      
      // If it's source.unsplash.com, use it directly (most reliable)
      if (u.hostname === 'source.unsplash.com') {
        return url;
      }
      
      // For images.unsplash.com, try to use it but will fallback on error
      if (u.hostname === 'images.unsplash.com') {
        if (!u.search) {
          u.search = '?auto=format&fit=crop&w=800&q=80';
        }
        return u.toString();
      }
      
      // For unsplash.com page URLs, use category-based placeholder
      if (u.hostname === 'unsplash.com' && u.pathname.startsWith('/photos/')) {
        return `https://source.unsplash.com/800x800/?${encodeURIComponent(plant.category || 'plant')}`;
      }
      
      // For any other URL, try it
      return url;
    } catch {
      // Invalid URL - use category-based placeholder
      return `https://source.unsplash.com/800x800/?${encodeURIComponent(plant.category || 'plant')}`;
    }
  };

  const initialSrc = getImageUrl(plant.imageUrl);
  const isUnsplash = typeof initialSrc === 'string' && (initialSrc.includes('images.unsplash.com') || initialSrc.includes('source.unsplash.com'));
  const [imageSrc, setImageSrc] = useState(initialSrc);
  
  // Enhanced error handler that uses category-based placeholder
  const handleImageError = () => {
    const categoryFallback = `https://source.unsplash.com/800x800/?${encodeURIComponent(plant.category || 'plant')}`;
    if (imageSrc !== categoryFallback && imageSrc !== PLACEHOLDER) {
      setImageSrc(categoryFallback);
    } else {
      setImageSrc(PLACEHOLDER);
    }
    setImageLoaded(true); // Stop loading state
  };
  const { addToCart, removeFromCart, updateQuantity, cart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationStart, setAnimationStart] = useState({ x: 0, y: 0 });
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showLoveBurst, setShowLoveBurst] = useState(false);
  const loveBurstTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (loveBurstTimeout.current) {
        clearTimeout(loveBurstTimeout.current);
      }
    };
  }, []);

  // Find if this plant is in cart
  const cartItem = cart.find((item) => item._id === plant._id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (plant.stock === 0) return;
    
    // Get button position for animation
    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    setAnimationStart({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    
    setAddingToCart(true);
    setShowAnimation(true);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addToCart({
      _id: plant._id,
      name: plant.name,
      price: plant.price,
      imageUrl: plant.imageUrl,
    });
    
    setAddingToCart(false);
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (quantityInCart === 0) {
      await handleAddToCart(e);
    } else if (quantityInCart < plant.stock) {
      updateQuantity(plant._id, quantityInCart + 1);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (quantityInCart > 1) {
      updateQuantity(plant._id, quantityInCart - 1);
    } else if (quantityInCart === 1) {
      removeFromCart(plant._id);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to product page for checkout
    window.location.href = `/plants/${plant._id}`;
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setWishlistLoading(true);
    const alreadyInWishlist = isInWishlist(plant._id);
    try {
      if (alreadyInWishlist) {
        await removeFromWishlist(plant._id);
      } else {
        await addToWishlist(plant._id);
        setShowLoveBurst(true);
        if (loveBurstTimeout.current) {
          clearTimeout(loveBurstTimeout.current);
        }
        loveBurstTimeout.current = setTimeout(() => {
          setShowLoveBurst(false);
        }, 1300);
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <>
      {showAnimation && (
        <FlyToCartAnimation
          imageUrl={imageSrc}
          from={animationStart}
          onComplete={handleAnimationComplete}
        />
      )}
      <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm dark:shadow-slate-900/50 overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/70 transition-all duration-300 group border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/60 dark:hover:border-slate-600/60">
      <Link href={`/plants/${plant._id}`}>
        <div className="relative h-72 w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 cursor-pointer">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 animate-pulse"></div>
          )}
          <Image
            src={imageSrc}
            alt={plant.name}
            fill
            className={`object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            unoptimized={isUnsplash}
          />
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`absolute top-3 right-3 bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg dark:shadow-slate-900/50 z-30 hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-50 ${
              isInWishlist(plant._id) 
                ? 'text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300' 
                : 'text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400'
            }`}
            title={isInWishlist(plant._id) ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-label={isInWishlist(plant._id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              className="w-5 h-5"
              fill={isInWishlist(plant._id) ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          {showLoveBurst && (
            <div className="love-burst pointer-events-none absolute top-2 right-2 z-10">
              <span className="love-heart love-heart--1">❤️</span>
              <span className="love-heart love-heart--2">💗</span>
              <span className="love-heart love-heart--3">💚</span>
            </div>
          )}

          {plant.stock === 0 && (
            <div className="absolute top-4 left-4 bg-red-500/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-semibold shadow-md z-10 uppercase tracking-wide">
              Out of Stock
            </div>
          )}
          {plant.stock > 0 && plant.stock < 5 && (
            <div className="absolute top-4 left-4 bg-amber-500/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-semibold shadow-md z-10 uppercase tracking-wide">
              Low Stock
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent group-hover:from-black/10 transition-all duration-300"></div>
        </div>
      </Link>
      
      <div className="p-6">
        <Link href={`/plants/${plant._id}`}>
          <div className="flex justify-between items-start mb-4 cursor-pointer gap-3">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 tracking-tight flex-1">
              {plant.name}
            </h3>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap border border-emerald-200/60 dark:border-emerald-800/60 uppercase tracking-wider flex-shrink-0">
              {plant.category}
            </span>
          </div>
        </Link>
               
        <div className="mb-5 space-y-1.5">
          {plant.discountPercentage && plant.discountPercentage > 0 ? (
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <p className="text-2xl font-light text-emerald-600 dark:text-emerald-400 tracking-tight">${(plant.price * (1 - plant.discountPercentage / 100)).toFixed(2)}</p>
              <span className="text-sm line-through text-slate-400 dark:text-slate-500 font-light">${plant.price.toFixed(2)}</span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold uppercase tracking-wide">-{plant.discountPercentage}%</span>
            </div>
          ) : (
            <p className="text-2xl font-light text-emerald-600 dark:text-emerald-400 tracking-tight">${plant.price.toFixed(2)}</p>
          )}
          {plant.stock > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {plant.stock} {plant.stock === 1 ? 'available' : 'available'}
            </p>
          )}
        </div>

        {/* Quantity Controls or Add to Cart */}
        {quantityInCart > 0 ? (
          <div className="flex gap-2.5 items-center">
            <div className="flex-1 flex items-center border border-emerald-400/40 dark:border-emerald-500/40 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-700/50">
              <button
                onClick={handleDecrease}
                disabled={plant.stock === 0}
                className="px-4 py-2.5 bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="flex-1 px-4 py-2.5 text-center font-medium text-emerald-900 dark:text-emerald-200 bg-white/80 dark:bg-slate-800/80">
                {quantityInCart}
              </span>
              <button
                onClick={handleIncrease}
                disabled={plant.stock === 0 || quantityInCart >= plant.stock}
                className="px-4 py-2.5 bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleBuyNow}
              disabled={plant.stock === 0}
              className="flex-shrink-0"
            >
              Buy Now
            </Button>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToCart}
              disabled={plant.stock === 0 || addingToCart}
              loading={addingToCart}
              className="flex-1"
            >
              Add to Cart
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleBuyNow}
              disabled={plant.stock === 0}
              className="flex-1"
            >
              Buy Now
            </Button>
          </div>
        )}
      </div>
    </div>
      <style jsx>{`
      .love-burst {
        width: 72px;
        height: 72px;
      }

      .love-heart {
        position: absolute;
        font-size: 1.25rem;
        opacity: 0;
        animation: love-burst-float 1.3s ease-out forwards;
        text-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
      }

      .love-heart--1 {
        left: 18px;
        bottom: 10px;
        animation-delay: 0s;
      }

      .love-heart--2 {
        left: 32px;
        bottom: 6px;
        animation-delay: 0.08s;
      }

      .love-heart--3 {
        left: 6px;
        bottom: 0px;
        animation-delay: 0.12s;
      }

      @keyframes love-burst-float {
        0% {
          opacity: 0;
          transform: translateY(14px) scale(0.6) rotate(-8deg);
        }
        20% {
          opacity: 1;
          transform: translateY(-6px) scale(1) rotate(0deg);
        }
        70% {
          opacity: 1;
          transform: translateY(-42px) scale(1.08) rotate(6deg);
        }
        100% {
          opacity: 0;
          transform: translateY(-58px) scale(0.9) rotate(4deg);
        }
      }
    `}</style>
    </>
  );
}
