import { z } from 'zod';

export const itemCreateSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, { message: 'Name is required' })
    .max(80, { message: 'Name must be 80 characters or fewer' }),
  quantity: z
    .number({
      invalid_type_error: 'Quantity must be a valid number',
    })
    .int({ message: 'Quantity must be a whole number' })
    .min(1, { message: 'Quantity must be at least 1' })
    .default(1),
  notes: z
    .string()
    .trim()
    .max(500, { message: 'Notes must be 500 characters or fewer' })
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
});

export type ItemCreateInput = z.infer<typeof itemCreateSchema>;

export interface Item {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  createdAt: string;
}
