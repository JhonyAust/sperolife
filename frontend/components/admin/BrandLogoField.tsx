'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Upload, RotateCcw, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import BrandLogo from '../products/BrandLogo';
import { getBrandKey, getLogoKey, UNBRANDED_KEY } from '@/lib/brands';

interface AdminBrand {
  name: string;
  key: string;
  logo: string | null;
  updatedAt: string;
}

interface BrandLogoFieldProps {
  brandName: string;
  onImageUpload: (file: File) => Promise<string>;
}

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

// Lets the admin upload the logo shown for a brand on the homepage brand tabs.
// Spellings of the same brand (e.g. "Louis Vuitton" / "LV") share one logo.
export default function BrandLogoField({ brandName, onImageUpload }: BrandLogoFieldProps) {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get('/admin/brands')
      .then(({ data }) => setBrands(data?.brands || []))
      .catch(() => setError('Could not load brand logos'));
  }, []);

  const name = brandName.trim();
  const brandKey = getBrandKey(name);
  const hasBrand = brandKey !== UNBRANDED_KEY;

  // All saved spellings of this brand that have a logo, newest first
  const matches = brands
    .filter((b) => b.logo && getBrandKey(b.name) === brandKey)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const uploadedLogo = hasBrand ? matches[0]?.logo || null : null;

  const saveBrand = async (brand: string, logo: string | null) => {
    const { data } = await api.put('/admin/brands', { name: brand, logo });
    setBrands((prev) => [...prev.filter((b) => b.key !== data.brand.key), data.brand]);
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, SVG, JPG or WebP).');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError('Logo must be smaller than 2 MB.');
      return;
    }
    setBusy(true);
    try {
      const url = await onImageUpload(file);
      await saveBrand(name, url);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleReset = async () => {
    setError('');
    setBusy(true);
    try {
      // Clear every saved spelling of this brand so the default logo shows again
      await Promise.all(matches.map((b) => saveBrand(b.name, null)));
    } catch {
      setError('Could not reset the logo. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-3">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 ring-1 ring-gray-200">
        {hasBrand ? (
          <BrandLogo
            key={uploadedLogo || brandKey}
            brandKey={getLogoKey(brandKey)}
            src={uploadedLogo}
            label={name}
            className="h-8 w-8 text-black"
            fallback={<ImageIcon className="h-5 w-5 text-gray-300" />}
          />
        ) : (
          <ImageIcon className="h-5 w-5 text-gray-300" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-gray-700">Brand logo</p>
        <p className="text-xs text-gray-500">
          {!hasBrand
            ? 'Enter a brand name to set its logo.'
            : uploadedLogo
              ? 'Your uploaded logo is shown on the homepage.'
              : 'Default logo is shown. Upload one to replace it.'}
        </p>
        {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        id="brand-logo-upload"
        type="file"
        accept="image/png,image/svg+xml,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="flex flex-shrink-0 flex-col gap-1.5 sm:flex-row">
        <button
          type="button"
          disabled={!hasBrand || busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploadedLogo ? 'Change' : 'Upload'}
        </button>
        {uploadedLogo && (
          <button
            type="button"
            disabled={busy}
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:border-gray-400 disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Use default
          </button>
        )}
      </div>
    </div>
  );
}
