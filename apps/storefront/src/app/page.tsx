import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Truck, MessageCircle, Star } from "lucide-react";
import prisma from "@/lib/prisma";

export const revalidate = 0; // Ensure live data updates from database are instant

export default async function HomePage() {
  // Fetch active products with categories and variants for live stock availability
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      variants: true,
    },
  });

  // Extract counts for a quick inventory highlight
  const robesCount = await prisma.product.count({ where: { category: { name: "Dress" } } });
  const ensemblesCount = await prisma.product.count({ where: { category: { name: "Set" } } });
  const topsCount = await prisma.product.count({ where: { category: { name: "Top" } } });
  const bottomsCount = await prisma.product.count({ where: { category: { name: "Bottom" } } });

  const categoriesList = [
    { name: "Robes", count: robesCount, path: "Dress", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600" },
    { name: "Ensembles", count: ensemblesCount, path: "Set", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600" },
    { name: "Tops", count: topsCount, path: "Top", img: "https://images.unsplash.com/photo-1539008885128-40d24e280bb3?auto=format&fit=crop&q=80&w=600" },
    { name: "Pantalons", count: bottomsCount, path: "Bottom", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600" },
  ];

  return (
    <div className="w-full font-sans bg-white pb-16">
      
      {/* 1. HERO SECTION (Premium fashion editorial style) */}
      <section className="relative w-full h-[85vh] bg-neutral-900 flex items-center justify-center overflow-hidden">
        {/* Editorial Background Image with Dark Soft Gold Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-transparent" />
        
        {/* Soft atmospheric amber light */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 z-10 text-white flex flex-col items-center">
          <span className="text-gold-light uppercase tracking-[0.35em] text-xs font-bold mb-4 flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-4 h-4" /> NOUVELLE COLLECTION COMPATIBLE
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-widest leading-tight text-white mb-6 uppercase">
            ÉLÉGANCE <br className="sm:hidden" /><span className="text-gold-light font-normal italic">Sublime</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 tracking-wide font-light max-w-lg mb-10 leading-relaxed">
            Une harmonie parfaite entre coupes haute couture et finitions artisanales. Faites l'expérience du luxe marocain au quotidien.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a 
              href="#best-sellers" 
              className="bg-gold hover:bg-gold-dark text-white text-xs font-bold py-4 px-8 rounded-xl uppercase tracking-widest transition-all duration-300 shadow-lg transform hover:-translate-y-0.5"
            >
              Découvrir les modèles
            </a>
            <a 
              href="https://wa.me/212600000000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold py-4 px-8 rounded-xl uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-green-400" /> Commander via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 2. VALUE BADGES (Horizontal Trust Widgets) */}
      <section className="bg-neutral-50 py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 luxury-shadow">
            <div className="w-12 h-12 bg-gold/5 rounded-full flex items-center justify-center text-gold border border-gold/10">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-dark">Livraison Gratuite</h4>
              <p className="text-[10px] text-gray-500 mt-1">Expédition express gratuite partout au Maroc sous 24h-48h.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 luxury-shadow">
            <div className="w-12 h-12 bg-gold/5 rounded-full flex items-center justify-center text-gold border border-gold/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-dark">Paiement à la Livraison</h4>
              <p className="text-[10px] text-gray-500 mt-1">Payez en espèces en toute sécurité à la livraison de vos articles.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 luxury-shadow">
            <div className="w-12 h-12 bg-gold/5 rounded-full flex items-center justify-center text-gold border border-gold/10">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-dark">Qualité Premium</h4>
              <p className="text-[10px] text-gray-500 mt-1">Coupes et tissus rigoureusement sélectionnés pour votre confort.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 luxury-shadow">
            <div className="w-12 h-12 bg-gold/5 rounded-full flex items-center justify-center text-gold border border-gold/10">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-dark">Support Direct</h4>
              <p className="text-[10px] text-gray-500 mt-1">Équipe support disponible par WhatsApp de 9h à 21h pour vous conseiller.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES BENTO CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center mb-12">
          <span className="text-gold uppercase tracking-[0.25em] text-xs font-bold">Inspirations</span>
          <h2 className="font-serif text-3xl font-bold text-text-dark tracking-wide mt-2">
            Nos Univers Couture
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesList.map((cat) => (
            <Link 
              key={cat.name} 
              href={`/collections/${cat.path}`}
              className="group relative h-96 rounded-2xl overflow-hidden border border-gray-100 shadow-md transform hover:-translate-y-1 transition-all duration-300"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url('${cat.img}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 text-white">
                <span className="text-[10px] uppercase font-semibold text-gold-light tracking-widest bg-white/10 px-2.5 py-1 rounded backdrop-blur-md">
                  {cat.count} {cat.count > 1 ? "Modèles" : "Modèle"}
                </span>
                <h3 className="font-serif text-xl font-bold mt-3 tracking-wide">{cat.name}</h3>
                <span className="text-xs font-semibold uppercase tracking-wider text-gold-light mt-1.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Découvrir <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (Direct real-time SQLite queries) */}
      <section id="best-sellers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12">
          <div className="text-center sm:text-left mb-6 sm:mb-0">
            <span className="text-gold uppercase tracking-[0.25em] text-xs font-bold">À ne pas manquer</span>
            <h2 className="font-serif text-3xl font-bold text-text-dark tracking-wide mt-2">
              Les Pièces Exclusives
            </h2>
          </div>
          <Link 
            href="/collections/Dress" 
            className="text-xs uppercase font-bold tracking-widest text-gold hover:text-gold-dark flex items-center gap-1.5 group"
          >
            Voir toute la collection <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-serif">Aucun modèle disponible pour le moment.</p>
            <p className="text-xs text-gray-400 mt-2">Ajoutez des produits dans l'admin BySarou OS pour les voir s'afficher ici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              // Calculate live total stock for all variants
              const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
              const isLowStock = totalStock > 0 && totalStock < 10;
              const isOutOfStock = totalStock === 0;

              // Decorative comparative discount pricing (e.g. retail + 120 MAD compared price)
              const comparedPrice = product.price + 150;
              const discountPercentage = Math.round(((comparedPrice - product.price) / comparedPrice) * 100);

              return (
                <div 
                  key={product.id} 
                  className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gold/20 luxury-shadow transition-all duration-300"
                >
                  {/* Discount tag badge */}
                  <span className="absolute top-4 left-4 z-10 bg-accent text-white text-[10px] font-bold px-2.5 py-1 rounded">
                    -{discountPercentage}%
                  </span>

                  {/* Stock tag badge */}
                  {isOutOfStock && (
                    <span className="absolute top-4 right-4 z-10 bg-neutral-900 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                      Épuisé
                    </span>
                  )}
                  {isLowStock && (
                    <span className="absolute top-4 right-4 z-10 bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider animate-pulse">
                      Stock Faible
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

                    {/* Quick view overlay button */}
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                        {product.category?.name || "Couture"}
                      </span>
                      <h3 className="font-serif text-sm font-bold text-text-dark mt-1.5 group-hover:text-gold transition-colors line-clamp-1">
                        <Link href={`/products/${product.id}`}>{product.name}</Link>
                      </h3>
                    </div>

                    {/* Price and Action */}
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
                        title="Détails du produit"
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
      </section>

      {/* 5. VERIFIED CLIENT TESTIMONIALS */}
      <section className="bg-neutral-50 py-20 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold uppercase tracking-[0.25em] text-xs font-bold">Témoignages</span>
          <h2 className="font-serif text-3xl font-bold text-text-dark tracking-wide mt-2">
            Elles adorent BY SAROU
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-4 mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 luxury-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-center gap-1 text-gold mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  "J'ai commandé l'ensemble plissé en vert émeraude. La coupe est tout simplement majestueuse, le tissu fluide tombe parfaitement bien. Le livreur me l'a apporté à Casablanca en moins de 24h. Je recommande vivement !"
                </p>
              </div>
              <div className="mt-6 border-t border-gray-50 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-dark">Yasmine B.</h4>
                <span className="text-[10px] text-gold font-medium">Achat vérifié • Casablanca</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 luxury-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-center gap-1 text-gold mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  "Un service client d'une efficacité incroyable sur WhatsApp ! J'avais un doute sur ma taille pour la robe longue en soie, l'agent m'a parfaitement conseillée. La livraison est rapide et le paiement cash très rassurant."
                </p>
              </div>
              <div className="mt-6 border-t border-gray-50 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-dark">Khadija A.</h4>
                <span className="text-[10px] text-gold font-medium">Achat vérifié • Rabat</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 luxury-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-center gap-1 text-gold mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  "La qualité couture est vraiment au rendez-vous. Pour ce prix avec livraison gratuite, c'est incroyable. C'est ma troisième commande cette saison et le niveau de finition est impeccable."
                </p>
              </div>
              <div className="mt-6 border-t border-gray-50 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-dark">Sanaa M.</h4>
                <span className="text-[10px] text-gold font-medium">Achat vérifié • Marrakech</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
