'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ItemForm } from '@/components/items/ItemForm';

export default function NewItemPage() {
  const router = useRouter();

  const handleCreated = () => {
    router.push('/items');
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <Link
          href="/items"
          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          &larr; Back to item list
        </Link>
      </div>

      <div>
        <ItemForm onCreated={handleCreated} />
      </div>
    </div>
  );
}
