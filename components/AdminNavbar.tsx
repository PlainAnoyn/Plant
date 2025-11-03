'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center space-x-3 group">
              <span className="text-2xl font-bold group-hover:text-emerald-300 transition-colors">
                🌱 Admin
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                isActive('/admin')
                  ? 'bg-emerald-800 text-white'
                  : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
              }`}
            >
              Overview
            </Link>
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                pathname?.includes('/admin/orders') || pathname?.includes('/admin')
                  ? 'bg-emerald-800 text-white'
                  : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
              }`}
            >
              Orders
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-emerald-100 hover:bg-emerald-800 hover:text-white rounded-lg transition-all duration-200 font-medium"
            >
              View Store
            </Link>
            <div className="ml-6 flex items-center gap-3 border-l border-emerald-700 pl-6">
              {isAuthenticated && user && (
                <>
                  <div className="flex items-center gap-2">
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-emerald-100 font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-emerald-100 hover:bg-emerald-800 rounded-lg transition-all duration-200"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pb-4 pt-2 space-y-1">
            <Link
              href="/admin"
              className={`block py-3 px-4 rounded-lg transition-all duration-200 font-medium ${
                isActive('/admin')
                  ? 'bg-emerald-800 text-white'
                  : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Overview
            </Link>
            <Link
              href="/admin"
              className="block py-3 px-4 text-emerald-100 hover:bg-emerald-800 hover:text-white rounded-lg transition-all duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Orders
            </Link>
            <Link
              href="/"
              className="block py-3 px-4 text-emerald-100 hover:bg-emerald-800 hover:text-white rounded-lg transition-all duration-200 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              View Store
            </Link>
            {isAuthenticated && user && (
              <div className="pt-4 border-t border-emerald-700 mt-2">
                <div className="flex items-center gap-2 px-4 py-2">
                  {user.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-emerald-100 font-medium">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 font-medium text-left"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

