import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Filter, Grid } from "lucide-react";
import prisma from "@/lib/prisma";

export const revalidate = 0; // Live stock and catalog updates

interface Props {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    sort?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { sort } = await searchParams;

  // Find Category in database (case-insensitive where possible or simple match)
  const categoryObj = await prisma.category.findFirst({
    where: {
      name: {
        equals: category
      }
    }
  });

  if (!categoryObj) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-sans">
        <h1 className="font-serif text-3xl font-bold mb-4">Collection introuvable</h1>
        <p className="text-gray-500 mb-8">La collection "{category}" n'existe pas ou a été déplacée.</p>
        <Link href="/" className="bg-gold hover:bg-gold-dark text-white text-xs font-bold py-3 px-8 rounded-lg uppercase tracking-wider transition-colors inline-block">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  // Determine sorting orderBy
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };

  // Fetch products under this category
  const products = await prisma.product.findMany({
    where: {
      categoryId: categoryObj.id,
      isActive: true
    },
    orderBy,
    include: {
      variants: true
    }
  });

  return (
    <div className="w-full font-sans bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs & Header Banner */}
        <div className="mb-10 text-center sm:text-left">
          <div className="text-xs text-gray-400 mb-2 flex items-center justify-center sm:justify-start gap-2">
            <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">{categoryObj.name}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-dark tracking-wide uppercase">
            Collection {categoryObj.name}
          </h1>
          <p className="text-xs text-gray-500 mt-2 font-light tracking-wider">
            {products.length} {products.length > 1 ? "créations disponibles" : "création disponible"}
          </p>
        </div>

        {/* Toolbar (Sorting and Filters summary) */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-neutral-50 p-4 rounded-xl border border-gray-100 mb-8 gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-dark">
            <Filter className="w-4 h-4 text-gold" />
            <span>Filtres Actifs : Aucun</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">Trier par :</span>
            <div className="flex gap-2">
              <Link 
                href={`/collections/${category}`}
                className={`text-[10px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-lg border transition-all ${
                  !sort 
                    ? "bg-gold text-white border-gold" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-gold/30"
                }`}
              >
                Nouveautés
              </Link>
              <Link 
                href={`/collections/${category}?sort=price-asc`}
                className={`text-[10px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-lg border transition-all ${
                  sort === "price-asc" 
                    ? "bg-gold text-white border-gold" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-gold/30"
                }`}
              >
                Prix croissant
              </Link>
              <Link 
                href={`/collections/${category}?sort=price-desc`}
                className={`text-[10px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-lg border transition-all ${
                  sort === "price-desc" 
                    ? "bg-gold text-white border-gold" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-gold/30"
                }`}
              >
                Prix décroissant
              </Link>
            </div>
          </div>
        </div>

        {/* Product Catalog Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-gray-200">
            <Sparkles className="w-8 h-8 text-gold/30 mx-auto mb-3" />
            <h3 className="font-serif text-base font-semibold mb-1">Bientôt disponible</h3>
            <p className="text-xs text-gray-500 max-w-[260px] mx-auto">
              Nos designers préparent actuellement de nouvelles pièces pour cette collection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
              const isLowStock = totalStock > 0 && totalStock < 10;
              const isOutOfStock = totalStock === 0;

              const comparedPrice = product.price + 150;
              const discountPercentage = Math.round(((comparedPrice - product.price) / comparedPrice) * 100);

              return (
                <div 
                  key={product.id} 
                  className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gold/20 luxury-shadow transition-all duration-300 animate-fade-in"
                >
                  <span className="absolute top-4 left-4 z-10 bg-accent text-white text-[10px] font-bold px-2.5 py-1 rounded">
                    -{discountPercentage}%
                  </span>

                  {isOutOfStock && (
                    <span className="absolute top-4 right-4 z-10 bg-neutral-900 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                      Épuisé
                    </span>
                  )}
                  {isLowStock && (
                    <span className="absolute top-4 right-4 z-10 bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                      Stock Limité
                    </span>
                  )}

                  {/* Product Image */}
                  <div className="relative h-96 bg-gray-50 overflow-hidden flex items-center justify-center group-hover:opacity-95 transition-opacity">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <span className="font-serif text-lg font-bold text-gold">BY SAROU</span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 mt-2">Couture d'exception</span>
                      </div>
                    )}

                    {/* Quick view / detail link overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Link 
                        href={`/products/${product.id}`}
                        className="bg-white text-text-dark hover:bg-gold hover:text-white text-xs font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors shadow-md"
                      >
                        Commander
                      </Link>
                    </div>
                  </div>

                  {/* Product Meta */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-gold tracking-widest">
                        {categoryObj.name}
                      </span>
                      <h3 className="font-serif text-sm font-bold text-text-dark mt-1.5 group-hover:text-gold transition-colors line-clamp-1">
                        <Link href={`/products/${product.id}`}>{product.name}</Link>
                      </h3>
                    </div>

                    {/* Price and Details link */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-text-dark">
                            {product.price.toFixed(2)} MAD
                          </span>
                          <span className="text-[11px] text-gray-400 line-through">
                            {comparedPrice.toFixed(2)} MAD
                          </span>
                        </div>
                        <span className="text-[9px] text-green-600 font-semibold block mt-0.5">
                          ✓ Livraison Gratuite
                        </span>
                      </div>

                      <Link 
                        href={`/products/${product.id}`}
                        className="p-2 bg-neutral-50 hover:bg-gold text-text-dark hover:text-white rounded-lg transition-colors border border-gray-100"
                        title="Commander cet article"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
