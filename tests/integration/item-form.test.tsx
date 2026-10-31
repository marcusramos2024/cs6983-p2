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
    const user = userEvent.setup();

    render(<ItemForm onCreated={vi.fn()} />);

    const nameInput = screen.getByLabelText(/item name/i);
    const longName = 'x'.repeat(81);
    await user.type(nameInput, longName);

    const submitButton = screen.getByRole('button', { name: /create item|add item/i });
    await user.click(submitButton);

    const errorMessage = await screen.findByText(/80 characters/i);
    expect(errorMessage).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows inline error under quantity if quantity is less than 1', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const user = userEvent.setup();

    render(<ItemForm onCreated={vi.fn()} />);

    const nameInput = screen.getByLabelText(/item name/i);
    await user.type(nameInput, 'Notebook');

    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '0');

    const submitButton = screen.getByRole('button', { name: /create item|add item/i });
    await user.click(submitButton);

    const errorMessage = await screen.findByText(/at least 1/i);
    expect(errorMessage).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('disables the submit button while the request is in flight', async () => {
    let resolvePromise: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });

    vi.spyOn(global, 'fetch').mockImplementation(() => fetchPromise);

    const user = userEvent.setup();
    render(<ItemForm onCreated={vi.fn()} />);

    const nameInput = screen.getByLabelText(/item name/i);
    await user.type(nameInput, 'Headphones');

    const submitButton = screen.getByRole('button', { name: /create item|add item/i });
    await user.click(submitButton);

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

    const user = userEvent.setup();
    render(<ItemForm onCreated={onCreatedMock} />);

    await user.type(screen.getByLabelText(/item name/i), 'Wireless Mouse');
    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '2');
    await user.type(screen.getByLabelText(/notes/i), 'Ergonomic shape');

    await user.click(screen.getByRole('button', { name: /create item|add item/i }));

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
