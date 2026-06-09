import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle, ArrowRight, Truck, ShieldCheck } from "lucide-react";
import prisma from "@/lib/prisma";

export const revalidate = 0; // Live lookup of placed orders

interface Props {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderSuccessPage({ params }: Props) {
  const { orderId } = await params;

  // Retrieve order details from database
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
              sizeRef: true,
              colorRef: true
            }
          }
        }
      }
    }
  });

  if (!order) {
    return notFound();
  }

  // Pre-formatted text for direct WhatsApp confirmation
  const whatsappMsg = encodeURIComponent(
    `Bonjour BY SAROU,\n\nJe viens de passer une commande sur votre boutique en ligne :\n` +
    `- Référence : ${order.id}\n` +
    `- Nom : ${order.customerName}\n` +
    `- Ville : ${order.customerCity}\n` +
    `- Total : ${order.totalAmount.toFixed(2)} MAD\n\n` +
    `Pouvez-vous confirmer ma commande s'il vous plaît ?`
  );

  return (
    <div className="w-full bg-neutral-50 py-16 sm:py-24 font-sans min-h-screen flex items-center">
      <div className="max-w-3xl mx-auto px-4 w-full">
        
        {/* Success Card */}
        <div className="bg-white rounded-3xl border border-gold/10 p-8 sm:p-12 luxury-shadow text-center relative overflow-hidden">
          {/* Decorative gold backdrop blur */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

          {/* Success Animated Badge */}
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 border border-green-100 mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-gold uppercase tracking-[0.25em] text-xs font-bold block mb-2">
            Achat Validé avec Succès
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-text-dark tracking-wide uppercase max-w-xl mx-auto leading-snug">
            Félicitations, votre commande est enregistrée !
          </h1>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-4 leading-relaxed font-light">
            Merci pour votre confiance. Notre service logistique prépare actuellement vos créations. Vous serez contacté(e) par téléphone avant le passage du livreur.
          </p>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8 mb-10">
            <div className="bg-neutral-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3 justify-center sm:justify-start">
              <Truck className="w-5 h-5 text-gold" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Livraison</span>
                <span className="text-xs font-bold text-text-dark block">Gratuite Express</span>
              </div>
            </div>
            <div className="bg-neutral-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3 justify-center sm:justify-start">
              <ShieldCheck className="w-5 h-5 text-gold" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Paiement</span>
                <span className="text-xs font-bold text-text-dark block">Cash à la livraison</span>
              </div>
            </div>
          </div>

          {/* Order Reference details */}
          <div className="bg-neutral-50 border border-gray-100 rounded-2xl p-6 text-left max-w-xl mx-auto space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-gray-200/60 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Référence Commande</span>
              <span className="text-xs font-bold text-text-dark bg-white border border-gray-200 px-3 py-1 rounded-lg">
                {order.id}
              </span>
            </div>

            {/* Customer coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Destinataire</span>
                <span className="text-text-dark font-bold mt-0.5 block">{order.customerName}</span>
                <span className="text-gray-500 block mt-0.5">{order.customerPhone}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Adresse de Livraison</span>
                <span className="text-text-dark font-bold mt-0.5 block">{order.customerCity}</span>
                <span className="text-gray-500 block mt-0.5 leading-relaxed truncate">{order.customerAddress}</span>
              </div>
            </div>

            {/* Ordered products review */}
            <div className="border-t border-gray-200/60 pt-4 space-y-3">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">Articles commandés</span>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-text-dark font-bold block truncate">
                      {item.variant.product.name}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      Taille: {item.variant.sizeRef?.name || "Standard"} • Couleur: {item.variant.colorRef?.name || "Standard"} • Qte: {item.quantity}
                    </span>
                  </div>
                  <span className="text-text-dark font-bold shrink-0">
                    {(item.price * item.quantity).toFixed(2)} MAD
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200/60 pt-4 flex justify-between items-center">
              <span className="text-xs font-bold text-text-dark uppercase tracking-wider">Total</span>
              <span className="text-base font-bold text-gold-dark">
                {order.totalAmount.toFixed(2)} MAD
              </span>
            </div>
          </div>

          {/* Call-to-actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={`https://wa.me/212600000000?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-4 px-8 rounded-xl uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <MessageCircle className="w-5 h-5" /> Suivre ma commande sur WhatsApp
            </a>
            
            <Link
              href="/"
              className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold py-4 px-8 rounded-xl uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
            >
              Continuer mes achats <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
