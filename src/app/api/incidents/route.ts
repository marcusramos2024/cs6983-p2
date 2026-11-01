import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateIncidentInput, IncidentInput } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as {
      id: string;
      role: string;
      buildingId: string;
      name?: string;
    };

    if (user.role !== "tenant") {
      return NextResponse.json(
        { error: "Forbidden: only tenants can create incidents" },
        { status: 403 }
      );
    }

    const body: IncidentInput = await req.json();

    const validation = validateIncidentInput(body);
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const reportedDate = new Date(body.reportedAt);

    // Save incident and timeline events
    const incident = await prisma.$transaction(async (tx) => {
      const newIncident = await tx.incident.create({
        data: {
          title: body.title.trim(),
          category: body.category,
          description: body.description?.trim() || null,
          reportedAt: reportedDate,
          reportedVia: body.reportedVia,
          status: "Open",
          tenantId: user.id,
          buildingId: user.buildingId,
          photos: body.photos && body.photos.length > 0
            ? {
                create: body.photos.map((p) => ({
                  url: p.url,
                  filename: p.filename,
                  size: p.size,
                  mimeType: p.mimeType,
                })),
              }
            : undefined,
          events: {
            create: [
              {
                type: "REPORTED",
                title: `Reported by ${body.reportedVia}`,
                content: body.description?.trim() || null,
                actorId: user.id,
              },
              ...(body.photos && body.photos.length > 0
                ? [
                    {
                      type: "PHOTOS_ADDED",
                      title: `Photos added (${body.photos.length})`,
                      actorId: user.id,
                    },
                  ]
                : []),
            ],
          },
        },
        include: {
          photos: true,
          events: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      return newIncident;
    });

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    console.error("Failed to create incident:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as {
      id: string;
      role: string;
      buildingId: string;
    };

    let whereClause: any = {};
    if (user.role === "tenant") {
      whereClause = { tenantId: user.id };
    } else if (user.role === "manager" || user.role === "organizer") {
      whereClause = { buildingId: user.buildingId };
    }

    const incidents = await prisma.incident.findMany({
      where: whereClause,
      include: {
        photos: true,
        events: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("Failed to fetch incidents:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

