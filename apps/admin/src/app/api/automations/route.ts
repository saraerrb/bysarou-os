import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.automationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return NextResponse.json(logs);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ruleName, entityId } = await request.json();
    const { 
      onOrderConfirmed, 
      onOrderReturned, 
      assessCustomerRisk,
      onStockChange 
    } = await import("@/lib/automations");

    // Clear log first to allow retry (since idempotency checks logs)
    await prisma.automationLog.deleteMany({
      where: { entityId, ruleName }
    });

    // Re-trigger
    if (ruleName === "ORDER_CONFIRMED_FLOW") await onOrderConfirmed(entityId);
    else if (ruleName === "ORDER_RETURNED_FLOW") await onOrderReturned(entityId);
    else if (ruleName === "CUSTOMER_RISK_ASSESSMENT") await assessCustomerRisk(entityId.replace("RISK:", ""));
    else if (ruleName === "STOCK_THRESHOLD_ALERT") await onStockChange(entityId.split(":")[0]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Retry failed" }, { status: 500 });
  }
}
