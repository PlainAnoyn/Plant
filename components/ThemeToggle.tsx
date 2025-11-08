'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
        onClick={toggleTheme}
        className="relative w-20 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-800 shadow-md hover:shadow-lg"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Toggle Background */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-[#7B61FF] via-[#6B51E8] to-[#5C48D1]'
              : 'bg-gradient-to-r from-[#87CEEB] via-[#6BB6FF] to-[#4A90E2]'
          }`}
        >
          {/* Dark Mode: Stars on the right */}
          {theme === 'dark' && (
            <>
              {/* Large star */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 star-twinkle">
                <svg
                  className="w-3.5 h-3.5 text-[#5C48D1]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2L12 16.8l-6 4.8 2.4-7.2-6-4.8h7.6L12 2z" />
                </svg>
              </div>
              {/* Small star - top */}
              <div className="absolute right-6 top-1/3 star-twinkle-delayed">
                <svg
                  className="w-2.5 h-2.5 text-[#5C48D1]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2L12 16.8l-6 4.8 2.4-7.2-6-4.8h7.6L12 2z" />
                </svg>
              </div>
              {/* Tiny star - bottom */}
              <div className="absolute right-4 bottom-1/4 star-twinkle" style={{ animationDelay: '1s' }}>
                <svg
                  className="w-2 h-2 text-[#5C48D1]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2L12 16.8l-6 4.8 2.4-7.2-6-4.8h7.6L12 2z" />
                </svg>
              </div>
            </>
          )}

          {/* Light Mode: Clouds on the left */}
          {theme === 'light' && (
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {/* Cloud 1 - Larger */}
              <div className="relative cloud-drift">
                <div className="w-3.5 h-2.5 bg-white rounded-full opacity-95"></div>
                <div className="absolute -left-0.5 top-0.5 w-2.5 h-1.5 bg-white rounded-full opacity-95"></div>
                <div className="absolute left-0.5 top-0.5 w-2 h-1.5 bg-white rounded-full opacity-95"></div>
                <div className="absolute left-1.5 top-0 w-1.5 h-1 bg-white rounded-full opacity-95"></div>
              </div>
              {/* Cloud 2 - Medium */}
              <div className="relative -ml-1 cloud-drift-delayed">
                <div className="w-2.5 h-2 bg-white rounded-full opacity-90"></div>
                <div className="absolute -left-0.5 top-0.5 w-2 h-1.5 bg-white rounded-full opacity-90"></div>
                <div className="absolute left-0.5 top-0 w-1.5 h-1 bg-white rounded-full opacity-90"></div>
              </div>
              {/* Cloud 3 - Small */}
              <div className="relative -ml-0.5 cloud-drift" style={{ animationDelay: '1.2s' }}>
                <div className="w-2 h-1.5 bg-white rounded-full opacity-85"></div>
                <div className="absolute -left-0.5 top-0.5 w-1.5 h-1 bg-white rounded-full opacity-85"></div>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full transition-all duration-300 shadow-lg ${
            theme === 'dark'
              ? 'left-1 bg-white'
              : 'left-[calc(100%-1.75rem)] bg-yellow-400 border-2 border-blue-300'
          }`}
        >
          {/* Dark Mode: Moon with craters */}
          {theme === 'dark' && (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-white rounded-full"></div>
              {/* Moon craters */}
              <div className="absolute top-1 right-1.5 w-1 h-1 bg-gray-200 rounded-full opacity-70"></div>
              <div className="absolute bottom-1.5 left-1 w-0.5 h-0.5 bg-gray-200 rounded-full opacity-70"></div>
              <div className="absolute bottom-1.5 right-1 w-0.5 h-0.5 bg-gray-200 rounded-full opacity-70"></div>
            </div>
          )}

          {/* Light Mode: Sun */}
          {theme === 'light' && (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-yellow-400 rounded-full"></div>
              {/* Sun gradient effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500"></div>
            </div>
          )}
        </div>
      </button>
  );
}

