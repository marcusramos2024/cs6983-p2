'use client';

import React, { useState } from 'react';
import { Item } from '@/lib/validation/item-schema';

interface ItemFormProps {
  onCreated?: (item: Item) => void;
}

interface FormErrors {
  name?: string;
  quantity?: string;
  notes?: string;
  general?: string;
}

export function ItemForm({ onCreated }: ItemFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      nextErrors.name = 'Name is required';
    } else if (trimmedName.length > 80) {
      nextErrors.name = 'Name must be 80 characters or fewer';
    }

    const numQuantity = Number(quantity);
    if (!quantity || isNaN(numQuantity) || numQuantity < 1) {
      nextErrors.quantity = 'Quantity must be at least 1';
    } else if (!Number.isInteger(numQuantity)) {
      nextErrors.quantity = 'Quantity must be a whole number';
    }

    if (notes && notes.length > 500) {
      nextErrors.notes = 'Notes must be 500 characters or fewer';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          quantity: Number(quantity),
          notes: notes.trim() ? notes.trim() : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors({
          general:
            result?.error?.message ??
            'Failed to create item. Please check your inputs.',
        });
        return;
      }

      setName('');
      setQuantity('1');
      setNotes('');
      setErrors({});

      if (onCreated && result.data) {
        onCreated(result.data);
      }
    } catch {
      setErrors({
        general: 'A network error occurred while submitting. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-surface rounded-md border border-gray-200 p-6 shadow-sm space-y-4 max-w-lg w-full"
    >
      <h2 className="text-xl font-semibold text-text">Add New Item</h2>

      {errors.general && (
        <div
          role="alert"
          className="p-3 text-sm rounded bg-red-50 text-danger border border-red-200"
        >
          {errors.general}
        </div>
      )}

      {/* Item Name */}
      <div>
        <label
          htmlFor="item-name"
          className="block text-sm font-medium text-text mb-1"
        >
          Item Name
        </label>
        <input
          id="item-name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
          placeholder="e.g. Mechanical Keyboard"
          className={`w-full px-3 py-2 border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.name ? 'border-danger ring-1 ring-danger' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p
            id="name-error"
            role="alert"
            className="text-danger text-sm mt-1"
          >
            {errors.name}
          </p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label
          htmlFor="item-quantity"
          className="block text-sm font-medium text-text mb-1"
        >
          Quantity
        </label>
        <input
          id="item-quantity"
          name="quantity"
          type="number"
          min={1}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          aria-invalid={Boolean(errors.quantity)}
          aria-describedby={errors.quantity ? 'quantity-error' : undefined}
          className={`w-full px-3 py-2 border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.quantity
              ? 'border-danger ring-1 ring-danger'
              : 'border-gray-300'
          }`}
        />
        {errors.quantity && (
          <p
            id="quantity-error"
            role="alert"
            className="text-danger text-sm mt-1"
          >
            {errors.quantity}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="item-notes"
          className="block text-sm font-medium text-text mb-1"
        >
          Notes (optional)
        </label>
        <textarea
          id="item-notes"
          name="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={errors.notes ? 'notes-error' : undefined}
          placeholder="Add any additional details (up to 500 characters)"
          className={`w-full px-3 py-2 border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.notes
              ? 'border-danger ring-1 ring-danger'
              : 'border-gray-300'
          }`}
        />
        {errors.notes && (
          <p
            id="notes-error"
            role="alert"
            className="text-danger text-sm mt-1"
          >
            {errors.notes}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 bg-primary text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
      >
        {isSubmitting ? 'Creating Item...' : 'Create Item'}
      </button>
    </form>
  );
}
