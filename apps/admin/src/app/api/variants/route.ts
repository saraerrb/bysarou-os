import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/variants — add variant to existing product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, size, color, sku, stockQuantity, sizeId, colorId, costPrice, sellingPrice, barcode, active } = body;

    if (!productId || !sku) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Check for duplicates
    if (sizeId || colorId) {
      const existing = await prisma.productVariant.findFirst({
        where: {
          productId,
          sizeId: sizeId || null,
          colorId: colorId || null,
        }
      });
      if (existing) {
        return NextResponse.json(
          { error: "A variant with this size and color already exists for this product" },
          { status: 400 }
        );
      }
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        size,
        color,
        sku,
        sizeId: sizeId || null,
        colorId: colorId || null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
        barcode: barcode || null,
        active: active !== undefined ? active : true,
        stockQuantity: stockQuantity || 0,
      },
    });

    // Record initial stock movement
    if (variant.stockQuantity > 0) {
      await prisma.stockMovement.create({
        data: {
          variantId: variant.id,
          type: "IN",
          quantity: variant.stockQuantity,
          reason: "Initial stock on variant creation",
        },
      });
    }

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error("POST /api/variants error:", error);
    const message = error instanceof Error ? error.message : "Failed to create variant";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/variants?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Variant ID required" }, { status: 400 });
    }

    await prisma.productVariant.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/variants error:", error);
    return NextResponse.json({ error: "Failed to delete variant" }, { status: 500 });
  }
}
