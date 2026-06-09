import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalOrders,
      confirmedOrders,
      deliveredOrders,
      returnedOrders,
      cancelledOrders,
      orderItems,
      lowStockCount,
      topProducts,
      lowStockProducts,
      returnsData,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "CONFIRMED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "RETURNED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      // Fetch items for revenue/profit calculation
      prisma.orderItem.findMany({
        where: { order: { status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] } } },
        include: { variant: { include: { product: true } } }
      }),
      // Low stock count
      prisma.productVariant.count({ where: { stockQuantity: { lt: 5 } } }),
      // Best selling products
      prisma.orderItem.groupBy({
        by: ['variantId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      // Low stock product details
      prisma.productVariant.findMany({
        where: { stockQuantity: { lt: 5 } },
        include: { product: true },
        take: 5
      }),
      // Return analytics
      prisma.return.findMany({
        include: { order: { include: { items: { include: { variant: { include: { product: true } } } } } } }
      })
    ]);

    // 1. Revenue & Profit Calculation
    let totalRevenue = 0;
    let totalCost = 0;

    orderItems.forEach(item => {
      totalRevenue += item.price * item.quantity;
      totalCost += item.variant.product.costPrice * item.quantity;
    });

    const estimatedProfit = totalRevenue - totalCost;

    // 2. Best-Sellers Logic
    const topVariants = await prisma.productVariant.findMany({
      where: { id: { in: topProducts.map(tp => tp.variantId) } },
      include: { product: true }
    });

    const bestSellingColors: Record<string, number> = {};
    const bestSellingSizes: Record<string, number> = {};
    const bestSellingProducts: Record<string, { name: string, quantity: number }> = {};

    topProducts.forEach(tp => {
      const variant = topVariants.find(v => v.id === tp.variantId);
      if (variant && tp._sum.quantity) {
        const qty = tp._sum.quantity;
        const colorKey = variant.color || "N/A";
        const sizeKey = variant.size || "N/A";
        bestSellingColors[colorKey] = (bestSellingColors[colorKey] || 0) + qty;
        bestSellingSizes[sizeKey] = (bestSellingSizes[sizeKey] || 0) + qty;
        const prodName = variant.product.name;
        if (!bestSellingProducts[prodName]) {
          bestSellingProducts[prodName] = { name: prodName, quantity: 0 };
        }
        bestSellingProducts[prodName].quantity += qty;
      }
    });

    // 3. Return Analytics
    const returnRate = totalOrders > 0 ? (returnedOrders / totalOrders) * 100 : 0;
    const returnReasons: Record<string, number> = {};
    const returnedProducts: Record<string, number> = {};

    returnsData.forEach(ret => {
      // Reasons
      returnReasons[ret.reason] = (returnReasons[ret.reason] || 0) + 1;
      
      // Product returns
      ret.order.items.forEach(item => {
        const prodName = item.variant.product.name;
        returnedProducts[prodName] = (returnedProducts[prodName] || 0) + item.quantity;
      });
    });

    return NextResponse.json({
      summary: {
        totalOrders,
        confirmedOrders,
        deliveredOrders,
        returnedOrders,
        cancelledOrders,
        totalRevenue,
        estimatedProfit,
        lowStockCount,
        returnRate: returnRate.toFixed(1) + "%",
      },
      insights: {
        bestSellers: {
          products: Object.values(bestSellingProducts).sort((a, b) => b.quantity - a.quantity).slice(0, 5),
          colors: Object.entries(bestSellingColors).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5),
          sizes: Object.entries(bestSellingSizes).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5),
        },
        returns: {
          reasons: Object.entries(returnReasons).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
          topReturnedProducts: Object.entries(returnedProducts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5),
        },
        lowStock: lowStockProducts.map(v => ({
          id: v.id,
          name: v.product.name,
          variant: `${v.color} / ${v.size}`,
          stock: v.stockQuantity
        }))
      }
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
