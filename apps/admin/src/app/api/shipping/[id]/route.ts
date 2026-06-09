import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber, notes } = body;

    const currentOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(trackingNumber && { trackingNumber }),
        history: {
          create: {
            status: status || currentOrder.status,
            notes: `Shipping update: ${notes || "Status changed"}. Tracking: ${trackingNumber || "No change"}`,
            agentName: "System"
          }
        }
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("PUT /api/shipping/[id] error:", error);
    return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 });
  }
}
