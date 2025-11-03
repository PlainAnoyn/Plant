'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import PlantCard from '@/components/PlantCard';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { wishlist, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.push('/login?redirect=/wishlist');
    }
  }, [mounted, authLoading, isAuthenticated, router]);

  const handleRemove = async (plantId: string) => {
    setRemovingId(plantId);
    try {
      await removeFromWishlist(plantId);
    } catch (error: any) {
      console.error('Remove from wishlist error:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (plant: any) => {
    addToCart({
      _id: plant._id,
      name: plant.name,
      price: plant.price,
      imageUrl: plant.imageUrl,
    });
  };

  if (!mounted || authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
          <p className="mt-4 text-emerald-700">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">My Wishlist</h1>
          <p className="text-emerald-700">Your saved plants</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Your Wishlist is Empty</h2>
            <p className="text-emerald-700 mb-6">Start adding plants you love to your wishlist!</p>
            <Link href="/plants">
              <Button variant="primary" size="lg">
                Browse Plants
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              if (!item.plant) return null;
              
              return (
                <div key={item.plantId} className="relative">
                  <PlantCard plant={item.plant} />
                  <button
                    onClick={() => handleRemove(item.plantId)}
                    disabled={removingId === item.plantId}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg z-30 hover:scale-110 transition-transform duration-200 disabled:opacity-50 text-red-500"
                    title="Remove from wishlist"
                  >
                    {removingId === item.plantId ? (
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


