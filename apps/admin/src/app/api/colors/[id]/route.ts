import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, hexCode, active } = body;

    const color = await prisma.color.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(hexCode !== undefined && { hexCode }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.error("PUT /api/colors/[id] error:", error);
    return NextResponse.json({ error: "Failed to update color" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.color.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/colors/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete color" }, { status: 500 });
  }
}
