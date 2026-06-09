import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        carrier: true,
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      status, 
      customerName, 
      customerPhone, 
      city, 
      address, 
      notes, 
      shippingCost,
      agentName,
      statusNotes // Notes specifically for this status change
    } = body;

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { variant: true } } },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldStatus = currentOrder.status;
    const newStatus = status || oldStatus;
    
    // BUSINESS LOGIC: Status Transitions & Stock
    let stockUpdatePerformed = false;
    
    // (Manual stock deduction removed - now handled by Automation Engine)
    
    // 2. RETURN TRIGGER: Restore stock when moving to RETURNED (only if it was confirmed/out)
    if ((oldStatus === "CONFIRMED" || oldStatus === "SHIPPED" || oldStatus === "DELIVERED") && newStatus === "RETURNED") {
      await prisma.$transaction(async (tx) => {
        for (const item of currentOrder.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { increment: item.quantity } },
          });
          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: "RETURN",
              quantity: item.quantity,
              reason: `Order Returned: ${currentOrder.id}`,
            },
          });
        }
      });
      
      // Reset automation logs to allow re-confirmation logic if order is resurrected
      await prisma.automationLog.deleteMany({
        where: { entityId: id, ruleName: "ORDER_CONFIRMED_FLOW" }
      });
    }

    // 3. Increment attempts for call statuses
    const callStatuses = ["NO_ANSWER", "CALL_LATER", "WRONG_NUMBER"];
    const isCallAttempt = callStatuses.includes(newStatus) && newStatus !== oldStatus;

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
        ...(customerName && { customerName }),
        ...(customerPhone && { customerPhone }),
        ...(city && { customerCity: city }),
        ...(address && { customerAddress: address }),
        ...(notes !== undefined && { notes }),
        ...(shippingCost !== undefined && { shippingCost: parseFloat(shippingCost) }),
        ...(isCallAttempt && {
          callAttempts: { increment: 1 },
        }),
        // Log history if status changed
        ...(newStatus !== oldStatus && {
          history: {
            create: {
              status: newStatus,
              notes: statusNotes || notes,
              agentName: agentName || "System",
            }
          }
        })
      },
      include: { items: true, history: true },
    });

    // ─── Trigger Automations ─────────────────────────────────────────
    try {
      const { 
        onOrderConfirmed, 
        onOrderReturned, 
        assessCustomerRisk,
        onOrderDelivered 
      } = await import("@/lib/automations");
      
      if (oldStatus !== "CONFIRMED" && newStatus === "CONFIRMED") {
        await onOrderConfirmed(id);
      } else if (newStatus === "RETURNED" && oldStatus !== "RETURNED") {
        await onOrderReturned(id);
      } else if (newStatus === "DELIVERED" && oldStatus !== "DELIVERED") {
        // Simple automation to log revenue collection
        const { runAutomation } = await import("@/lib/automations");
        const storeId = updatedOrder.storeId || "default";
        await runAutomation("ORDER_DELIVERED_FLOW", id, storeId, async () => {
          return `Revenue of ${updatedOrder.totalAmount} marked as collected.`;
        });
      }
      
      if (updatedOrder.customerPhone) {
        await assessCustomerRisk(updatedOrder.customerPhone);
      }
    } catch (autoErr) {
      console.error("Automation Trigger Error:", autoErr);
      // We don't fail the request if automation fails, but it will be logged in AutomationLogs
    }
    // ────────────────────────────────────────────────────────────────

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If order was confirmed/shipped/delivered, we restock on delete
    const outStatuses = ["CONFIRMED", "SHIPPED", "DELIVERED"];
    if (outStatuses.includes(order.status)) {
      const items = await prisma.orderItem.findMany({ where: { orderId: id } });
      await prisma.$transaction(async (tx) => {
        for (const item of items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { increment: item.quantity } },
          });
          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: "RETURN",
              quantity: item.quantity,
              reason: `Order Deleted: ${id}`,
            },
          });
        }
        await tx.order.delete({ where: { id } });
      });
    } else {
      await prisma.order.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
