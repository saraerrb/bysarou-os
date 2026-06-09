"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User as UserIcon, Loader2, ArrowRight, ShieldCheck, Verified } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import { useLanguage } from "@/lib/i18n/language-context";

export default function LoginPage() {
  const router = useRouter();
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch("/api/users/check-setup");
        const data = await res.json();
        if (!data.hasAdmin) setIsFirstSetup(true);
      } catch (err) {}
    };
    checkSetup();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isFirstSetup ? "/api/auth/register-admin" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (isFirstSetup) {
          setIsFirstSetup(false);
          setFormData({ ...formData, password: "" });
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        setError(data.error || t("login.authFailed"));
      }
    } catch (err) {
      setError(t("login.syncFailure"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full -mr-96 -mt-96 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full -ml-72 -mb-72 blur-3xl"></div>

        <div className="w-full max-w-[480px] z-10">
          {/* Header Branding */}
          <div className="text-center mb-16 space-y-4">
            <span className="font-label-caps text-primary tracking-[0.4em] uppercase text-[10px]">{t("login.brand")}</span>
            <h1 className="font-display-xl text-[56px] leading-tight text-on-surface">{t("login.title")}</h1>
            <p className="font-body-lg text-on-surface-variant italic leading-relaxed">
              {t("login.subtitle")}
            </p>
          </div>

          {/* Login Artifact */}
          <div className="bg-white p-12 hairline-border luxury-card-shadow relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20"></div>
            
            {error && (
              <div className="mb-8 p-4 bg-error/5 border border-error/20 text-error text-xs font-label-caps flex items-center gap-3">
                <AlertTriangle size={16} />
                {error.toUpperCase()}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {isFirstSetup && (
                <div className="space-y-2">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">{t("login.fullIdentity")}</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 pl-8 outline-none transition-all font-body-md text-sm"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t("login.identityPlaceholder")}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">{t("login.accessEmail")}</label>
                <div className="relative group">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 pl-8 outline-none transition-all font-body-md text-sm"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t("login.emailPlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">{t("login.cipherToken")}</label>
                <div className="relative group">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 pl-8 outline-none transition-all font-body-md text-sm"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  className="w-full bg-primary text-white py-5 font-label-caps text-[12px] tracking-[0.3em] shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      {isFirstSetup ? t("login.initializeSystem") : t("login.authorizeAccess")} 
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Branding */}
          <div className="mt-16 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-outline-variant text-[10px] font-label-caps tracking-tighter">
              <Verified size={14} />
              {t("login.encryptedChannel")}
            </div>
            <p className="text-[10px] font-data-mono text-outline uppercase tracking-widest opacity-40">
              {t("login.footerBrand")}
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .font-display-xl { font-family: var(--font-noto-serif), serif; }
        .font-headline-md { font-family: var(--font-noto-serif), serif; }
      `}</style>
    </ClientOnly>
  );
}

import { AlertTriangle } from "lucide-react";
