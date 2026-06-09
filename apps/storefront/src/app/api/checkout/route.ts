import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerCity, customerAddress, notes, items } = body;

    // 1. Validation
    if (!customerName || !customerPhone || !customerCity || !customerAddress || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Veuillez remplir tous les champs obligatoires et ajouter des produits." },
        { status: 400 }
      );
    }

    // 2. Fetch default store (BySarou Fashion)
    const store = await prisma.store.findFirst({
      where: { name: { contains: "BySarou" } }
    });
    const storeId = store ? store.id : "cmossdqih0001oz70qp3u0jsp"; // Default fallback

    // 3. Process checkout inside a transaction to ensure database consistency
    const result = await prisma.$transaction(async (tx) => {
      let computedTotal = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        const { variantId, quantity, price } = item;

        // Fetch current variant stock quantity
        const variant = await tx.productVariant.findUnique({
          where: { id: variantId },
          include: { product: true }
        });

        if (!variant) {
          throw new Error(`Le produit avec la variante sélectionnée n'existe pas.`);
        }

        if (variant.stockQuantity < quantity) {
          throw new Error(`Stock insuffisant pour le modèle "${variant.product.name}" (${variant.size || ""} / ${variant.color || ""}). Il reste seulement ${variant.stockQuantity} articles.`);
        }

        // Deduct variant stock
        await tx.productVariant.update({
          where: { id: variantId },
          data: {
            stockQuantity: {
              decrement: quantity
            }
          }
        });

        // Record stock movement (OUT)
        await tx.stockMovement.create({
          data: {
            variantId: variantId,
            type: "OUT",
            quantity: quantity,
            reason: `Online Store COD Order - Client: ${customerName}`
          }
        });

        computedTotal += price * quantity;
        orderItemsToCreate.push({
          variantId: variantId,
          quantity: quantity,
          price: price
        });
      }

      // Create the order in the database
      const order = await tx.order.create({
        data: {
          storeId: storeId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerCity: customerCity,
          customerAddress: customerAddress.trim(),
          totalAmount: computedTotal,
          status: "NEW", // Admin default order status for pending validation
          shippingCost: 0, // Free shipping for storefront promotions
          codFee: 0,
          packagingCost: 0,
          notes: notes ? notes.trim() : null,
          items: {
            create: orderItemsToCreate
          },
          history: {
            create: {
              status: "NEW",
              notes: "Commande en ligne enregistrée (Paiement à la livraison)",
              agentName: "Système Boutique"
            }
          }
        }
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      message: "Votre commande a été enregistrée avec succès.",
      orderId: result.id
    });

  } catch (err: any) {
    console.error("Checkout Transaction Error:", err);
    return NextResponse.json(
      { message: err.message || "Une erreur s'est produite lors de la validation de la commande." },
      { status: 500 }
    );
  }
}
