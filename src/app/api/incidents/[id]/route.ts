import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const incident = await prisma.incident.findUnique({
      where: { id: params.id },
      include: {
        photos: true,
        events: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    // Role check:
    // Tenants can only see their own incidents (PRD US3: "A tenant cannot open another tenant's incident (404)")
    if (user.role === "tenant" && incident.tenantId !== user.id) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    // Managers/Organizers can only see incidents for their building
    if (
      (user.role === "manager" || user.role === "organizer") &&
      incident.buildingId !== user.buildingId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ incident });
  } catch (error) {
    console.error("Failed to fetch incident:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
