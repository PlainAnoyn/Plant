'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import Button from '@/components/ui/Button';
import AdminNavbar from './AdminNavbar';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  
  // Don't show regular navbar for admin routes (sidebar will be shown instead)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-emerald-100 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <span className="text-3xl font-semibold text-emerald-600 group-hover:scale-105 transition-transform duration-200 block">🌱</span>
                <div className="absolute inset-0 bg-emerald-200 rounded-full opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors duration-200 tracking-tight">
                PlantShop
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-1 text-sm">
            <Link 
              href="/" 
              className="px-4 py-2 text-emerald-800/90 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-md transition-colors duration-150 font-medium"
            >
              <span className="relative z-10">Home</span>
              <span className="absolute inset-0 bg-emerald-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-0"></span>
            </Link>
            <Link 
              href="/plants" 
              className="px-4 py-2 text-emerald-800/90 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-md transition-colors duration-150 font-medium"
            >
              <span className="relative z-10">Shop</span>
              <span className="absolute inset-0 bg-emerald-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-0"></span>
            </Link>
            <Link 
              href="/about" 
              className="px-4 py-2 text-emerald-800/90 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-md transition-colors duration-150 font-medium"
            >
              <span className="relative z-10">About</span>
              <span className="absolute inset-0 bg-emerald-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-0"></span>
            </Link>
            <Link 
              href="/contact" 
              className="px-4 py-2 text-emerald-800/90 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-md transition-colors duration-150 font-medium"
            >
              <span className="relative z-10">Contact</span>
              <span className="absolute inset-0 bg-emerald-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-0"></span>
            </Link>
            <Link 
              href="/faq" 
              className="px-4 py-2 text-emerald-800/90 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-md transition-colors duration-150 font-medium"
            >
              <span className="relative z-10">FAQ</span>
              <span className="absolute inset-0 bg-emerald-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-0"></span>
            </Link>
            <div className="ml-6 flex items-center gap-3 border-l border-emerald-200/70 dark:border-slate-700 pl-6">
              {isAuthenticated ? (
                <>
                  <Link href="/wishlist" className="relative px-3 py-2 text-emerald-800/90 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-md transition-colors duration-150" title="Wishlist">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {wishlist.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                  <Link href="/orders" className="px-3 py-2 text-emerald-800/90 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-md transition-colors duration-150" title="Orders">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="px-3 py-2 text-emerald-800/90 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-md transition-colors duration-150" title="Admin Dashboard">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Link>
                  )}
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-slate-800 rounded-full hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors">
                    {user?.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-emerald-800 dark:text-emerald-300 text-sm font-medium hidden lg:block">
                      {user?.name}
                    </span>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleLogout}
                    className="rounded-full px-4"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button 
                    size="sm" 
                    variant="primary"
                    className="rounded-full px-6"
                  >
                    Login
                  </Button>
                </Link>
              )}
              {/* Dark Mode Toggle - At the end */}
              <ThemeToggle />
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg p-2 transition-all duration-200"
              aria-label="Toggle menu"
            >
              <svg 
                className={`h-6 w-6 transition-all duration-300 ${isMenuOpen ? 'rotate-90 opacity-0' : 'opacity-100'}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                className={`h-6 w-6 absolute transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="pb-4 pt-2 space-y-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-emerald-100/50 dark:border-slate-700/50 p-4">
            <Link 
              href="/" 
              className="block py-3 px-4 text-emerald-800 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium hover:translate-x-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/plants" 
              className="block py-3 px-4 text-emerald-800 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium hover:translate-x-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <Link 
              href="/about" 
              className="block py-3 px-4 text-emerald-800 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium hover:translate-x-1"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="block py-3 px-4 text-emerald-800 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium hover:translate-x-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              href="/faq" 
              className="block py-3 px-4 text-emerald-800 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium hover:translate-x-1"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="pt-2 border-t border-emerald-100 dark:border-slate-700 mt-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 text-emerald-800 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium" onClick={() => setIsMenuOpen(false)}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
                  </Link>
                  <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium" onClick={() => setIsMenuOpen(false)}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    My Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium" onClick={() => setIsMenuOpen(false)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Dashboard
                    </Link>
                  )}
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-slate-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    {user?.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-emerald-800 dark:text-emerald-300 font-medium text-sm">
                      {user?.name}
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-emerald-800 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" variant="outline" className="w-full rounded-full">
                    Login
                  </Button>
                </Link>
              )}
              {/* Dark Mode Toggle - At the end */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-emerald-100 dark:border-slate-700 mt-2 pt-2">
                <span className="text-emerald-800 dark:text-emerald-300 font-medium text-sm">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
