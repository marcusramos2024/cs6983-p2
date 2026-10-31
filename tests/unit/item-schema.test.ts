import { describe, it, expect } from 'vitest';
import { itemCreateSchema } from '@/lib/validation/item-schema';

describe('itemCreateSchema', () => {
  it('validates a valid item with name and quantity', () => {
    const input = { name: 'Apples', quantity: 3, notes: 'Crisp Honeycrisp' };
    const result = itemCreateSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Apples');
      expect(result.data.quantity).toBe(3);
      expect(result.data.notes).toBe('Crisp Honeycrisp');
    }
  });

  it('defaults quantity to 1 when omitted', () => {
    const input = { name: 'Bananas' };
    const result = itemCreateSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(1);
    }
  });

  it('accepts optional notes or omitted notes', () => {
    const inputWithoutNotes = { name: 'Milk', quantity: 2 };
    const result = itemCreateSchema.safeParse(inputWithoutNotes);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it('rejects empty name', () => {
    const result = itemCreateSchema.safeParse({ name: '', quantity: 1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('name'));
      expect(issue).toBeDefined();
      expect(issue?.message).toMatch(/name is required/i);
    }
  });

  it('rejects whitespace-only name', () => {
    const result = itemCreateSchema.safeParse({ name: '   ', quantity: 1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('name'));
      expect(issue).toBeDefined();
    }
  });

  it('rejects name exceeding 80 characters', () => {
    const longName = 'a'.repeat(81);
    const result = itemCreateSchema.safeParse({ name: longName, quantity: 1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('name'));
      expect(issue).toBeDefined();
      expect(issue?.message).toMatch(/80 characters/i);
    }
  });

  it('rejects quantity less than 1', () => {
    const resultZero = itemCreateSchema.safeParse({ name: 'Oranges', quantity: 0 });
    expect(resultZero.success).toBe(false);
    if (!resultZero.success) {
      const issue = resultZero.error.issues.find((i) => i.path.includes('quantity'));
      expect(issue).toBeDefined();
      expect(issue?.message).toMatch(/at least 1/i);
    }

    const resultNegative = itemCreateSchema.safeParse({ name: 'Oranges', quantity: -5 });
    expect(resultNegative.success).toBe(false);
  });

  it('rejects non-integer quantity', () => {
    const result = itemCreateSchema.safeParse({ name: 'Flour', quantity: 2.5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('quantity'));
      expect(issue).toBeDefined();
    }
  });

  it('rejects notes exceeding 500 characters', () => {
    const longNotes = 'x'.repeat(501);
    const result = itemCreateSchema.safeParse({ name: 'Item', quantity: 1, notes: longNotes });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('notes'));
      expect(issue).toBeDefined();
      expect(issue?.message).toMatch(/500 characters/i);
    }
  });
});
