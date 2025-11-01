'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface PlantCardProps {
  plant: {
    _id: string;
    name: string;
    price: number;
    category: string;
    imageUrl: string;
    stock: number;
  };
}

export default function PlantCard({ plant }: PlantCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link href={`/plants/${plant._id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
        <div className="relative h-64 w-full overflow-hidden bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
          <Image
            src={plant.imageUrl}
            alt={plant.name}
            fill
            className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={() => setImageLoaded(true)}
          />
          {plant.stock === 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Out of Stock
            </div>
          )}
          {plant.stock > 0 && plant.stock < 5 && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Low Stock
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2">
              {plant.name}
            </h3>
            <span className="text-xs bg-primary-100 text-primary-800 px-2.5 py-1 rounded-full font-medium whitespace-nowrap ml-2">
              {plant.category}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary-600">${plant.price.toFixed(2)}</p>
              {plant.stock > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {plant.stock} {plant.stock === 1 ? 'available' : 'available'}
                </p>
              )}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-primary-600 font-semibold text-sm">View →</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
