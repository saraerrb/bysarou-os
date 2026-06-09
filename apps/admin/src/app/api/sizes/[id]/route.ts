import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, displayOrder, active } = body;

    const size = await prisma.size.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.error("PUT /api/sizes/[id] error:", error);
    return NextResponse.json({ error: "Failed to update size" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.size.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sizes/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete size" }, { status: 500 });
  }
}
