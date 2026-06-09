"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Package, 
  ShoppingCart, 
  CheckCircle, 
  RotateCcw
} from "lucide-react";
import { Search, Filter, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error || !data || !data.summary) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
        <AlertTriangle size={48} className="text-error" />
        <h2 className="text-2xl font-headline-md">{t("common.operationalFault")}</h2>
        <p className="text-on-surface-variant">{t("common.syncError")}</p>
        <button className="bg-primary text-white px-8 py-3 font-label-caps text-[11px]" onClick={() => window.location.reload()}>{t("common.retry")}</button>
      </div>
    );
  }

  const { summary, insights } = data;
  const revenue = summary.totalRevenue || 0;
  const profit = summary.estimatedProfit || 0;
  const avgOrderValue = summary.totalOrders > 0 ? (revenue / summary.totalOrders) : 0;

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-12">
      {/* Hero Section */}
      <section className="mb-section-gap">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-4">
            <span className="font-label-caps text-primary tracking-[0.2em] uppercase text-xs">{t("dashboard.systemLabel")}</span>
            <h1 className="font-display-xl text-[64px] leading-tight text-on-surface">{t("dashboard.title")}</h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed italic">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-primary/5 border border-primary/20 px-8 py-4 luxury-card-shadow">
              <span className="font-label-caps text-[10px] text-primary block mb-1">{t("dashboard.systemStatus")}</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-data-mono text-sm font-semibold">{t("dashboard.synchronized")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Statistics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-section-gap">
        {/* Gross Revenue */}
        <div className="bg-white p-10 hairline-border luxury-card-shadow group hover:border-primary transition-all duration-500">
          <div className="flex justify-between items-start mb-12">
            <span className="font-label-caps text-[11px] text-primary">{t("dashboard.grossRevenue")}</span>
            <DollarSign className="text-primary opacity-30 group-hover:opacity-100 transition-opacity" size={20} />
          </div>
          <div className="space-y-1">
            <p className="font-headline-lg text-[40px] text-on-surface">{revenue.toLocaleString()} <span className="text-xl font-body-md text-outline">{t("common.currency")}</span></p>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp size={14} />
              <span className="font-data-mono text-xs">{t("dashboard.revenueChange")}</span>
            </div>
          </div>
        </div>

        {/* Operational Profit */}
        <div className="bg-white p-10 hairline-border luxury-card-shadow group hover:border-primary transition-all duration-500">
          <div className="flex justify-between items-start mb-12">
            <span className="font-label-caps text-[11px] text-primary">{t("dashboard.netProfit")}</span>
            <TrendingUp className="text-primary opacity-30 group-hover:opacity-100 transition-opacity" size={20} />
          </div>
          <div className="space-y-1">
            <p className="font-headline-lg text-[40px] text-on-surface">{profit.toLocaleString()} <span className="text-xl font-body-md text-outline">{t("common.currency")}</span></p>
            <p className="font-body-md text-xs text-on-surface-variant">{t("dashboard.profitNote")}</p>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white p-10 hairline-border luxury-card-shadow group hover:border-primary transition-all duration-500">
          <div className="flex justify-between items-start mb-12">
            <span className="font-label-caps text-[11px] text-primary">{t("dashboard.avgTransaction")}</span>
            <Package className="text-primary opacity-30 group-hover:opacity-100 transition-opacity" size={20} />
          </div>
          <div className="space-y-1">
            <p className="font-headline-lg text-[40px] text-on-surface">{avgOrderValue.toFixed(0)} <span className="text-xl font-body-md text-outline">{t("common.currency")}</span></p>
            <p className="font-body-md text-xs text-on-surface-variant">{t("dashboard.transactionNote")}</p>
          </div>
        </div>
      </section>

      {/* Strategic Insights & Order Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-section-gap">
        {/* Strategic Insights */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6">
            <h2 className="font-headline-md text-3xl">{t("dashboard.strategicInsights")}</h2>
            <Link href="/analytics" className="font-label-caps text-[10px] text-primary flex items-center gap-2 hover:gap-4 transition-all">
              {t("dashboard.expandedAnalysis")} <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-primary/5 p-8 hairline-border group hover:bg-white transition-all duration-500">
              <span className="font-label-caps text-[10px] text-primary block mb-4">{t("dashboard.inventoryFluidity")}</span>
              <h3 className="font-headline-md text-xl mb-4">{t("dashboard.topPerforming")}</h3>
              <ul className="space-y-4">
                {insights?.bestSellers?.products?.slice(0, 3).map((item: any, i: number) => (
                  <li key={i} className="flex justify-between items-center text-sm border-b border-outline-variant/10 pb-2">
                    <span className="text-on-surface-variant">{item.name}</span>
                    <span className="font-data-mono font-bold">{item.quantity} {t("dashboard.units")}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-surface-container p-8 hairline-border border-dashed">
              <span className="font-label-caps text-[10px] text-outline block mb-4">{t("dashboard.logisticalAdvisory")}</span>
              <h3 className="font-headline-md text-xl mb-4">{t("dashboard.operationalPulse")}</h3>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed mb-6">
                {t("dashboard.pulseDescription")}
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white text-[10px] font-label-caps text-primary border border-primary/20">{t("dashboard.regional")}</span>
                <span className="px-3 py-1 bg-white text-[10px] font-label-caps text-primary border border-primary/20">{t("dashboard.highVolume")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Lifecycle Pulse */}
        <div className="lg:col-span-4 bg-white hairline-border luxury-card-shadow p-10">
          <h2 className="font-label-caps text-xs text-primary mb-12 tracking-widest">{t("dashboard.orderLifecycle")}</h2>
          <div className="space-y-10">
            {[
              { label: t("dashboard.newArrivals"), value: summary.totalOrders || 0, icon: ShoppingCart, color: "primary" },
              { label: t("dashboard.confirmed"), value: summary.confirmedOrders || 0, icon: CheckCircle, color: "primary" },
              { label: t("dashboard.returned"), value: summary.returnedOrders || 0, icon: RotateCcw, color: "error" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-${stat.color}/5 flex items-center justify-center group-hover:bg-${stat.color}/10 transition-colors`}>
                    <stat.icon className={`text-${stat.color}`} size={18} />
                  </div>
                  <span className="font-label-caps text-[11px] text-on-surface-variant group-hover:text-on-surface transition-colors">{stat.label}</span>
                </div>
                <span className="font-headline-md text-2xl group-hover:translate-x-[-4px] transition-transform">{stat.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-8 border-t border-outline-variant/30 text-center">
            <Link href="/orders" className="bg-surface-container-high w-full py-4 block font-label-caps text-[10px] hover:bg-primary hover:text-white transition-all">
              {t("dashboard.accessRegistry")}
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-20 border-t border-outline-variant/10 text-center space-y-4">
        <div className="font-label-caps text-[10px] tracking-[0.5em] text-outline">{t("dashboard.footerBrand")}</div>
        <div className="text-[10px] font-data-mono text-outline-variant uppercase">{t("dashboard.footerCopyright")}</div>
      </footer>
    </main>
  );
}
