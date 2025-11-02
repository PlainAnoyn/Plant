'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-emerald-100/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <span className="text-4xl font-bold text-emerald-700 group-hover:scale-110 transition-transform duration-300 block">🌱</span>
                <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-emerald-500 transition-all duration-300 tracking-tight">
                PlantShop
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className="px-4 py-2 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium relative group"
            >
              <span className="relative z-10">Home</span>
              <span className="absolute inset-0 bg-emerald-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-0"></span>
            </Link>
            <Link 
              href="/plants" 
              className="px-4 py-2 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium relative group"
            >
              <span className="relative z-10">Plants</span>
              <span className="absolute inset-0 bg-emerald-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-0"></span>
            </Link>
            <Link 
              href="/about" 
              className="px-4 py-2 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium relative group"
            >
              <span className="relative z-10">About</span>
              <span className="absolute inset-0 bg-emerald-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-0"></span>
            </Link>
            <Link 
              href="/contact" 
              className="px-4 py-2 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium relative group"
            >
              <span className="relative z-10">Contact</span>
              <span className="absolute inset-0 bg-emerald-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-0"></span>
            </Link>
            <Link 
              href="/faq" 
              className="px-4 py-2 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium relative group"
            >
              <span className="relative z-10">FAQ</span>
              <span className="absolute inset-0 bg-emerald-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 -z-0"></span>
            </Link>
            <div className="ml-6 flex items-center gap-3 border-l border-emerald-200 pl-6">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors">
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
                    <span className="text-emerald-800 text-sm font-medium hidden lg:block">
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
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-emerald-800 hover:bg-emerald-50 rounded-lg p-2 transition-all duration-200"
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
          <div className="pb-4 pt-2 space-y-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-emerald-100/50 p-4">
            <Link 
              href="/" 
              className="block py-3 px-4 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium hover:translate-x-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/plants" 
              className="block py-3 px-4 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium hover:translate-x-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Plants
            </Link>
            <Link 
              href="/about" 
              className="block py-3 px-4 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium hover:translate-x-1"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="block py-3 px-4 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium hover:translate-x-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              href="/faq" 
              className="block py-3 px-4 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium hover:translate-x-1"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="pt-2 border-t border-emerald-100 mt-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
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
                    <span className="text-emerald-800 font-medium text-sm">
                      {user?.name}
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-emerald-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium text-left"
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
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
