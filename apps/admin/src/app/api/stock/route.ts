import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/stock — update stock for a variant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantId, quantity, type, reason } = body;

    if (!variantId || quantity == null || !type) {
      return NextResponse.json(
        { error: "Missing required fields: variantId, quantity, type" },
        { status: 400 }
      );
    }

    const parsedQty = parseInt(quantity);
    if (isNaN(parsedQty) || parsedQty === 0) {
      return NextResponse.json(
        { error: "Quantity must be a non-zero number" },
        { status: 400 }
      );
    }

    // Get current variant
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Calculate new stock
    let newStock = variant.stockQuantity;
    const absQty = Math.abs(parsedQty);

    switch (type) {
      case "IN":
      case "RETURN":
        newStock += absQty;
        break;
      case "OUT":
        newStock -= absQty;
        break;
      case "MANUAL_ADJUSTMENT":
        newStock = parsedQty; // direct set
        break;
    }

    if (newStock < 0 && type !== "MANUAL_ADJUSTMENT") {
      return NextResponse.json(
        { error: "Insufficient stock. Current: " + variant.stockQuantity },
        { status: 400 }
      );
    }

    // Update stock and record movement
    const [updatedVariant, movement] = await prisma.$transaction([
      prisma.productVariant.update({
        where: { id: variantId },
        data: { stockQuantity: Math.max(0, newStock) },
      }),
      prisma.stockMovement.create({
        data: {
          variantId,
          type,
          quantity: type === "MANUAL_ADJUSTMENT" ? parsedQty - variant.stockQuantity : absQty,
          reason: reason || null,
        },
      }),
    ]);

    return NextResponse.json({ variant: updatedVariant, movement });
  } catch (error) {
    console.error("POST /api/stock error:", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}

// GET /api/stock — get stock movements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get("variantId");
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};
    if (variantId) where.variantId = variantId;
    if (productId) where.variant = { productId };

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        variant: {
          select: {
            sku: true,
            size: true,
            color: true,
            product: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error("GET /api/stock error:", error);
    return NextResponse.json({ error: "Failed to fetch movements" }, { status: 500 });
  }
}
