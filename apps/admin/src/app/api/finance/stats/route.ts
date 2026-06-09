import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    const dateFilter: any = {};
    if (start) dateFilter.gte = startOfDay(new Date(start));
    if (end) dateFilter.lte = endOfDay(new Date(end));

    const [orders, expenses] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: dateFilter,
          status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] }
        },
        include: {
          items: {
            include: {
              variant: { include: { product: true } }
            }
          }
        }
      }),
      prisma.expense.findMany({
        where: { date: dateFilter }
      })
    ]);

    // Financial Metrics
    let totalRevenue = 0;
    let totalProductCost = 0;
    let totalShippingCost = 0;
    let totalCodFee = 0;
    let totalPackagingCost = 0;
    const totalAdsCost = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Groupings
    const profitByCity: Record<string, number> = {};
    const profitByProduct: Record<string, number> = {};
    const profitByStatus: Record<string, number> = {};

    orders.forEach(order => {
      let orderRevenue = order.totalAmount;
      let orderProductCost = order.items.reduce((sum, item) => sum + (item.variant.product.costPrice * item.quantity), 0);
      let orderShipping = order.shippingCost;
      let orderCodFee = (order as any).codFee || 0;
      let orderPackaging = (order as any).packagingCost || 0;
      
      let orderNetProfit = orderRevenue - orderProductCost - orderShipping - orderCodFee - orderPackaging;

      // Totals
      totalRevenue += orderRevenue;
      totalProductCost += orderProductCost;
      totalShippingCost += orderShipping;
      totalCodFee += orderCodFee;
      totalPackagingCost += orderPackaging;

      // Group by City
      profitByCity[order.customerCity] = (profitByCity[order.customerCity] || 0) + orderNetProfit;
      
      // Group by Status
      profitByStatus[order.status] = (profitByStatus[order.status] || 0) + orderNetProfit;

      // Group by Product
      order.items.forEach(item => {
        const prodName = item.variant.product.name;
        // Simplified product profit: (Selling - Cost) - Pro-rated shipping/fees if needed, 
        // but let's keep it simple: Selling - Cost per item.
        const itemProfit = (item.price - item.variant.product.costPrice) * item.quantity;
        profitByProduct[prodName] = (profitByProduct[prodName] || 0) + itemProfit;
      });
    });

    const totalCosts = totalProductCost + totalShippingCost + totalCodFee + totalPackagingCost + totalAdsCost;
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalProductCost,
        totalShippingCost,
        totalCodFee,
        totalPackagingCost,
        totalAdsCost,
        totalCosts,
        netProfit,
        profitMargin: profitMargin.toFixed(1) + "%",
      },
      breakdown: {
        byCity: Object.entries(profitByCity).map(([name, profit]) => ({ name, profit })).sort((a, b) => b.profit - a.profit),
        byProduct: Object.entries(profitByProduct).map(([name, profit]) => ({ name, profit })).sort((a, b) => b.profit - a.profit),
        byStatus: Object.entries(profitByStatus).map(([name, profit]) => ({ name, profit })),
      }
    });
  } catch (error) {
    console.error("GET /api/finance/stats error:", error);
    return NextResponse.json({
      summary: { totalRevenue: 0, totalCosts: 0, netProfit: 0, profitMargin: "0.0%" },
      breakdown: { byCity: [], byProduct: [], byStatus: [] }
    }, { status: 200 });
  }
}
