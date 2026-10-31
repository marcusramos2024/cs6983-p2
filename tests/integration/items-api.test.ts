import { describe, it, expect, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/items/route';
import { resetItems } from '@/lib/services/item-service';

describe('API Route /api/items', () => {
  beforeEach(() => {
    resetItems();
  });

  describe('POST /api/items', () => {
    it('creates an item and returns 201 with { data: item }', async () => {
      const request = new Request('http://localhost:3000/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Mechanical Keyboard',
          quantity: 2,
          notes: 'Cherry MX Blue switches',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(json.data.name).toBe('Mechanical Keyboard');
      expect(json.data.quantity).toBe(2);
      expect(json.data.notes).toBe('Cherry MX Blue switches');
      expect(json.data.id).toBeDefined();
      expect(json.data.createdAt).toBeDefined();
    });

    it('rejects an empty name with status 400 and an error message', async () => {
      const request = new Request('http://localhost:3000/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '',
          quantity: 1,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(json.error.message).toBeTruthy();
    });

    it('rejects name exceeding 80 characters with status 400', async () => {
      const request = new Request('http://localhost:3000/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'x'.repeat(81),
          quantity: 1,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects quantity below 1 with status 400', async () => {
      const request = new Request('http://localhost:3000/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Monitor',
          quantity: 0,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects notes exceeding 500 characters with status 400', async () => {
      const request = new Request('http://localhost:3000/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Desk',
          quantity: 1,
          notes: 'x'.repeat(501),
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects malformed JSON payload with status 400', async () => {
      const request = new Request('http://localhost:3000/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBeDefined();
    });
  });

  describe('GET /api/items', () => {
    it('returns empty list initially with 200 and { data: [] }', async () => {
      const response = await GET();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.data).toEqual([]);
    });

    it('returns items in newest-first order', async () => {
      await POST(
        new Request('http://localhost:3000/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'First Item', quantity: 1 }),
        })
      );

      await POST(
        new Request('http://localhost:3000/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Second Item', quantity: 2 }),
        })
      );

      const response = await GET();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.data).toHaveLength(2);
      expect(json.data[0].name).toBe('Second Item');
      expect(json.data[1].name).toBe('First Item');
    });
  });
});
