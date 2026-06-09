"use client";

import { useState, useEffect } from "react";
import { 
  Store, 
  Package, 
  ShoppingCart, 
  Truck, 
  Bell, 
  CreditCard, 
  Languages, 
  Save, 
  Loader2,
  Settings as SettingsIcon,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

type Section = "general" | "inventory" | "orders" | "shipping" | "notifications" | "billing" | "language" | "integrations";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: "success" | "error", message: string } | null>(null);
  const { t, setLanguage } = useLanguage();

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        // Handled silently for premium feel
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSync = async () => {
    if (!settings.googleSheetUrl) return;
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch("/api/integrations/google-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: settings.googleSheetUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus({ type: "success", message: `${t("settings.syncSuccess")}: ${data.created} ${t("nav.orders")} / ${data.updated} variants` });
      } else {
        setSyncStatus({ type: "error", message: data.error || t("settings.syncError") });
      }
    } catch (error) {
      setSyncStatus({ type: "error", message: t("settings.syncError") });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const sections = [
    { id: "general", label: t("settings.generalIdentity"), icon: Store },
    { id: "inventory", label: t("settings.assetRules"), icon: Package },
    { id: "orders", label: t("settings.transactionLogic"), icon: ShoppingCart },
    { id: "shipping", label: t("settings.logisticalGrid"), icon: Truck },
    { id: "notifications", label: t("settings.communication"), icon: Bell },
    { id: "integrations", label: t("settings.integrationsTitle"), icon: Zap },
    { id: "billing", label: t("settings.subscription"), icon: CreditCard },
    { id: "language", label: t("settings.localization"), icon: Languages },
  ];

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-12">
      {/* Settings Header */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-4">
            <span className="font-label-caps text-primary tracking-[0.2em] uppercase text-xs">{t("settings.systemConfig")}</span>
            <h1 className="font-display-xl text-[64px] leading-tight text-on-surface">{t("settings.title")}</h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed italic">
              {t("settings.subtitle")}
            </p>
          </div>
          <button 
            className="bg-primary text-white px-12 py-4 font-label-caps text-[11px] flex items-center gap-3 hover:opacity-90 transition-all shadow-lg tracking-widest" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {t("settings.archiveChanges")}</>}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Navigation Grid */}
        <aside className="lg:col-span-3 space-y-2">
          {sections.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id as Section)}
                className={`w-full flex items-center gap-4 px-6 py-4 border transition-all duration-300 ${isActive ? "bg-primary text-white border-primary luxury-card-shadow" : "bg-white text-on-surface-variant border-outline-variant/30 hover:border-primary/50"}`}
              >
                <Icon size={16} />
                <span className="font-label-caps text-[10px] tracking-widest text-left uppercase">{s.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
              </button>
            );
          })}
          
          <div className="mt-12 p-6 bg-surface-container/30 border border-dashed border-outline-variant/50">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-primary" size={16} />
              <span className="font-label-caps text-[9px] text-primary tracking-widest">{t("settings.systemIntegrity")}</span>
            </div>
            <p className="text-[10px] font-body-md text-on-surface-variant leading-relaxed">
              {t("settings.integrityNote")}
            </p>
          </div>
        </aside>

        {/* Configuration Matrix */}
        <div className="lg:col-span-9 bg-white p-12 hairline-border luxury-card-shadow min-h-[600px]">
          {activeSection === "general" && (
            <div className="space-y-12 fade-in">
              <div className="border-b border-outline-variant/10 pb-8">
                <h2 className="font-headline-md text-3xl mb-2 text-on-surface">{t("settings.generalTitle")}</h2>
                <p className="font-body-md text-on-surface-variant italic text-sm">{t("settings.generalDesc")}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest">{t("settings.storeDesignation")}</label>
                  <input type="text" className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none transition-all font-body-md text-sm" value={settings.storeName || ""} onChange={(e) => updateSetting("storeName", e.target.value)} />
                </div>
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest">{t("settings.baseCurrency")}</label>
                  <input type="text" className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none transition-all font-body-md text-sm" value={settings.currency || ""} onChange={(e) => updateSetting("currency", e.target.value)} />
                </div>
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest">{t("settings.chronoZone")}</label>
                  <input type="text" className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none transition-all font-body-md text-sm" value={settings.timezone || ""} onChange={(e) => updateSetting("timezone", e.target.value)} />
                </div>
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest">{t("settings.countryOp")}</label>
                  <input type="text" className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none transition-all font-body-md text-sm" value={settings.country || ""} onChange={(e) => updateSetting("country", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {activeSection === "inventory" && (
            <div className="space-y-12 fade-in">
              <div className="border-b border-outline-variant/10 pb-8">
                <h2 className="font-headline-md text-3xl mb-2 text-on-surface">{t("settings.assetRulesTitle")}</h2>
                <p className="font-body-md text-on-surface-variant italic text-sm">{t("settings.assetRulesDesc")}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest">{t("settings.lowStockThreshold")}</label>
                  <input type="number" className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none transition-all font-body-md text-sm" value={settings.lowStockAlert || 0} onChange={(e) => updateSetting("lowStockAlert", parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest">{t("settings.skuPrefix")}</label>
                  <input type="text" className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none transition-all font-body-md text-sm" value={settings.skuPrefix || ""} onChange={(e) => updateSetting("skuPrefix", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {activeSection === "orders" && (
            <div className="space-y-12 fade-in">
              <div className="border-b border-outline-variant/10 pb-8">
                <h2 className="font-headline-md text-3xl mb-2 text-on-surface">Transaction Logic</h2>
                <p className="font-body-md text-on-surface-variant italic text-sm">Configure default behaviors for order processing and status workflows.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest">Default Shipping Cost (MAD)</label>
                  <input type="number" className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none transition-all font-body-md text-sm" value={settings.defaultShipping || 0} onChange={(e) => updateSetting("defaultShipping", parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest">Free Shipping Over (MAD)</label>
                  <input type="number" className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none transition-all font-body-md text-sm" value={settings.freeShippingOver || ""} onChange={(e) => updateSetting("freeShippingOver", parseFloat(e.target.value) || null)} placeholder="Leave empty for no threshold" />
                </div>
              </div>
            </div>
          )}

          {activeSection === "shipping" && (
            <div className="space-y-12 fade-in">
              <div className="border-b border-outline-variant/10 pb-8">
                <h2 className="font-headline-md text-3xl mb-2 text-on-surface">Logistical Grid</h2>
                <p className="font-body-md text-on-surface-variant italic text-sm">Configure WhatsApp notifications and shipping carrier defaults.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest">WhatsApp Notifications</label>
                  <div className="flex items-center gap-4">
                    <button
                      className={`px-6 py-3 border font-label-caps text-[10px] tracking-widest transition-all ${settings.whatsappEnabled ? "bg-primary text-white border-primary" : "bg-white text-on-surface-variant border-outline-variant/30"}`}
                      onClick={() => updateSetting("whatsappEnabled", !settings.whatsappEnabled)}
                    >
                      {settings.whatsappEnabled ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest">WhatsApp Number</label>
                  <input type="text" className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none transition-all font-body-md text-sm" value={settings.whatsappNumber || ""} onChange={(e) => updateSetting("whatsappNumber", e.target.value)} placeholder="+212 6XX XXX XXX" disabled={!settings.whatsappEnabled} />
                </div>
              </div>
            </div>
          )}

          {activeSection === "billing" && (
            <div className="space-y-12 fade-in flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-8">
                <Zap className="text-primary" size={40} />
              </div>
              <div className="text-center space-y-6">
                <span className="bg-primary text-white px-4 py-1 font-label-caps text-[9px] tracking-widest">{t("settings.executivePlan")}</span>
                <h2 className="font-headline-md text-[48px] text-on-surface">399 <span className="text-xl font-body-md text-outline">{t("settings.perMonth")}</span></h2>
                <p className="font-body-md text-on-surface-variant italic max-w-sm">{t("settings.licenseActive")}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 w-full max-w-md mt-16">
                <div className="p-8 bg-surface-container/30 border border-outline-variant/20 text-center">
                  <span className="font-label-caps text-[9px] text-outline uppercase block mb-2">{t("settings.transactionLimit")}</span>
                  <p className="font-headline-md text-2xl">{t("settings.unlimited")}</p>
                </div>
                <div className="p-8 bg-surface-container/30 border border-outline-variant/20 text-center">
                  <span className="font-label-caps text-[9px] text-outline uppercase block mb-2">{t("settings.vaultStorage")}</span>
                  <p className="font-headline-md text-2xl">50 GB</p>
                </div>
              </div>
            </div>
          )}
          {activeSection === "integrations" && (
            <div className="space-y-12 fade-in">
              <div className="border-b border-outline-variant/10 pb-8">
                <h2 className="font-headline-md text-3xl mb-2 text-on-surface">{t("settings.integrationsTitle")}</h2>
                <p className="font-body-md text-on-surface-variant italic text-sm">{t("settings.integrationsDesc")}</p>
              </div>

              <div className="bg-surface-container/20 p-8 border border-outline-variant/30 luxury-card-shadow">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Globe className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-headline-md text-xl">{t("settings.googleSheetsSync")}</h3>
                    <p className="text-xs text-on-surface-variant italic">{t("settings.shareNote")}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest">{t("settings.sheetUrl")}</label>
                    <input 
                      type="text" 
                      placeholder={t("settings.sheetUrlPlaceholder")}
                      className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none transition-all font-body-md text-sm" 
                      value={settings.googleSheetUrl || ""} 
                      onChange={(e) => updateSetting("googleSheetUrl", e.target.value)} 
                    />
                  </div>

                  <button 
                    onClick={handleSync}
                    disabled={syncing || !settings.googleSheetUrl}
                    className="w-full bg-on-surface text-white py-4 font-label-caps text-[11px] tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                  >
                    {syncing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                    {syncing ? t("settings.syncing") : t("settings.syncNow")}
                  </button>

                  {syncStatus && (
                    <div className={`p-4 font-label-caps text-[10px] tracking-widest flex items-center gap-3 ${syncStatus.type === "success" ? "bg-green-500/10 text-green-700 border border-green-500/20" : "bg-error/5 text-error border border-error/20"}`}>
                      {syncStatus.type === "success" ? <ShieldCheck size={16} /> : <SettingsIcon size={16} />}
                      {syncStatus.message.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "language" && (
            <div className="space-y-12 fade-in">
              <div className="border-b border-outline-variant/10 pb-8">
                <h2 className="font-headline-md text-3xl mb-2 text-on-surface">{t("settings.localizationTitle")}</h2>
                <p className="font-body-md text-on-surface-variant italic text-sm">{t("settings.localizationDesc")}</p>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {["en", "fr", "ar"].map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      updateSetting("language", lang);
                      setLanguage(lang as any);
                    }}
                    className={`p-10 border transition-all duration-300 flex flex-col items-center gap-4 ${settings.language === lang ? "bg-primary text-white border-primary" : "bg-white text-on-surface-variant border-outline-variant/30 hover:border-primary/50"}`}
                  >
                    <Globe size={24} className={settings.language === lang ? "text-white" : "text-primary opacity-40"} />
                    <span className="font-label-caps text-[11px] tracking-widest">
                      {lang === "en" ? "ENGLISH" : lang === "fr" ? "FRANÇAIS" : "العربية"}
                    </span>
                  </button>
                ))}
              </div>
              {settings.language === "ar" && (
                <div className="p-8 bg-primary/5 border border-primary/20 flex items-center gap-4">
                  <Zap className="text-primary" size={20} />
                  <p className="font-body-md text-sm text-primary font-bold uppercase tracking-tighter">{t("settings.rtlEngaged")}</p>
                </div>
              )}

              <div className="pt-8 border-t border-outline-variant/10 space-y-8">
                <h3 className="font-headline-md text-xl text-on-surface">Regionalization Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-3">
                    <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest">{t("settings.chronoZone")}</label>
                    <select 
                      className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none font-body-md text-sm" 
                      value={settings.timezone || "Africa/Casablanca"} 
                      onChange={(e) => updateSetting("timezone", e.target.value)}
                    >
                      <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
                      <option value="Europe/Paris">Europe/Paris (CET)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="America/New_York">America/New_York (EST/EDT)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest">{t("settings.countryOp")}</label>
                    <select 
                      className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none font-body-md text-sm" 
                      value={settings.country || "Morocco"} 
                      onChange={(e) => updateSetting("country", e.target.value)}
                    >
                      <option value="Morocco">Morocco</option>
                      <option value="France">France</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="py-20 text-center">
        <span className="font-label-caps text-[10px] tracking-[0.5em] text-outline uppercase">{t("settings.systemCore")}</span>
      </footer>

      <style jsx global>{`
        .font-display-xl { font-family: var(--font-noto-serif), serif; }
        .font-headline-md { font-family: var(--font-noto-serif), serif; }
        .font-data-mono { font-family: var(--font-data-mono), monospace; }
      `}</style>
    </main>
  );
}
