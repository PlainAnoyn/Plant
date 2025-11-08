'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAddProductPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [discountPercentage, setDiscountPercentage] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const CATEGORY_OPTIONS = [
    'Indoor',
    'Outdoor',
    'Succulents',
    'Cacti',
    'Herbs',
    'Flowering',
    'Air Purifying',
    'Bonsai',
  ];
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Basic admin gate: verify current user is admin
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();
        if (!data?.success || !data?.user) {
          router.push('/login?redirect=/admin/plants/new');
          return;
        }
        const isAdmin = data.user.role === 'admin' || data.user.email === 'admin@gmail.com' || data.user.username === 'admin';
        if (!isAdmin) {
          router.push('/');
        }
      } catch {
        router.push('/login?redirect=/admin/plants/new');
      }
    };
    checkAdmin();
  }, [router]);

  const handleUploadImage = async (file: File) => {
    try {
      setImageUploading(true);
      setError('');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error('Image upload is not configured');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to upload image');
      }

      setImageUrl(data.secure_url);
    } catch (e: any) {
      setError(e?.message || 'Image upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');

    try {
      // Basic validation
      if (!name.trim()) throw new Error('Name is required');
      if (price === '' || Number(price) <= 0) throw new Error('Price must be greater than 0');
      if (stock === '' || Number(stock) < 0) throw new Error('Stock must be 0 or more');
      if (!imageUrl.trim()) throw new Error('Image is required');
      if (discountPercentage !== '' && (Number(discountPercentage) < 0 || Number(discountPercentage) > 100)) {
        throw new Error('Discount must be between 0 and 100');
      }

      const res = await fetch('/api/admin/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          discountPercentage: discountPercentage === '' ? 0 : Number(discountPercentage),
          stock: Number(stock),
          category: category.trim() || undefined,
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim(),
          isFeatured,
          isFreeDelivery,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create product');
      }

      router.push('/admin?tab=plants');
    } catch (e: any) {
      setError(e?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">Add Product</h1>
          <p className="text-emerald-700 dark:text-emerald-400">Create a new product for your store</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow dark:shadow-slate-900/50 p-6 space-y-5 border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="e.g. Monstera Deliciosa"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Discount (%)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="0-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Stock</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-slate-900 dark:text-slate-100"
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 min-h-[120px] bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Brief description of the plant..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 border border-emerald-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <span className="text-emerald-900 dark:text-emerald-300 font-medium">Featured Product</span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-emerald-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
              <input type="checkbox" checked={isFreeDelivery} onChange={(e) => setIsFreeDelivery(e.target.checked)} />
              <span className="text-emerald-900 dark:text-emerald-300 font-medium">Show in Free Delivery</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Or Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadImage(file);
                }}
                className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              {imageUploading && (
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-2">Uploading image...</p>
              )}
              {imageUrl && (
                <div className="mt-2">
                  <img src={imageUrl} alt="Preview" className="h-28 w-28 object-cover rounded-lg border border-emerald-200 dark:border-slate-700" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin?tab=plants')}
              className="px-5 py-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-lg font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


