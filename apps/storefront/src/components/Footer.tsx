import React from "react";
import Link from "next/link";
import { Phone, Mail, Clock, ShieldCheck, HelpCircle } from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-text-dark text-white pt-16 pb-8 border-t border-gold/15 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-white/5">
        {/* Brand Editorial Info */}
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-bold tracking-widest text-gold-light">
            BY SAROU
          </h3>
          <p className="text-[11px] uppercase tracking-[0.25em] text-gold-light/75 font-semibold">
            Haute Couture
          </p>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm pt-2">
            Maison de couture marocaine alliant l'élégance intemporelle des matières nobles aux coupes contemporaines pour sublimer la femme moderne d'aujourd'hui.
          </p>
          <div className="flex gap-4 pt-2">
            <span className="text-[10px] uppercase font-bold text-gold-light/90 tracking-wider flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-gold/10">
              🇲🇦 Conçu au Maroc
            </span>
          </div>
        </div>

        {/* Dynamic Collections Quicklinks */}
        <div className="space-y-4">
          <h4 className="font-serif text-sm font-semibold tracking-wider text-white">
            Collections
          </h4>
          <ul className="space-y-2.5 text-xs text-gray-400">
            <li>
              <Link href="/collections/Dress" className="hover:text-gold-light hover:pl-1 transition-all duration-300">
                Robes de Soirée
              </Link>
            </li>
            <li>
              <Link href="/collections/Set" className="hover:text-gold-light hover:pl-1 transition-all duration-300">
                Ensembles Chic
              </Link>
            </li>
            <li>
              <Link href="/collections/Top" className="hover:text-gold-light hover:pl-1 transition-all duration-300">
                Tops & Chemises
              </Link>
            </li>
            <li>
              <Link href="/collections/Bottom" className="hover:text-gold-light hover:pl-1 transition-all duration-300">
                Pantalons & Bas
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care / Support */}
        <div className="space-y-4">
          <h4 className="font-serif text-sm font-semibold tracking-wider text-white">
            Service Client
          </h4>
          <ul className="space-y-3 text-xs text-gray-400">
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-gold-light shrink-0" />
              <span>+212 6 00 00 00 00</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gold-light shrink-0" />
              <span>support@bysarou.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gold-light shrink-0" />
              <span>Lun - Dim: 09:00 - 21:00</span>
            </li>
          </ul>
        </div>

        {/* Value Badges Info */}
        <div className="space-y-4">
          <h4 className="font-serif text-sm font-semibold tracking-wider text-white">
            Nos Garanties
          </h4>
          <div className="space-y-3">
            <div className="flex gap-2.5 items-start">
              <ShieldCheck className="w-4 h-4 text-gold-light shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-semibold text-gray-200">COD (Paiement Cash)</h5>
                <p className="text-[10px] text-gray-400 mt-0.5">Payez en espèces à la livraison, après examen de l'article.</p>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <HelpCircle className="w-4 h-4 text-gold-light shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-semibold text-gray-200">Support Client Express</h5>
                <p className="text-[10px] text-gray-400 mt-0.5">Notre équipe WhatsApp répond à toutes vos questions en moins de 15 min.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom copyright & Trust marks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[11px] text-gray-500">
          &copy; {currentYear} BY SAROU. Tous droits réservés. Réalisé avec excellence.
        </p>
        
        <div className="flex items-center gap-3">
          <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
            Modes de paiement sécurisés:
          </span>
          <span className="text-xs bg-white/5 border border-white/10 text-gray-300 font-bold px-2 py-1 rounded">
            COD
          </span>
          <span className="text-xs bg-white/5 border border-white/10 text-gray-300 font-bold px-2 py-1 rounded">
            WhatsApp Order
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
