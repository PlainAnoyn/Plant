'use client';

import { useState, useEffect, useRef } from 'react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
}

interface TestimonialLoopProps {
  testimonials: Testimonial[];
  speed?: number; // pixels per second
  direction?: 'left' | 'right';
  gap?: number;
  pauseOnHover?: boolean;
  scaleOnHover?: boolean;
}

const TestimonialLoop: React.FC<TestimonialLoopProps> = ({
  testimonials,
  speed = 50,
  direction = 'left',
  gap = 24,
  pauseOnHover = true,
  scaleOnHover = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [cardWidth, setCardWidth] = useState('calc((100% - 120px) / 6)');

  // Calculate card width based on container width
  useEffect(() => {
    const updateCardWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth || containerRef.current.offsetWidth;
        const gapTotal = 5 * gap; // 5 gaps for 6 cards
        const calculatedWidth = (containerWidth - gapTotal) / 6;
        setCardWidth(`${calculatedWidth}px`);
      }
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, [gap]);

  useEffect(() => {
    if (isPaused) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      setScrollPosition((prev) => {
        const moveAmount = speed * deltaTime;
        const totalWidth = containerRef.current?.scrollWidth || 0;
        const visibleWidth = containerRef.current?.clientWidth || 0;
        const singleSetWidth = totalWidth / 3; // Since we duplicate 3 times

        let newPosition = prev + (direction === 'left' ? -moveAmount : moveAmount);

        // Loop seamlessly
        if (direction === 'left' && newPosition <= -singleSetWidth) {
          newPosition += singleSetWidth;
        } else if (direction === 'right' && newPosition >= singleSetWidth) {
          newPosition -= singleSetWidth;
        }

        return newPosition;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [speed, direction, isPaused]);

  const handleMouseEnter = () => {
    if (pauseOnHover) setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) setIsPaused(false);
  };

  // Duplicate testimonials 3 times for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div
      ref={containerRef}
      className="flex gap-6"
      style={{
        transform: `translateX(${scrollPosition}px)`,
        willChange: 'transform',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {duplicatedTestimonials.map((testimonial, index) => (
        <div
          key={`${testimonial.id}-${index}`}
          className={`flex-shrink-0 transition-transform duration-300 ${
            scaleOnHover ? 'hover:scale-105' : ''
          }`}
          style={{
            width: cardWidth,
            minWidth: '280px',
          }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50 p-6 border border-emerald-100 dark:border-slate-700 h-full">
            {/* Rating Stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-emerald-800 dark:text-emerald-300 mb-6 leading-relaxed text-sm">
              "{testimonial.text}"
            </p>

            {/* Customer Info */}
            <div className="flex items-center gap-3 pt-4 border-t border-emerald-100 dark:border-slate-700">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-lg flex-shrink-0">
                {testimonial.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-emerald-900 dark:text-emerald-200 truncate">
                  {testimonial.name}
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 truncate">
                  {testimonial.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestimonialLoop;

