import { describe, it, expect, beforeEach } from 'vitest';
import {
  getItems,
  createItem,
  resetItems,
} from '@/lib/services/item-service';

describe('item-service', () => {
  beforeEach(() => {
    resetItems();
  });

  it('starts with an empty item list', () => {
    const items = getItems();
    expect(items).toEqual([]);
  });

  it('creates an item and returns it with id and createdAt', () => {
    const item = createItem({
      name: 'Notebook',
      quantity: 2,
      notes: 'Lined paper',
    });

    expect(item).toMatchObject({
      name: 'Notebook',
      quantity: 2,
      notes: 'Lined paper',
    });
    expect(item.id).toBeDefined();
    expect(typeof item.id).toBe('string');
    expect(item.createdAt).toBeDefined();
  });

  it('places the most recently created item at the top of the list', () => {
    const first = createItem({ name: 'First Item', quantity: 1 });
    const second = createItem({ name: 'Second Item', quantity: 5 });

    const items = getItems();
    expect(items).toHaveLength(2);
    expect(items[0].id).toBe(second.id);
    expect(items[0].name).toBe('Second Item');
    expect(items[1].id).toBe(first.id);
    expect(items[1].name).toBe('First Item');
  });

  it('resets in-memory items properly', () => {
    createItem({ name: 'Temp Item', quantity: 1 });
    expect(getItems()).toHaveLength(1);
    resetItems();
    expect(getItems()).toHaveLength(0);
  });
});
