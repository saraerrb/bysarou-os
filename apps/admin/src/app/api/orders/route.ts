import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/orders — list orders with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const city = searchParams.get("city");
    const search = searchParams.get("search");

    const where: any = {};
    if (status) where.status = status;
    if (city) where.customerCity = city;
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
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
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(Array.isArray(orders) ? orders : []);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json([], { status: 200 }); // Return empty array for UI stability
  }
}

// POST /api/orders — manual order creation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      city,
      address,
      items,
      shippingCost = 0,
      codFee = 0,
      packagingCost = 0,
      notes,
    } = body;

    if (!customerName || !customerPhone || !city || !address || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required customer or item information" },
        { status: 400 }
      );
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    ) + (parseFloat(shippingCost) || 0) + (parseFloat(codFee) || 0) + (parseFloat(packagingCost) || 0);

    const order = await (prisma.order as any).create({
      data: {
        customerName,
        customerPhone,
        customerCity: city,
        customerAddress: address,
        totalAmount,
        shippingCost: parseFloat(shippingCost) || 0,
        codFee: parseFloat(codFee) || 0,
        packagingCost: parseFloat(packagingCost) || 0,
        notes,
        status: "NEW",
        items: {
          create: items.map((item: any) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        history: {
          create: {
            status: "NEW",
            notes: "Order created manually",
            agentName: "System",
          },
        },
      },
      include: {
        items: true,
        history: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
