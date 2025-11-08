'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

interface ProductCarouselProps<T> {
  items: T[];
  getKey: (item: T, index: number) => string;
  renderItem: (item: T) => ReactNode;
  variant?: 'light' | 'cream';
}

function ProductCarousel<T>({
  items,
  getKey,
  renderItem,
  variant = 'light',
}: ProductCarouselProps<T>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [items, updateScrollState]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollState();

    const onScroll = () => updateScrollState();
    const onResize = () => updateScrollState();

    container.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);

    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [updateScrollState]);

  const scrollByCard = (direction: number) => {
    const container = scrollRef.current;
    if (!container) return;

    let cardWidth = container.clientWidth * 0.8;
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      cardWidth = rect.width + 24; // approximate gap
    }

    container.scrollBy({ left: cardWidth * direction, behavior: 'smooth' });

    // Ensure state updates after smooth scroll
    window.setTimeout(() => updateScrollState(), 350);
  };

  if (!items.length) {
    return null;
  }

  const gradientBase = variant === 'cream'
    ? 'from-cream-50 dark:from-slate-800 via-cream-50/70 dark:via-slate-800/70 to-transparent'
    : 'from-white dark:from-slate-900 via-white/75 dark:via-slate-900/75 to-transparent';

  const buttonPalette = variant === 'cream'
    ? 'border-white/50 dark:border-slate-700/50 bg-white/55 dark:bg-slate-800/80 text-emerald-700 dark:text-emerald-300 hover:bg-white/70 dark:hover:bg-slate-800'
    : 'border-white/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/80 text-emerald-700 dark:text-emerald-300 hover:bg-white/75 dark:hover:bg-slate-800';

  return (
    <div className="relative">
      <div className={`pointer-events-none absolute inset-y-6 left-0 w-12 bg-gradient-to-r ${gradientBase} opacity-95 z-10`}></div>
      <div className={`pointer-events-none absolute inset-y-6 right-0 w-12 bg-gradient-to-l ${gradientBase} opacity-95 z-10`}></div>

      <button
        type="button"
        aria-label="Scroll items left"
        onClick={() => scrollByCard(-1)}
        disabled={!canScrollLeft}
        className={`absolute left-4 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border p-2 shadow-lg backdrop-blur transition-all duration-200 ${buttonPalette} ${
          canScrollLeft ? 'opacity-95' : 'opacity-55 cursor-not-allowed'
        }`}
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth px-1 sm:px-2 lg:px-3"
        style={{ scrollbarWidth: 'thin' }}
      >
        {items.map((item, index) => (
          <div
            key={getKey(item, index)}
            ref={index === 0 ? itemRef : undefined}
            data-carousel-item
            className="flex-shrink-0 w-[240px] sm:w-[260px] lg:w-[280px] xl:w-[300px]"
          >
            {renderItem(item)}
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll items right"
        onClick={() => scrollByCard(1)}
        disabled={!canScrollRight}
        className={`absolute right-4 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border p-2 shadow-lg backdrop-blur transition-all duration-200 ${buttonPalette} ${
          canScrollRight ? 'opacity-95' : 'opacity-55 cursor-not-allowed'
        }`}
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export default ProductCarousel;

