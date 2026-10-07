import { Suspense } from 'react';
import ProductsContent from '@/components/products/ProductsContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Products',
  description:
    'Browse original Nike, Adidas, Vans and LV sneakers, shirts, shackets and accessories at SperoLife. Cash on delivery all over Bangladesh.',
  alternates: { canonical: '/products' },
};

function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-96"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}