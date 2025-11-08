'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PlantCard from '@/components/PlantCard';

interface Plant {
  _id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

interface ProductRecommendationsProps {
  plantId: string;
  category: string;
  limit?: number;
}

export default function ProductRecommendations({ plantId, category, limit = 4 }: ProductRecommendationsProps) {
  const [recommendedPlants, setRecommendedPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [plantId, category]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      // Fetch plants from the same category, excluding the current plant
      const params = new URLSearchParams({
        category: category,
        limit: limit.toString(),
        exclude: plantId,
      });

      const response = await fetch(`/api/plants/recommendations?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRecommendedPlants(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendedPlants.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-cream-50 dark:bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-300 mb-2">You May Also Like</h2>
          <p className="text-emerald-700 dark:text-emerald-400">Discover more plants from the same category</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedPlants.map((plant, index) => (
            <div
              key={plant._id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PlantCard plant={plant} />
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/plants">
            <button className="px-8 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors font-semibold text-lg">
              View All Plants
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}


