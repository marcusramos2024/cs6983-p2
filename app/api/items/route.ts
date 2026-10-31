import { NextResponse } from 'next/server';
import { itemCreateSchema } from '@/lib/validation/item-schema';
import { createItem, getItems } from '@/lib/services/item-service';

export async function GET() {
  const items = getItems();
  return NextResponse.json({ data: items }, { status: 200 });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_JSON',
          message: 'Malformed JSON payload in request body.',
        },
      },
      { status: 400 }
    );
  }

  const parseResult = itemCreateSchema.safeParse(body);

  if (!parseResult.success) {
    const firstErrorMessage =
      parseResult.error.issues[0]?.message ?? 'Invalid item data provided.';
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: firstErrorMessage,
          details: parseResult.error.issues,
        },
      },
      { status: 400 }
    );
  }

  const newItem = createItem(parseResult.data);
  return NextResponse.json({ data: newItem }, { status: 201 });
}
