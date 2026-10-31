import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemForm } from '@/components/items/ItemForm';

describe('ItemForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders every input with a visible label', () => {
    render(<ItemForm onCreated={vi.fn()} />);

    const nameLabel = screen.getByLabelText(/item name/i);
    expect(nameLabel).toBeInTheDocument();
    expect(nameLabel).toHaveAttribute('id', 'item-name');

    const quantityLabel = screen.getByLabelText(/quantity/i);
    expect(quantityLabel).toBeInTheDocument();
    expect(quantityLabel).toHaveAttribute('id', 'item-quantity');

    const notesLabel = screen.getByLabelText(/notes/i);
    expect(notesLabel).toBeInTheDocument();
    expect(notesLabel).toHaveAttribute('id', 'item-notes');
  });

  it('shows inline error under name if submitted empty and does not call API', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const onCreatedMock = vi.fn();

    render(<ItemForm onCreated={onCreatedMock} />);

    const submitButton = screen.getByRole('button', { name: /create item|add item/i });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText(/name is required/i);
    expect(errorMessage).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onCreatedMock).not.toHaveBeenCalled();
  });

  it('shows inline error if name exceeds 80 characters', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    render(<ItemForm onCreated={vi.fn()} />);

    const nameInput = screen.getByLabelText(/item name/i);
    const longName = 'x'.repeat(81);
    fireEvent.change(nameInput, { target: { value: longName } });

    const submitButton = screen.getByRole('button', { name: /create item|add item/i });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText(/80 characters/i);
    expect(errorMessage).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows inline error if notes exceed 500 characters', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    render(<ItemForm onCreated={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/item name/i), {
      target: { value: 'Valid Item' },
    });
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: 'x'.repeat(501) },
    });

    fireEvent.click(screen.getByRole('button', { name: /create item|add item/i }));

    const errorMessage = await screen.findByText(/500 characters/i);
    expect(errorMessage).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('displays general server error message when API responds with an error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Server rejected the item name.',
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    );

    render(<ItemForm onCreated={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/item name/i), {
      target: { value: 'Forbidden Item' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create item|add item/i }));

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent('Server rejected the item name.');
  });

  it('displays network error message when fetch fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    render(<ItemForm onCreated={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/item name/i), {
      target: { value: 'Item A' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create item|add item/i }));

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent(/network error occurred/i);
  });

  it('disables the submit button while the request is in flight', async () => {
    let resolvePromise: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });

    vi.spyOn(global, 'fetch').mockImplementation(() => fetchPromise);

    render(<ItemForm onCreated={vi.fn()} />);

    const nameInput = screen.getByLabelText(/item name/i);
    fireEvent.change(nameInput, { target: { value: 'Headphones' } });

    const submitButton = screen.getByRole('button', { name: /create item|add item/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    // Complete the request
    resolvePromise!(
      new Response(
        JSON.stringify({
          data: {
            id: '1',
            name: 'Headphones',
            quantity: 1,
            createdAt: new Date().toISOString(),
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('submits valid data, posts to /api/items and triggers onCreated', async () => {
    const onCreatedMock = vi.fn();
    const createdItem = {
      id: 'item-123',
      name: 'Wireless Mouse',
      quantity: 2,
      notes: 'Ergonomic shape',
      createdAt: new Date().toISOString(),
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ data: createdItem }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(<ItemForm onCreated={onCreatedMock} />);

    fireEvent.change(screen.getByLabelText(/item name/i), {
      target: { value: 'Wireless Mouse' },
    });
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: 'Ergonomic shape' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create item|add item/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Wireless Mouse',
          quantity: 2,
          notes: 'Ergonomic shape',
        }),
      });
      expect(onCreatedMock).toHaveBeenCalledWith(createdItem);
    });
  });
});
