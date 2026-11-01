import { NextRequest, NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import { createIncidentSchema } from "@/lib/validation/incident-schema";
import { createIncident } from "@/lib/services/incident-service";

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("TENANT");

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid JSON in request body",
          },
        },
        { status: 400 }
      );
    }

    const parsed = createIncidentSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Validation failed";
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: firstIssue,
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const incident = await createIncident(parsed.data, user);

    return NextResponse.json(
      {
        data: incident,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      const code = err.statusCode === 401 ? "UNAUTHORIZED" : "FORBIDDEN";
      return NextResponse.json(
        {
          error: {
            code,
            message: err.message,
          },
        },
        { status: err.statusCode }
      );
    }

    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message,
        },
      },
      { status: 500 }
    );
  }
}
