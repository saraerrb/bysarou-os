import React from "react";
import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import "./globals.css";

export const metadata: Metadata = {
  title: "BY SAROU | Haute Couture Marocaine",
  description: "Maison de haute couture marocaine. Sublimez votre style avec nos collections exclusives de robes de soirée, ensembles élégants, tops raffinés et pantalons chic. Paiement à la livraison (COD) et livraison gratuite dans tout le Maroc.",
  keywords: "by sarou, caftan marocain, robes de soirée maroc, ensembles chic maroc, boutique en ligne maroc, mode marocaine, vetements femmes maroc",
  openGraph: {
    title: "BY SAROU | Haute Couture Marocaine",
    description: "Découvrez l'élégance intemporelle de BY SAROU. Haute couture d'exception avec paiement à la livraison sécurisé.",
    url: "https://www-bysarou-com-shrine-theme-1-3-1.com",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased text-text-dark bg-white overflow-x-hidden">
        <CartProvider>
          {/* Main Layout Container */}
          <div className="flex flex-col min-h-screen">
            {/* Header Navigation */}
            <Header />

            {/* Main Content Area */}
            <main className="flex-1 w-full relative">
              {children}
            </main>

            {/* Footer */}
            <Footer />
          </div>

          {/* Persistent Sliding Cart Drawer */}
          <CartDrawer />

          {/* Sticky Luxury WhatsApp Float Widget */}
          <a
            href="https://wa.me/212600000000?text=Bonjour%20BY%20SAROU,%20je%20souhaite%20avoir%20plus%20d'informations%20sur%20vos%20collections."
            target="_blank"
            rel="noopener noreferrer"
            id="whatsapp-sticky-widget"
            className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300"
            title="Commander par WhatsApp"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 2.007 14.12 1.01 11.816 1.01c-5.437 0-9.863 4.371-9.867 9.801 0 1.764.49 3.493 1.42 5.011l-.988 3.606 3.666-.948zm12.39-5.138c-.318-.16-1.884-.93-2.176-1.037-.291-.106-.504-.16-.716.16-.212.32-.822 1.037-1.008 1.25-.186.213-.372.24-.69.08-.318-.16-1.342-.495-2.558-1.579-.945-.844-1.58-1.887-1.766-2.207-.186-.32-.02-.494.14-.653.143-.143.318-.373.477-.56.159-.186.213-.32.318-.533.106-.213.053-.4-.027-.56-.08-.16-.716-1.727-.981-2.36-.259-.623-.52-.538-.716-.548-.186-.01-.398-.01-.61-.01-.212 0-.557.08-.849.4-.292.32-1.114 1.093-1.114 2.667 0 1.573 1.146 3.093 1.306 3.307.159.213 2.25 3.434 5.452 4.815.762.329 1.357.525 1.82.673.765.243 1.462.209 2.013.127.614-.092 1.884-.772 2.15-1.517.265-.747.265-1.387.186-1.517-.08-.13-.292-.213-.61-.373z" />
            </svg>
          </a>
        </CartProvider>
      </body>
    </html>
  );
}
