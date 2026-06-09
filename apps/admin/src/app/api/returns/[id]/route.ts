import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const returnRecord = await prisma.return.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: {
                variant: {
                  include: { product: true }
                }
              }
            },
            history: { orderBy: { createdAt: "desc" } }
          }
        }
      }
    });

    if (!returnRecord) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    return NextResponse.json(returnRecord);
  } catch (error) {
    console.error("GET /api/returns/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch return" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    const currentReturn = await prisma.return.findUnique({
      where: { id },
      include: { 
        order: { 
          include: { items: true } 
        } 
      }
    });

    if (!currentReturn) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    const oldStatus = currentReturn.status;
    const newStatus = status || oldStatus;

    // RESTOCKING LOGIC
    // Trigger restock if moving TO 'RESTOCKED' and was NOT 'RESTOCKED' before
    if (oldStatus !== "RESTOCKED" && newStatus === "RESTOCKED") {
      await prisma.$transaction(async (tx) => {
        for (const item of currentReturn.order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { increment: item.quantity } },
          });
          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: "RETURN",
              quantity: item.quantity,
              reason: `Restocked from Return: ${currentReturn.id}`,
            },
          });
        }
        
        await tx.order.update({
          where: { id: currentReturn.orderId },
          data: {
            history: {
              create: {
                status: "RETURNED",
                notes: `Items restocked in inventory. Return ID: ${currentReturn.id}`,
                agentName: "System"
              }
            }
          }
        });
      });
    }

    const updatedReturn = await prisma.return.update({
      where: { id },
      data: {
        status: newStatus,
        ...(notes !== undefined && { notes }),
      }
    });

    return NextResponse.json(updatedReturn);
  } catch (error) {
    console.error("PUT /api/returns/[id] error:", error);
    return NextResponse.json({ error: "Failed to update return" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.return.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/returns/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete return" }, { status: 500 });
  }
}
