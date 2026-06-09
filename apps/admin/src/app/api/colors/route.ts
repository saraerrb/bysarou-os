import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId"); // Optional filtering
    
    const colors = await prisma.color.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
      },
      orderBy: {
        name: "asc",
      },
    });
    
    return NextResponse.json(colors);
  } catch (error) {
    console.error("GET /api/colors error:", error);
    return NextResponse.json({ error: "Failed to fetch colors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, hexCode, active, storeId } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const color = await prisma.color.create({
      data: {
        name,
        hexCode: hexCode || "#000000",
        active: active !== undefined ? active : true,
        storeId,
      },
    });

    return NextResponse.json(color, { status: 201 });
  } catch (error) {
    console.error("POST /api/colors error:", error);
    return NextResponse.json({ error: "Failed to create color" }, { status: 500 });
  }
}
