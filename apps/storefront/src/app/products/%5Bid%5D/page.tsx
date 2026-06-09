import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductDetailInteractive from "@/components/ProductDetailInteractive";

export const revalidate = 0; // Ensure live variant stock check

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailsPage({ params }: Props) {
  const { id } = await params;

  // Fetch the product with its active category and active variants
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: {
        where: {
          active: true
        },
        include: {
          colorRef: true,
          sizeRef: true
        }
      }
    }
  });

  if (!product || !product.isActive) {
    return notFound();
  }

  return (
    <div className="w-full bg-white py-12">
      {/* Category header / return link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
          <span>/</span>
          <Link href={`/collections/${product.category.name}`} className="hover:text-gold transition-colors">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* Main product interactive column details */}
      <ProductDetailInteractive product={product} />
    </div>
  );
}
