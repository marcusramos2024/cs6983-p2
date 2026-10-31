import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemList } from '@/components/items/ItemList';

describe('ItemList', () => {
  it('renders loading state when isLoading is true', () => {
    render(<ItemList items={[]} isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading items/i)).toBeInTheDocument();
  });

  it('renders empty state with call to action link when items is empty', () => {
    render(<ItemList items={[]} isLoading={false} />);
    expect(screen.getByText(/no items found yet/i)).toBeInTheDocument();
    const ctaLink = screen.getByRole('link', { name: /add your first item/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/items/new');
  });

  it('renders error state with retry button when error is provided', () => {
    const handleRetry = vi.fn();
    render(
      <ItemList
        items={[]}
        error="Server connection failed"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/server connection failed/i)).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it('renders list of items with name, quantity, and notes', () => {
    const mockItems = [
      {
        id: '1',
        name: 'Mechanical Keyboard',
        quantity: 2,
        notes: 'Blue switches',
        createdAt: '2026-10-31T18:00:00.000Z',
      },
      {
        id: '2',
        name: 'Desk Pad',
        quantity: 1,
        createdAt: '2026-10-31T17:00:00.000Z',
      },
    ];

    render(<ItemList items={mockItems} />);

    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Blue switches')).toBeInTheDocument();
    expect(screen.getByText('Qty: 2')).toBeInTheDocument();

    expect(screen.getByText('Desk Pad')).toBeInTheDocument();
    expect(screen.getByText('Qty: 1')).toBeInTheDocument();
  });
});
