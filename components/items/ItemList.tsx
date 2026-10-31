'use client';

import React from 'react';
import Link from 'next/link';
import { Item } from '@/lib/validation/item-schema';

interface ItemListProps {
  items: Item[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function ItemList({
  items,
  isLoading = false,
  error = null,
  onRetry,
}: ItemListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 w-full max-w-2xl" role="status" aria-label="Loading items">
        <p className="text-muted text-sm">Loading items...</p>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 rounded-md"></div>
          <div className="h-16 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="p-4 rounded-md border border-red-200 bg-red-50 text-danger w-full max-w-2xl space-y-2"
      >
        <p className="font-medium">Failed to load items</p>
        <p className="text-sm">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1.5 bg-danger text-white text-sm rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center p-8 bg-surface rounded-md border border-dashed border-gray-300 w-full max-w-2xl space-y-3">
        <p className="text-muted text-base">No items found yet.</p>
        <Link
          href="/items/new"
          className="inline-block px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
        >
          Add your first item
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      <ul className="divide-y divide-gray-200 bg-surface rounded-md border border-gray-200 shadow-sm overflow-hidden">
        {items.map((item) => (
          <li key={item.id} className="p-4 sm:p-5 hover:bg-gray-50 transition">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-text break-words">
                  {item.name}
                </h3>
                {item.notes && (
                  <p className="text-sm text-muted break-words whitespace-pre-wrap">
                    {item.notes}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Added {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-primary">
                  Qty: {item.quantity}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
