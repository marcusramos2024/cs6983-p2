import { Item, ItemCreateInput } from '@/lib/validation/item-schema';

// In-memory storage for items behind the service layer
let itemsStore: Item[] = [];

/**
 * Retrieve all items, sorted newest first so the most recent item is at the top.
 */
export function getItems(): Item[] {
  return [...itemsStore];
}

/**
 * Create a new item and store it in-memory.
 */
export function createItem(input: ItemCreateInput): Item {
  const newItem: Item = {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: input.name,
    quantity: input.quantity ?? 1,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };

  // Prepend so the newest item is at the top of the list
  itemsStore.unshift(newItem);
  return newItem;
}

/**
 * Reset items store for test isolation.
 */
export function resetItems(): void {
  itemsStore = [];
}
