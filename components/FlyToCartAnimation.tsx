'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface FlyToCartAnimationProps {
  imageUrl: string;
  from: { x: number; y: number };
  onComplete: () => void;
}

export default function FlyToCartAnimation({ imageUrl, from, onComplete }: FlyToCartAnimationProps) {
  const [cartPosition, setCartPosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const calculateCartPosition = () => {
      // Try to get cart button from DOM first
      const cartButton = document.querySelector('[data-cart-button]') as HTMLElement;
      
      if (cartButton) {
        // Force a reflow to ensure layout is calculated
        void cartButton.offsetHeight;
        
        const rect = cartButton.getBoundingClientRect();
        
        // Even if button has opacity-0, it should still have position
        // Check if rect is valid (has dimensions or position)
        if (rect.width > 0 || rect.height > 0 || (rect.left >= 0 && rect.top >= 0)) {
          setCartPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });
          return;
        }
      }
      
      // Fallback: Calculate based on fixed positioning
      // Cart button is: fixed bottom-6 right-6
      // bottom-6 = 1.5rem = 24px from bottom
      // right-6 = 1.5rem = 24px from right
      const windowWidth = window.innerWidth || 1920;
      const windowHeight = window.innerHeight || 1080;
      
      // Button size: p-4 (16px padding) + icon (24px) = ~56px total
      // Center calculation: right edge - 24px - (56px / 2) = right edge - 52px
      const buttonSize = 56; // Approximate button size
      const rightOffset = 24; // right-6 = 24px
      const bottomOffset = 24; // bottom-6 = 24px
      
      setCartPosition({
        x: windowWidth - rightOffset - (buttonSize / 2),
        y: windowHeight - bottomOffset - (buttonSize / 2),
      });
    };

    // Calculate position immediately
    calculateCartPosition();

    // Also recalculate after a short delay in case layout hasn't settled
    const retryTimer = setTimeout(() => {
      calculateCartPosition();
    }, 50);

    // Start animation
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 200); // Wait for fade out
    }, 800);

    return () => {
      clearTimeout(retryTimer);
      clearTimeout(timer);
    };
  }, [onComplete]);

  if (!isAnimating) return null;

  const distanceX = cartPosition.x - from.x;
  const distanceY = cartPosition.y - from.y;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  return (
    <div
      className="fixed z-[10001] pointer-events-none"
      style={{
        left: `${from.x}px`,
        top: `${from.y}px`,
        '--target-x': `${distanceX}px`,
        '--target-y': `${distanceY}px`,
        animation: 'fly-to-cart 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      } as React.CSSProperties}
    >
      <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-2xl border-4 border-white bg-white">
        <Image
          src={imageUrl}
          alt="Flying item"
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
    </div>
  );
}

