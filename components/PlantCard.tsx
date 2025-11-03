'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
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
    category: string;
    imageUrl: string;
    stock: number;
  };
}

export default function PlantCard({ plant }: PlantCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart, removeFromCart, updateQuantity, cart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationStart, setAnimationStart] = useState({ x: 0, y: 0 });
  const [wishlistLoading, setWishlistLoading] = useState(false);

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
    try {
      if (isInWishlist(plant._id)) {
        await removeFromWishlist(plant._id);
      } else {
        await addToWishlist(plant._id);
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
          imageUrl={plant.imageUrl}
          from={animationStart}
          onComplete={handleAnimationComplete}
        />
      )}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-1 border border-cream-200">
      <Link href={`/plants/${plant._id}`}>
        <div className="relative h-64 w-full overflow-hidden bg-gray-100 cursor-pointer">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
          <Image
            src={plant.imageUrl}
            alt={plant.name}
            fill
            className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            onLoad={() => setImageLoaded(true)}
          />
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg z-20 hover:scale-110 transition-transform duration-200 disabled:opacity-50 ${
              isInWishlist(plant._id) ? 'text-red-500' : 'text-gray-400'
            }`}
            title={isInWishlist(plant._id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              className="w-5 h-5"
              fill={isInWishlist(plant._id) ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {plant.stock === 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
              Out of Stock
            </div>
          )}
          {plant.stock > 0 && plant.stock < 5 && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
              Low Stock
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
        </div>
      </Link>
      
      <div className="p-5">
        <Link href={`/plants/${plant._id}`}>
          <div className="flex justify-between items-start mb-3 cursor-pointer">
                   <h3 className="text-lg font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                     {plant.name}
                   </h3>
                   <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-medium whitespace-nowrap ml-2 border border-emerald-200">
                     {plant.category}
                   </span>
                 </div>
               </Link>
               
               <div className="mb-4">
                 <p className="text-2xl font-bold text-emerald-700 mb-1">${plant.price.toFixed(2)}</p>
          {plant.stock > 0 && (
            <p className="text-xs text-gray-500">
              {plant.stock} {plant.stock === 1 ? 'available' : 'available'}
            </p>
          )}
        </div>

        {/* Quantity Controls or Add to Cart */}
        {quantityInCart > 0 ? (
          <div className="flex gap-2 items-center">
             <div className="flex-1 flex items-center border border-emerald-600 rounded-lg overflow-hidden shadow-sm">
               <button
                 onClick={handleDecrease}
                 disabled={plant.stock === 0}
                 className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 -
               </button>
               <span className="flex-1 px-4 py-2 text-center font-semibold text-emerald-900 bg-white">
                 {quantityInCart}
               </span>
               <button
                 onClick={handleIncrease}
                 disabled={plant.stock === 0 || quantityInCart >= plant.stock}
                 className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex gap-2">
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
    </>
  );
}
