"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Menu } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, dir } = useLanguage();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) setUser(data.user);
      });
  }, []);

  const navItems = [
    { label: t("nav.overview"), href: "/" },
    { label: t("nav.orders"), href: "/orders" },
    { label: t("nav.confirmation"), href: "/confirmation" },
    { label: t("nav.inventory"), href: "/inventory" },
    { label: t("nav.finance"), href: "/finance" },
    { label: t("nav.insights"), href: "/analytics" },
    { label: t("nav.settings"), href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md" dir={dir}>
      {/* Top Bar - Exact Port from Mockup */}
      <header className="bg-surface sticky top-0 z-50 flex justify-between items-center w-full px-margin-desktop py-4 border-b border-outline-variant/30 shadow-sm backdrop-blur-md bg-surface/90">
        <div className="flex items-center gap-4">
          <button 
            className="text-primary hover:opacity-70 transition-all md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="font-headline-md text-2xl tracking-tighter text-primary uppercase">{t("nav.brand")}</h1>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-8">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`font-label-caps text-[11px] transition-colors tracking-widest ${isActive ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary"}`}
                >
                  {item.label.toUpperCase()}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline-variant">
            {user?.image ? (
              <img alt="User" className="w-full h-full object-cover" src={user.image} />
            ) : (
              <User size={18} className="text-primary" />
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="absolute top-0 left-0 h-full w-[280px] bg-white p-8 space-y-12 shadow-2xl animate-in slide-in-from-left duration-300">
            <h1 className="font-headline-md text-2xl tracking-tighter text-primary uppercase border-b border-outline-variant/30 pb-4">{t("nav.brand").split(" ")[0]}</h1>
            <nav className="flex flex-col gap-6">
              {navItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`font-label-caps text-[12px] transition-colors tracking-[0.2em] ${isActive ? "text-primary font-bold" : "text-on-surface-variant"}`}
                  >
                    {item.label.toUpperCase()}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="min-h-[calc(100vh-72px)]">
        {children}
      </main>

      {/* Mobile Navigation (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-6 py-4 bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 z-50">
        {navItems.slice(0, 4).map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 ${isActive ? "text-primary" : "text-on-surface-variant/70"}`}
            >
              <span className="font-label-caps text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
