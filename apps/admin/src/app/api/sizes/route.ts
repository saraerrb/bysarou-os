import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId"); // Optional filtering
    
    const sizes = await prisma.size.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
      },
      orderBy: {
        displayOrder: "asc",
      },
    });
    
    return NextResponse.json(sizes);
  } catch (error) {
    console.error("GET /api/sizes error:", error);
    return NextResponse.json({ error: "Failed to fetch sizes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, displayOrder, active, storeId } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const size = await prisma.size.create({
      data: {
        name,
        displayOrder: displayOrder || 0,
        active: active !== undefined ? active : true,
        storeId,
      },
    });

    return NextResponse.json(size, { status: 201 });
  } catch (error) {
    console.error("POST /api/sizes error:", error);
    return NextResponse.json({ error: "Failed to create size" }, { status: 500 });
  }
}
