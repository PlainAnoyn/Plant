'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface WishlistItem {
  plantId: string;
  addedAt: string;
  plant?: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
    stock: number;
  };
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  isLoading: boolean;
  isInWishlist: (plantId: string) => boolean;
  addToWishlist: (plantId: string) => Promise<void>;
  removeFromWishlist: (plantId: string) => Promise<void>;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/wishlist');
      const data = await response.json();

      if (data.success) {
        setWishlist(data.wishlist.items || []);
      }
    } catch (error) {
      console.error('Fetch wishlist error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (plantId: string): boolean => {
    return wishlist.some((item) => item.plantId === plantId);
  };

  const addToWishlist = async (plantId: string) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to wishlist');
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plantId }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchWishlist();
      } else {
        throw new Error(data.error || 'Failed to add to wishlist');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const removeFromWishlist = async (plantId: string) => {
    if (!isAuthenticated) {
      throw new Error('Please login to remove items from wishlist');
    }

    try {
      const response = await fetch(`/api/wishlist?plantId=${plantId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchWishlist();
      } else {
        throw new Error(data.error || 'Failed to remove from wishlist');
      }
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}


