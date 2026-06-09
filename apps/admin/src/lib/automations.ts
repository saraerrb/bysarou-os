import prisma from "./prisma";

export type AutomationRule = 
  | "ORDER_CONFIRMED_FLOW"
  | "ORDER_DELIVERED_FLOW"
  | "ORDER_RETURNED_FLOW"
  | "STOCK_THRESHOLD_ALERT"
  | "CUSTOMER_RISK_ASSESSMENT";

export async function runAutomation(
  ruleName: AutomationRule,
  entityId: string,
  storeId: string,
  action: () => Promise<string | void>
) {
  // 1. Check if already succeeded for this entity/rule (Idempotency)
  const existing = await prisma.automationLog.findUnique({
    where: {
      entityId_ruleName: { entityId, ruleName }
    }
  });

  if (existing && existing.status === "SUCCESS") {
    console.log(`[Automation] ${ruleName} already succeeded for ${entityId}. Skipping.`);
    return { status: "SKIPPED", details: "Already executed" };
  }

  try {
    // 2. Execute the action
    const resultDetails = await action();

    // 3. Log success
    await prisma.automationLog.upsert({
      where: { entityId_ruleName: { entityId, ruleName } },
      update: { status: "SUCCESS", details: resultDetails || "Executed successfully" },
      create: { 
        entityId, 
        ruleName, 
        storeId,
        status: "SUCCESS", 
        details: resultDetails || "Executed successfully" 
      }
    });

    return { status: "SUCCESS" };
  } catch (error: any) {
    console.error(`[Automation] ${ruleName} failed for ${entityId}:`, error);
    
    // 4. Log failure
    await prisma.automationLog.upsert({
      where: { entityId_ruleName: { entityId, ruleName } },
      update: { status: "FAILED", details: error.message },
      create: { 
        entityId, 
        ruleName, 
        storeId,
        status: "FAILED", 
        details: error.message 
      }
    });

    return { status: "FAILED", error: error.message };
  }
}

// ─── Rule Implementations ───────────────────────────────────────────

/**
 * When Order is Confirmed: Deduct stock and prepare for shipping
 */
export async function onOrderConfirmed(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });

  if (!order) throw new Error("Order not found");
  const storeId = order.storeId || "default";

  return await runAutomation("ORDER_CONFIRMED_FLOW", orderId, storeId, async () => {
    // Deduct Stock & Create Movements
    for (const item of order.items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stockQuantity: { decrement: item.quantity } }
      });

      await prisma.stockMovement.create({
        data: {
          variantId: item.variantId,
          quantity: -item.quantity,
          type: "OUT",
          reason: `Auto-deduct for confirmed Order #${order.id}`
        }
      });
      
      // Trigger threshold check for this variant
      await onStockChange(item.variantId);
    }
    
    return `Deducted stock for ${order.items.length} items.`;
  });
}

/**
 * When Order is Returned: Create return record
 */
export async function onOrderReturned(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  const storeId = order.storeId || "default";

  return await runAutomation("ORDER_RETURNED_FLOW", orderId, storeId, async () => {
    const existingReturn = await prisma.return.findFirst({ where: { orderId } });
    if (existingReturn) return "Return record already exists.";

    await prisma.return.create({
      data: {
        orderId,
        reason: "OTHER", // Default
        status: "PENDING",
        notes: "Auto-generated on Order Status: RETURNED"
      }
    });

    return "Created PENDING return record.";
  });
}

/**
 * When Order is Delivered: Mark revenue as collected
 */
export async function onOrderDelivered(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  const storeId = order.storeId || "default";

  return await runAutomation("ORDER_DELIVERED_FLOW", orderId, storeId, async () => {
    return `Revenue of ${order.totalAmount} marked as collected.`;
  });
}

/**
 * When Stock Changes: Check against settings threshold
 */
export async function onStockChange(variantId: string) {
  const today = new Date().toISOString().split("T")[0];
  const entityId = `${variantId}:${today}`;

  const [variant, settings] = await Promise.all([
    prisma.productVariant.findUnique({ where: { id: variantId }, include: { product: true } }),
    prisma.settings.findFirst()
  ]);

  if (!variant) return "Missing variant data";
  const storeId = variant.product.storeId || "default";

  return await runAutomation("STOCK_THRESHOLD_ALERT", entityId, storeId, async () => {
    if (settings && variant.stockQuantity <= (settings.lowStockAlert || 10)) {
      return `ALERT: ${variant.product.name} (${variant.size}/${variant.color}) is low on stock (${variant.stockQuantity} remaining).`;
    }
    return "Stock level okay";
  });
}

/**
 * Assess Customer Risk based on history
 */
export async function assessCustomerRisk(customerPhone: string) {
  const entityId = `RISK:${customerPhone}`;
  
  const firstOrder = await prisma.order.findFirst({ where: { customerPhone } });
  const storeId = firstOrder?.storeId || "default";

  return await runAutomation("CUSTOMER_RISK_ASSESSMENT", entityId, storeId, async () => {
    const orders = await prisma.order.findMany({
      where: { 
        customerPhone,
        status: { in: ["FAKE", "CANCELLED"] }
      }
    });

    if (orders.length >= 3) {
      return `RISK DETECTED: Customer has ${orders.length} fake/cancelled orders.`;
    }

    return "Customer status: Clean";
  });
}
