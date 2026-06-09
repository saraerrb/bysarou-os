"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Phone, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";

export const Header: React.FC = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Robes", href: "/collections/Dress" },
    { name: "Ensembles", href: "/collections/Set" },
    { name: "Tops", href: "/collections/Top" },
    { name: "Pantalons", href: "/collections/Bottom" },
  ];

  return (
    <header className="w-full z-40">
      {/* Premium Announcement Bar */}
      <div className="bg-gold text-white text-xs font-semibold py-2.5 px-4 tracking-wider flex justify-center items-center gap-6 overflow-hidden">
        <span className="flex items-center gap-1.5 shrink-0">
          <Truck className="w-3.5 h-3.5" /> LIVRAISON GRATUITE SUR TOUT LE MAROC
        </span>
        <span className="hidden md:flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" /> PAIEMENT À LA LIVRAISON (COD)
        </span>
        <span className="hidden lg:flex items-center gap-1.5 shrink-0">
          <Phone className="w-3.5 h-3.5" /> ASSISTANCE CLIENT 7J/7
        </span>
      </div>

      {/* Main Header Container */}
      <nav className="w-full bg-white/90 backdrop-blur-md border-b border-gold/10 sticky top-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-text-dark hover:text-gold transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Luxury Serif Logo */}
          <div className="flex-1 md:flex-initial text-center md:text-left">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-widest text-text-dark group-hover:text-gold transition-colors">
                BY SAROU
              </span>
              <span className="block text-[9px] uppercase tracking-[0.3em] text-gold text-center md:text-left font-sans font-semibold">
                Haute Couture
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-sans text-xs uppercase tracking-widest font-semibold hover-underline transition-colors py-2 ${
                    isActive ? "text-gold font-bold" : "text-text-dark/85 hover:text-gold"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Utility Icons */}
          <div className="flex items-center space-x-4">
            <a
              href="https://wa.me/212600000000" // Placeholder phone number, standard MENA customer contact format
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-text-dark hover:text-gold transition-colors border border-gold/20 px-3 py-1.5 rounded-full"
            >
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              WhatsApp
            </a>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-text-dark hover:text-gold transition-colors group"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5.5 h-5.5 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm animate-scale-up">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu (Drawer overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Menu Drawer */}
          <div className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300 transform ease-out">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <span className="font-serif text-xl font-bold tracking-widest text-text-dark">
                  BY SAROU
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-text-dark hover:text-gold"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`font-sans text-sm uppercase tracking-wider font-semibold py-2 transition-colors ${
                        isActive ? "text-gold pl-2 border-l-2 border-gold font-bold" : "text-text-dark hover:text-gold"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile Support Footer */}
            <div className="border-t border-gray-100 pt-6 mt-auto">
              <p className="text-xs text-gray-500 mb-3">Besoin d'aide ? Contactez-nous</p>
              <a
                href="https://wa.me/212600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
              >
                Commander par WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
