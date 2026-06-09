import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // In our schema, "shipments" are actually Orders with a carrier assigned
    const shipments = await prisma.order.findMany({
      where: {
        carrierId: { not: null }
      },
      include: {
        carrier: true,
      },
      orderBy: { updatedAt: "desc" }
    });
    
    return NextResponse.json(Array.isArray(shipments) ? shipments : []);
  } catch (error) {
    console.error("GET /api/shipping error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, carrierId, trackingNumber, notes } = body;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update the order with shipping information
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        carrierId,
        trackingNumber,
        status: "SHIPPED",
        history: {
          create: {
            status: "SHIPPED",
            notes: `Carrier assigned: ${carrierId}. Tracking: ${trackingNumber || "None"}. ${notes || ""}`,
          }
        }
      },
      include: {
        carrier: true
      }
    });

    return NextResponse.json(updatedOrder, { status: 201 });
  } catch (error) {
    console.error("POST /api/shipping error:", error);
    return NextResponse.json({ error: "Failed to assign carrier" }, { status: 500 });
  }
}
