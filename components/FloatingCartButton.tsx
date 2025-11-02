'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

export default function FloatingCartButton() {
  const { getTotalItems } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const cartCount = getTotalItems();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/cart');
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 ${
        cartCount > 0 ? 'opacity-100 pointer-events-auto animate-fade-in' : 'opacity-0 pointer-events-none'
      }`}
    >
      <button
        data-cart-button
        onClick={handleClick}
        className="relative bg-emerald-700 text-white rounded-full p-4 shadow-2xl hover:bg-emerald-800 transition-all duration-300 hover:scale-110 flex items-center justify-center group cursor-pointer border-2 border-emerald-600"
        aria-label="View cart"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        
        {/* Cart Count Badge */}
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        )}
      </button>
    </div>
  );
}

