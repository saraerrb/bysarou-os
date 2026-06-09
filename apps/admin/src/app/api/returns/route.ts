import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const returns = await prisma.return.findMany({
      include: {
        order: {
          include: {
            items: {
              include: {
                variant: {
                  include: { product: true }
                }
              }
            }
          }
        }
      },
      orderBy: { returnDate: "desc" }
    });
    return NextResponse.json(Array.isArray(returns) ? returns : []);
  } catch (error) {
    console.error("GET /api/returns error:", error);
    return NextResponse.json([], { status: 200 }); // Return empty array even on error for UI stability
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, reason, notes } = body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { returns: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.returns && order.returns.length > 0) {
      return NextResponse.json({ error: "Return already exists for this order" }, { status: 400 });
    }

    // Create return and update order status in transaction
    const returnRecord = await prisma.$transaction(async (tx) => {
      const ret = await tx.return.create({
        data: {
          orderId,
          reason,
          notes,
          status: "PENDING",
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "RETURNED",
          history: {
            create: {
              status: "RETURNED",
              notes: `Return registered. Reason: ${reason}. Notes: ${notes || "None"}`,
              agentName: "System"
            }
          }
        }
      });

      return ret;
    });

    return NextResponse.json(returnRecord, { status: 201 });
  } catch (error) {
    console.error("POST /api/returns error:", error);
    return NextResponse.json({ error: "Failed to create return" }, { status: 500 });
  }
}
