import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const variants = await prisma.productVariant.findMany({
      include: {
        product: true,
        sizeRef: true,
        colorRef: true,
        orderItems: {
          include: {
            order: true
          }
        }
      }
    });

    const sizeAnalytics: Record<string, any> = {};
    const colorAnalytics: Record<string, any> = {};
    const variantAnalytics: any[] = [];

    variants.forEach(variant => {
      const sizeName = variant.sizeRef?.name || variant.size || "N/A";
      const colorName = variant.colorRef?.name || variant.color || "N/A";
      
      let variantRevenue = 0;
      let variantReturns = 0;
      let variantSales = 0;

      variant.orderItems.forEach(item => {
        if (["CONFIRMED", "SHIPPED", "DELIVERED"].includes(item.order.status)) {
          variantRevenue += (item.price * item.quantity);
          variantSales += item.quantity;
        }
        if (item.order.status === "RETURNED") {
          variantReturns += item.quantity;
        }
      });

      // Size
      if (!sizeAnalytics[sizeName]) {
        sizeAnalytics[sizeName] = { name: sizeName, revenue: 0, sales: 0, returns: 0, stock: 0 };
      }
      sizeAnalytics[sizeName].revenue += variantRevenue;
      sizeAnalytics[sizeName].sales += variantSales;
      sizeAnalytics[sizeName].returns += variantReturns;
      sizeAnalytics[sizeName].stock += variant.stockQuantity;

      // Color
      if (!colorAnalytics[colorName]) {
        colorAnalytics[colorName] = { name: colorName, revenue: 0, sales: 0, returns: 0, stock: 0 };
      }
      colorAnalytics[colorName].revenue += variantRevenue;
      colorAnalytics[colorName].sales += variantSales;
      colorAnalytics[colorName].returns += variantReturns;
      colorAnalytics[colorName].stock += variant.stockQuantity;

      // Variant
      variantAnalytics.push({
        id: variant.id,
        name: `${variant.product.name} - ${sizeName} / ${colorName}`,
        sku: variant.sku,
        revenue: variantRevenue,
        sales: variantSales,
        returns: variantReturns,
        stock: variant.stockQuantity,
      });
    });

    const bestSizes = Object.values(sizeAnalytics).sort((a, b) => b.sales - a.sales);
    const bestColors = Object.values(colorAnalytics).sort((a, b) => b.sales - a.sales);
    const bestVariants = [...variantAnalytics].sort((a, b) => b.sales - a.sales);

    return NextResponse.json({
      sizes: bestSizes,
      colors: bestColors,
      variants: bestVariants,
      deadStock: variantAnalytics.filter(v => v.sales === 0 && v.stock > 0).sort((a, b) => b.stock - a.stock)
    });
  } catch (error) {
    console.error("GET /api/analytics/variants error:", error);
    return NextResponse.json({ error: "Failed to fetch variant analytics" }, { status: 500 });
  }
}
