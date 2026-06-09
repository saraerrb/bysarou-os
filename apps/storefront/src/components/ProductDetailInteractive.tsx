"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, Truck, ShieldCheck, Phone, Check, 
  MessageCircle, ShoppingBag, Loader2, Star,
  AlertTriangle, CreditCard, ChevronRight
} from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Variant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  sizeId: string | null;
  colorId: string | null;
  stockQuantity: number;
  colorRef: { id: string; name: string; hexCode: string } | null;
  sizeRef: { id: string; name: string } | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: { name: string };
  variants: Variant[];
}

export const ProductDetailInteractive: React.FC<{ product: Product }> = ({ product }) => {
  const router = useRouter();
  const { addToCart } = useCart();

  // Find unique sizes and colors across variants
  const uniqueSizes = Array.from(
    new Map(
      product.variants
        .filter((v) => v.sizeRef)
        .map((v) => [v.sizeId, v.sizeRef])
    ).values()
  ).filter(Boolean) as { id: string; name: string }[];

  const uniqueColors = Array.from(
    new Map(
      product.variants
        .filter((v) => v.colorRef)
        .map((v) => [v.colorId, v.colorRef])
    ).values()
  ).filter(Boolean) as { id: string; name: string; hexCode: string }[];

  // Selected State
  const [selectedSizeId, setSelectedSizeId] = useState<string>(uniqueSizes[0]?.id || "");
  const [selectedColorId, setSelectedColorId] = useState<string>(uniqueColors[0]?.id || "");
  const [quantity, setQuantity] = useState<number>(1);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Casablanca");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  
  // Interface UX States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const moroccanCities = [
    "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", 
    "Oujda", "Kénitra", "Tétouan", "Safi", "Temara", "Mohammedia", "Nador", 
    "El Jadida", "Taza", "Béni Mellal", "Khemisset", "Larache", "Ksar El Kebir"
  ];

  // Find matching variant based on selections
  const matchingVariant = product.variants.find(
    (v) => 
      (uniqueSizes.length === 0 || v.sizeId === selectedSizeId) &&
      (uniqueColors.length === 0 || v.colorId === selectedColorId)
  );

  const selectedSizeName = matchingVariant?.sizeRef?.name || null;
  const selectedColorName = matchingVariant?.colorRef?.name || null;
  const stock = matchingVariant ? matchingVariant.stockQuantity : 0;
  const isOutOfStock = stock <= 0;

  // Reset quantity if it exceeds variant stock
  useEffect(() => {
    if (quantity > stock && stock > 0) {
      setQuantity(stock);
    }
  }, [selectedSizeId, selectedColorId, stock]);

  const handleAddToCart = () => {
    if (!matchingVariant || isOutOfStock) return;

    setIsAddingToCart(true);
    setError("");

    addToCart({
      id: matchingVariant.id,
      productId: product.id,
      variantId: matchingVariant.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSizeName,
      color: selectedColorName,
      quantity: quantity,
      stockQuantity: stock
    });

    setTimeout(() => {
      setIsAddingToCart(false);
      setSuccessMsg("Ajouté au panier avec succès !");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 600);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!matchingVariant) {
      setError("Option de vêtement invalide.");
      return;
    }

    if (isOutOfStock) {
      setError("Cet article est actuellement en rupture de stock.");
      return;
    }

    if (!name || !phone || !address) {
      setError("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerCity: city,
          customerAddress: address,
          notes: notes,
          items: [
            {
              variantId: matchingVariant.id,
              productId: product.id,
              quantity: quantity,
              price: product.price
            }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur s'est produite lors de la validation.");
      }

      // Order Success Redirect
      router.push(`/order-success/${data.orderId}`);
    } catch (err: any) {
      setError(err.message || "Impossible de valider votre commande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* LEFT COLUMN: Premium Editorial Product Image */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-neutral-50 rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center min-h-[500px] lg:h-[650px] relative luxury-shadow">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="text-center">
              <span className="font-serif text-3xl font-bold text-gold tracking-widest block">BY SAROU</span>
              <span className="text-xs uppercase tracking-[0.2em] text-gray-400 mt-2 block">Haute Couture</span>
            </div>
          )}

          {/* Luxury Badge */}
          <span className="absolute bottom-6 left-6 bg-text-dark/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-white/10">
            Maison BySarou Couture
          </span>
        </div>

        {/* Dynamic description sheet */}
        <div className="bg-neutral-50 p-6 rounded-2xl border border-gray-100">
          <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-text-dark mb-3">
            Description & Conseils d'entretien
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            {product.description || "Une pièce d'exception façonnée selon les traditions de la haute couture. Chaque détail a été pensé pour offrir un tombé majestueux et un confort absolu. Nettoyage à sec recommandé."}
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Configuration & COD Form */}
      <div className="lg:col-span-6 space-y-8">
        
        {/* Title, rating, prices */}
        <div>
          <span className="text-gold uppercase tracking-[0.25em] text-xs font-bold block mb-1">
            Collection {product.category.name}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-text-dark tracking-wide uppercase">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-3">
            <div className="flex gap-0.5 text-gold">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
            </div>
            <span className="text-[11px] text-gray-400 font-medium">(18 avis vérifiés)</span>
          </div>

          {/* Luxury comparative pricing */}
          <div className="flex items-baseline gap-3.5 mt-5">
            <span className="text-2xl font-bold text-text-dark font-sans">
              {product.price.toFixed(2)} MAD
            </span>
            <span className="text-sm text-gray-400 line-through font-medium">
              {(product.price + 150).toFixed(2)} MAD
            </span>
            <span className="text-xs bg-accent text-white font-bold px-2 py-0.5 rounded">
              Livraison Gratuite
            </span>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 1. SELECTIONS: Color & Size swatches */}
        <div className="space-y-6">
          {/* Colors Swatches */}
          {uniqueColors.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Couleur : <span className="text-text-dark font-bold">{selectedColorName || "Sélectionner"}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {uniqueColors.map((color) => {
                  const isSelected = color.id === selectedColorId;
                  return (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColorId(color.id)}
                      className={`relative w-8 h-8 rounded-full border transition-all flex items-center justify-center hover:scale-105 shadow-sm`}
                      style={{ 
                        backgroundColor: color.hexCode,
                        borderColor: isSelected ? "#8e674a" : "rgba(0,0,0,0.1)",
                        boxShadow: isSelected ? "0 0 0 2px rgba(142, 103, 74, 0.4)" : "none"
                      }}
                      title={color.name}
                    >
                      {isSelected && (
                        <Check 
                          className="w-4 h-4 shadow-sm" 
                          style={{ color: color.hexCode === "#ffffff" ? "#000000" : "#ffffff" }} 
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes Select Box */}
          {uniqueSizes.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Taille : <span className="text-text-dark font-bold">{selectedSizeName || "Sélectionner"}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {uniqueSizes.map((size) => {
                  const isSelected = size.id === selectedSizeId;
                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSizeId(size.id)}
                      className={`min-w-10 h-10 px-3 rounded-lg border text-xs font-bold transition-all uppercase flex items-center justify-center ${
                        isSelected 
                          ? "bg-gold text-white border-gold shadow-sm scale-105" 
                          : "bg-white text-gray-600 border-gray-200 hover:border-gold/30"
                      }`}
                    >
                      {size.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live stock indicator */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOutOfStock ? "bg-red-500" : stock < 10 ? "bg-orange-500 animate-pulse" : "bg-green-500"}`} />
            <span className="text-xs font-semibold text-gray-600">
              {isOutOfStock 
                ? "Rupture de stock" 
                : stock < 10 
                  ? `Stock limité ! Seulement ${stock} pièces restantes.` 
                  : "En stock - Prêt pour expédition express"
              }
            </span>
          </div>
        </div>

        {/* Cart Action Buttons */}
        {!isOutOfStock && (
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="flex-1 bg-white hover:bg-neutral-50 text-text-dark border border-gray-200 text-xs font-bold py-4 px-4 rounded-xl uppercase tracking-widest transition-all shadow-sm flex justify-center items-center gap-2"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Ajout...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-gold" /> Ajouter au panier
                </>
              )}
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-green-50 border border-green-100 text-green-700 text-xs font-medium rounded-lg animate-scale-up">
            ✓ {successMsg}
          </div>
        )}

        {/* 2. DIRECT EMBEDDED COD CHECKOUT FORM */}
        <div className="bg-neutral-50 border border-gold/15 p-6 sm:p-8 rounded-2xl luxury-shadow relative overflow-hidden">
          {/* Subtle gold accent background pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex justify-between items-center mb-6 relative">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-gold bg-gold/5 border border-gold/10 px-2 py-0.5 rounded">
                Étape unique
              </span>
              <h3 className="font-serif text-base font-bold text-text-dark mt-1 flex items-center gap-1.5">
                Formulaire d'achat direct (COD)
              </h3>
            </div>
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5 shrink-0">
              <Truck className="w-3.5 h-3.5" /> Livraison gratuite
            </span>
          </div>

          {isOutOfStock ? (
            <div className="p-6 bg-red-50/50 border border-red-100 rounded-xl text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-red-700 uppercase">Modèle Indisponible</h4>
              <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                Ce modèle est épuisé dans la taille/couleur choisie. Veuillez sélectionner une autre combinaison.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 relative">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Quantity Select */}
              <div className="grid grid-cols-3 items-center gap-3">
                <span className="col-span-2 text-xs font-semibold text-gray-500">Quantité à commander :</span>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold text-text-dark"
                >
                  {[...Array(Math.min(stock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Nom & Prénom complet *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Amina Alami"
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs text-text-dark transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Téléphone portable *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 0612345678"
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs text-text-dark transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Ville *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs text-text-dark transition-all"
                  >
                    {moroccanCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Mode de livraison
                  </label>
                  <div className="bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs text-green-600 font-bold flex items-center gap-1.5">
                    <Truck className="w-4 h-4 shrink-0" /> Express 24h/48h
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Adresse de livraison complète *
                </label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Quartier Gauthier, Boulevard d'Anfa, Rue 14, Appt 5"
                  rows={2}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs text-text-dark transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Remarques de livraison (Optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Veuillez m'appeler avant de venir..."
                  rows={1}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs text-text-dark transition-all resize-none"
                />
              </div>

              {/* COD security tag */}
              <div className="flex gap-2.5 bg-green-50 border border-green-100 p-3 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-[10px] text-green-800 leading-relaxed font-medium">
                  <strong>Paiement Cash à la Livraison (COD) :</strong> Zéro risque. Aucun paiement en ligne requis. Vous inspectez l'article chez vous avant de payer.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold hover:bg-gold-dark text-white text-xs font-bold py-4.5 px-4 rounded-xl uppercase tracking-widest transition-all duration-300 shadow-md flex justify-center items-center gap-2 transform active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Commande en cours...
                  </>
                ) : (
                  <>
                    Confirmer l'achat - { (product.price * quantity).toFixed(2) } MAD
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailInteractive;
