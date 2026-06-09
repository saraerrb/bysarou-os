import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/products — list all products with variants and category
export async function GET(request: NextRequest) {
  try {
    const { getActiveStoreId } = await import("@/lib/store-context");
    const storeId = await getActiveStoreId();
    
    if (!storeId) {
      return NextResponse.json({ error: "Store context missing" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { storeId };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { variants: { some: { sku: { contains: search } } } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: {
          include: {
            sizeRef: true,
            colorRef: true,
          },
          orderBy: [{ color: "asc" }, { size: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products — create a new product with variants
export async function POST(request: NextRequest) {
  try {
    const { getActiveStoreId } = await import("@/lib/store-context");
    const storeId = await getActiveStoreId();

    if (!storeId) {
      return NextResponse.json({ error: "Store context missing" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, categoryId, costPrice, sellingPrice, imageUrl, variants } = body;

    if (!name || !categoryId || costPrice == null || sellingPrice == null) {
      return NextResponse.json(
        { error: "Missing required fields: name, categoryId, costPrice, sellingPrice" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        storeId,
        description: description || null,
        categoryId,
        price: parseFloat(sellingPrice), // Required base price field
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        image: imageUrl || null,
        variants: {
          create: (variants || []).map((v: any) => ({
            size: v.size || null,
            color: v.color || null,
            sizeId: v.sizeId || null,
            colorId: v.colorId || null,
            sku: v.sku,
            stockQuantity: v.stockQuantity || 0,
            costPrice: v.costPrice ? parseFloat(v.costPrice) : null,
            sellingPrice: v.sellingPrice ? parseFloat(v.sellingPrice) : null,
            barcode: v.barcode || null,
            active: v.active !== undefined ? v.active : true,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
      },
    }) as any; // Cast as any to avoid complex Prisma include type issues in this turn

    // Record initial stock movements
    for (const variant of (product as any).variants) {
      if (variant.stockQuantity > 0) {
        await prisma.stockMovement.create({
          data: {
            variantId: variant.id,
            type: "IN",
            quantity: variant.stockQuantity,
            reason: "Initial stock on product creation",
          },
        });
      }
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Logic for deleting products (Soft delete or hard delete depending on preference)
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
