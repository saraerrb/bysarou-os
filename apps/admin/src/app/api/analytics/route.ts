import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { subDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");
  const startDate = subDays(new Date(), days);
  const endDate = new Date();

  try {
    // 1. Fetch Orders in range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        },
      },
    });

    // 2. Sales by Date
    const salesByDate: Record<string, number> = {};
    orders.forEach(o => {
      const date = format(o.createdAt, "MMM dd");
      salesByDate[date] = (salesByDate[date] || 0) + o.totalAmount;
    });

    // 3. Sales by City
    const salesByCity: Record<string, number> = {};
    orders.forEach(o => {
      const city = (o as any).customerCity || "Unknown";
      salesByCity[city] = (salesByCity[city] || 0) + o.totalAmount;
    });

    // 4. Sales by Product
    const salesByProduct: Record<string, number> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const pName = item.variant?.product?.name || "Deleted Product";
        salesByProduct[pName] = (salesByProduct[pName] || 0) + (item.price * item.quantity);
      });
    });

    // 5. Success Rates
    const total = orders.length;
    const confirmed = orders.filter(o => o.status === "CONFIRMED" || o.status === "SHIPPED" || o.status === "DELIVERED").length;
    const delivered = orders.filter(o => o.status === "DELIVERED").length;
    const returned = orders.filter(o => o.status === "RETURNED").length;
    const fake = orders.filter(o => o.status === "FAKE").length;
    const shipped = orders.filter(o => ["SHIPPED", "DELIVERED", "RETURNED"].includes(o.status)).length;

    const rates = {
      confirmationRate: total > 0 ? (confirmed / total) * 100 : 0,
      deliverySuccessRate: shipped > 0 ? (delivered / shipped) * 100 : 0,
      returnRate: delivered > 0 ? (returned / delivered) * 100 : 0,
      fakeRate: total > 0 ? (fake / total) * 100 : 0,
    };

    // 6. Inventory & Dead Stock
    const allVariants = await prisma.productVariant.findMany({
      include: { product: true }
    });
    
    const soldVariantIds = new Set();
    orders.forEach(o => o.items.forEach(i => soldVariantIds.add(i.variantId)));

    const deadStock = allVariants
      .filter(v => !soldVariantIds.has(v.id))
      .map(v => ({
        name: `${v.product?.name || 'Unknown'} (${v.size || 'N/A'}/${v.color || 'N/A'})`,
        stock: v.stockQuantity,
        sku: v.sku
      }))
      .slice(0, 10);

    return NextResponse.json({
      timeline: Object.entries(salesByDate).map(([name, value]) => ({ name, value })),
      cities: Object.entries(salesByCity).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
      products: Object.entries(salesByProduct).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
      rates,
      deadStock,
      totals: {
        revenue: orders.filter(o => o.status !== "CANCELLED" && o.status !== "FAKE").reduce((acc, o) => acc + o.totalAmount, 0),
        orders: total,
      }
    });

  } catch (error: any) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ 
      error: "Failed to generate analytics",
      details: error.message,
      stack: error.stack,
      rates: { confirmationRate: 0, deliverySuccessRate: 0, returnRate: 0, fakeRate: 0 },
      timeline: [],
      cities: [],
      products: [],
      deadStock: []
    }, { status: 500 });
  }
}
