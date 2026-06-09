import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const carriers = await prisma.carrier.findMany({
      orderBy: { name: "asc" }
    });
    // Ensure we always return an array
    return NextResponse.json(Array.isArray(carriers) ? carriers : []);
  } catch (error) {
    console.error("GET /api/carriers error:", error);
    // Return empty array on error to prevent UI crash
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    const carrier = await prisma.carrier.create({
      data: {
        name,
        contactPhone: phone,
      }
    });

    return NextResponse.json(carrier, { status: 201 });
  } catch (error) {
    console.error("POST /api/carriers error:", error);
    return NextResponse.json({ error: "Failed to create carrier" }, { status: 500 });
  }
}
