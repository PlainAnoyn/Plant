'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [discountPercentage, setDiscountPercentage] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const CATEGORY_OPTIONS = ['Indoor','Outdoor','Succulent','Flowering','Herb','Tree','Shrub','Other'];
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sunlight, setSunlight] = useState('');
  const [water, setWater] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      try {
        // gate
        const me = await fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json());
        if (!me?.success) { router.push('/login?redirect=' + encodeURIComponent(`/admin/plants/${id}`)); return; }
        const isAdmin = me.user.role === 'admin' || me.user.email === 'admin@gmail.com' || me.user.username === 'admin';
        if (!isAdmin) { router.push('/'); return; }

        setLoading(true);
        const res = await fetch(`/api/admin/plants/${id}`, { credentials: 'include' });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load product');
        const p = data.plant || data.data;
        setName(p.name || '');
        setPrice(typeof p.price === 'number' ? p.price : '');
        setDiscountPercentage(typeof p.discountPercentage === 'number' ? p.discountPercentage : 0);
        setStock(typeof p.stock === 'number' ? p.stock : '');
        setCategory(p.category || '');
        setDescription(p.description || '');
        setImageUrl(p.imageUrl || '');
        setSunlight(p.sunlight || '');
        setWater(p.water || '');
        setIsFeatured(!!p.isFeatured);
        setIsFreeDelivery(!!p.isFreeDelivery);
      } catch (e: any) {
        setError(e?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, router]);

  const handleUploadImage = async (file: File) => {
    try {
      setImageUploading(true);
      setError('');
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !uploadPreset) throw new Error('Image upload is not configured');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Failed to upload image');
      setImageUrl(data.secure_url);
    } catch (e: any) {
      setError(e?.message || 'Image upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      if (!name.trim()) throw new Error('Name is required');
      if (price === '' || Number(price) <= 0) throw new Error('Price must be greater than 0');
      if (discountPercentage !== '' && (Number(discountPercentage) < 0 || Number(discountPercentage) > 100)) throw new Error('Discount must be between 0 and 100');
      if (stock === '' || Number(stock) < 0) throw new Error('Stock must be 0 or more');
      if (!imageUrl.trim()) throw new Error('Image is required');

      const res = await fetch(`/api/admin/plants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          discountPercentage: discountPercentage === '' ? 0 : Number(discountPercentage),
          stock: Number(stock),
          category: category.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim(),
          sunlight: sunlight || undefined,
          water: water || undefined,
          isFeatured,
          isFreeDelivery,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to update product');
      router.push('/admin?tab=plants');
    } catch (e: any) {
      setError(e?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 dark:border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-emerald-700 dark:text-emerald-400">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">Edit Product</h1>
          <p className="text-emerald-700 dark:text-emerald-400">Update product details</p>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">{error}</div>
        )}
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-xl shadow dark:shadow-slate-900/50 p-6 space-y-5 border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Price ($)</label>
              <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Discount (%)</label>
              <input type="number" step="1" min="0" max="100" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Stock</label>
              <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-slate-900 dark:text-slate-100">
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 min-h-[120px] bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Image URL</label>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Or Upload Image</label>
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadImage(f); }} className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
              {imageUploading && <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-2">Uploading image...</p>}
              {imageUrl && (
                <div className="mt-2">
                  <img src={imageUrl} alt="Preview" className="h-28 w-28 object-cover rounded-lg border border-emerald-200 dark:border-slate-700" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Sunlight</label>
              <select value={sunlight} onChange={(e) => setSunlight(e.target.value)} className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-slate-900 dark:text-slate-100">
                <option value="">Select</option>
                <option value="Full Sun">Full Sun</option>
                <option value="Partial Sun">Partial Sun</option>
                <option value="Shade">Shade</option>
                <option value="Indirect Light">Indirect Light</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Water</label>
              <select value={water} onChange={(e) => setWater(e.target.value)} className="w-full px-3 py-2 border border-emerald-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-slate-900 dark:text-slate-100">
                <option value="">Select</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Low">Low</option>
              </select>
            </div>
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

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => router.push('/admin?tab=plants')} className="px-5 py-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-lg font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-900/50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


