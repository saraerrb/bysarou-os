"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, Plus, Minus, Trash2, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    clearCart
  } = useCart();

  const router = useRouter();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Casablanca");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!isCartOpen) return null;

  const moroccanCities = [
    "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", 
    "Oujda", "Kénitra", "Tétouan", "Safi", "Temara", "Mohammedia", "Nador", 
    "El Jadida", "Taza", "Béni Mellal", "Khemisset", "Larache", "Ksar El Kebir"
  ];

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !phone || !address) {
      setError("Veuillez remplir tous les champs obligatoires (*)");
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
          items: cart.map(item => ({
            variantId: item.variantId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur s'est produite lors de la validation.");
      }

      // Success
      clearCart();
      setIsCartOpen(false);
      setShowCheckoutForm(false);
      setName("");
      setPhone("");
      setAddress("");
      setNotes("");
      router.push(`/order-success/${data.orderId}`);
    } catch (err: any) {
      setError(err.message || "Impossible de valider la commande. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSubmitting) setIsCartOpen(false);
        }}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        {/* Panel container */}
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gold" />
              <h2 className="font-serif text-lg font-bold text-text-dark tracking-wide">
                {showCheckoutForm ? "Finaliser votre commande" : "Votre Panier"}
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              disabled={isSubmitting}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-text-dark transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center py-12">
                <div className="w-16 h-16 bg-gold/5 rounded-full flex justify-center items-center mb-4 border border-gold/10">
                  <ShoppingBag className="w-7 h-7 text-gold/70" />
                </div>
                <h3 className="font-serif text-base font-semibold mb-2">Votre panier est vide</h3>
                <p className="text-xs text-gray-500 max-w-[260px] mb-6">
                  Découvrez nos collections Haute Couture et ajoutez des produits d'exception.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-gold hover:bg-gold-dark text-white text-xs font-semibold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors shadow-sm"
                >
                  Continuer vos achats
                </button>
              </div>
            ) : !showCheckoutForm ? (
              /* Cart Items List */
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex gap-4 p-3 border border-gray-100 rounded-xl hover:border-gold/20 transition-all duration-300"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-serif text-xs text-gold font-bold">BYSAROU</span>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-xs font-bold text-text-dark tracking-wide line-clamp-1">
                          {item.name}
                        </h4>
                        
                        <div className="flex gap-2.5 mt-1.5">
                          {item.size && (
                            <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                              Taille: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-[10px] bg-gold/5 text-gold-dark px-2 py-0.5 rounded font-medium border border-gold/10">
                              Couleur: {item.color}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls & Price */}
                      <div className="flex justify-between items-center mt-2.5">
                        <div className="flex items-center border border-gray-200 rounded-lg h-8">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="px-2 h-full hover:bg-gray-50 text-gray-500 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold text-text-dark">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.stockQuantity}
                            className="px-2 h-full hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-30"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-text-dark">
                            {(item.price * item.quantity).toFixed(2)} MAD
                          </span>
                          <button
                            onClick={() => removeFromCart(item.variantId)}
                            className="block text-gray-400 hover:text-red-500 mt-1 ml-auto transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Inline checkout Form */
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Amina Alami"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 text-xs text-text-dark transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Téléphone Portable *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 0612345678"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 text-xs text-text-dark transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Ville *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 text-xs text-text-dark transition-all"
                  >
                    {moroccanCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Adresse Complète de Livraison *
                  </label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Quartier Gauthier, Rue 12, Appt 5"
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 text-xs text-text-dark transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Notes particulières (Optionnel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Livraison après 15h, ou code interphone..."
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 text-xs text-text-dark transition-all resize-none"
                  />
                </div>

                <div className="bg-gold/5 border border-gold/15 p-3 rounded-lg flex items-start gap-2.5 mt-2">
                  <ShieldCheck className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-bold text-gold-dark">Paiement 100% Sécurisé à la Livraison</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                      Aucune carte bancaire requise. Vous payez en espèces auprès du livreur uniquement après vérification de vos vêtements.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer controls */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-500 font-medium">Sous-total</span>
                <span className="text-base font-bold text-text-dark">
                  {cartTotal.toFixed(2)} MAD
                </span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-xs text-gray-500 font-medium">Frais de livraison</span>
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                  Gratuit
                </span>
              </div>

              {showCheckoutForm ? (
                /* Order Placing Buttons */
                <div className="space-y-3">
                  <button
                    onClick={handleCheckoutSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-gold hover:bg-gold-dark disabled:bg-gold/50 text-white text-xs font-bold py-4 px-4 rounded-xl uppercase tracking-widest transition-all duration-300 shadow-md flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Confirmer ma commande (COD)
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCheckoutForm(false)}
                    disabled={isSubmitting}
                    className="w-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-bold py-3 px-4 rounded-xl uppercase tracking-widest transition-all duration-300"
                  >
                    Retour au panier
                  </button>
                </div>
              ) : (
                /* Standard Cart Actions */
                <button
                  onClick={() => setShowCheckoutForm(true)}
                  className="w-full bg-gold hover:bg-gold-dark text-white text-xs font-bold py-4 px-4 rounded-xl uppercase tracking-widest transition-all duration-300 shadow-md flex justify-center items-center gap-2"
                >
                  Valider la commande (COD)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
