'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Item } from '@/lib/validation/item-schema';
import { ItemList } from '@/components/items/ItemList';

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Failed to load items');
      }
      const result = await response.json();
      setItems(result.data ?? []);
    } catch {
      setError('Unable to load items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Item List</h1>
          <p className="text-sm text-muted mt-1">
            Browse and manage your current inventory.
          </p>
        </div>
        <div>
          <Link
            href="/items/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-blue-700 transition"
          >
            Add New Item
          </Link>
        </div>
      </div>

      <ItemList
        items={items}
        isLoading={isLoading}
        error={error}
        onRetry={fetchItems}
      />
    </div>
  );
}
