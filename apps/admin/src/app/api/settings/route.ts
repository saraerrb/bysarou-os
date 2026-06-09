import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { getActiveStoreId } = await import("@/lib/store-context");
    const storeId = await getActiveStoreId();

    if (!storeId) {
      return NextResponse.json({ error: "Store context missing" }, { status: 400 });
    }

    let settings = await prisma.settings.findUnique({
      where: { storeId }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { storeId }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { getActiveStoreId } = await import("@/lib/store-context");
    const storeId = await getActiveStoreId();

    if (!storeId) {
      return NextResponse.json({ error: "Store context missing" }, { status: 400 });
    }

    const body = await request.json();
    const { id, updatedAt, storeId: bodyStoreId, ...updatableFields } = body;

    const settings = await prisma.settings.update({
      where: { storeId },
      data: updatableFields
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
