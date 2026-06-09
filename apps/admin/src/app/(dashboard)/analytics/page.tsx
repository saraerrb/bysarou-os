"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Truck, 
  AlertCircle, 
  Download, 
  Loader2,
  RotateCcw,
  BarChart3,
  Globe,
  Zap,
  ArrowUpRight
} from "lucide-react";
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
} from "recharts";
import Link from "next/link";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dateRange, setDateRange] = useState("30");
  const [mounted, setMounted] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/analytics?days=${dateRange}`);
      if (!res.ok) throw new Error("Analytics fetch failed");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
  }, [dateRange]);

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
        <AlertCircle size={48} className="text-error" />
        <h2 className="font-headline-md text-2xl text-on-surface">Intelligence Stream Offline</h2>
        <p className="text-on-surface-variant italic">Unable to synchronize with historical commerce archives.</p>
        <button className="bg-primary text-white px-8 py-3 font-label-caps text-[11px]" onClick={() => fetchAnalytics()}>RETRY SYNC</button>
      </div>
    );
  }

  const rates = data.rates || { confirmationRate: 0, deliverySuccessRate: 0, returnRate: 0, fakeRate: 0 };
  const timeline = data.timeline || [];
  const cities = data.cities || [];
  const products = data.products || [];
  const deadStock = data.deadStock || [];

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-12">
      {/* Intelligence Header */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-4">
            <span className="font-label-caps text-primary tracking-[0.2em] uppercase text-xs">BUSINESS INTELLIGENCE</span>
            <h1 className="font-display-xl text-[64px] leading-tight text-on-surface">Operational Insights</h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed italic">
              Longitudinal analysis of your commerce performance through the BySarou intelligence grid.
            </p>
          </div>
          <div className="flex gap-4">
            <select 
              className="bg-white border border-outline-variant px-6 py-4 font-label-caps text-[10px] tracking-widest outline-none hover:border-primary transition-all"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7">LAST 7 CYCLES</option>
              <option value="30">QUARTERLY (30D)</option>
              <option value="90">SEASONAL (90D)</option>
              <option value="365">ANNUAL ARCHIVE</option>
            </select>
            <button className="bg-primary text-white p-4 luxury-card-shadow hover:opacity-90">
              <Download size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* KPI Matrix */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {[
          { label: "CONFIRMATION YIELD", value: rates.confirmationRate, icon: Zap, color: "primary" },
          { label: "LOGISTICAL SUCCESS", value: rates.deliverySuccessRate, icon: Truck, color: "primary" },
          { label: "RECLAMATION RATE", value: rates.returnRate, icon: RotateCcw, color: "error" },
          { label: "AUTHENTICITY FAULT", value: rates.fakeRate, icon: AlertCircle, color: "outline" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-8 hairline-border luxury-card-shadow group hover:border-primary transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <kpi.icon size={14} className={`text-${kpi.color}`} />
              <span className="font-label-caps text-[10px] text-outline uppercase tracking-widest">{kpi.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <p className="font-headline-md text-[36px] text-on-surface">{(Number(kpi.value) || 0).toFixed(1)}%</p>
              <div className="w-16 h-1 bg-surface-container overflow-hidden rounded-full mb-3">
                <div 
                  className={`h-full bg-${kpi.color} transition-all duration-1000`} 
                  style={{ width: `${Math.min(Number(kpi.value) || 0, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Primary Visualizations */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
        {/* Revenue Velocity */}
        <div className="lg:col-span-8 bg-white p-10 hairline-border luxury-card-shadow">
          <div className="flex items-center justify-between mb-12">
            <h3 className="font-headline-md text-2xl">Revenue Velocity</h3>
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp size={16} />
              <span className="font-data-mono text-xs font-bold uppercase tracking-widest">Optimized Growth</span>
            </div>
          </div>
          <div className="h-[400px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--color-outline-variant)" opacity={0.1} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--color-outline)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    fontFamily="var(--font-data-mono)"
                  />
                  <YAxis 
                    stroke="var(--color-outline)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    fontFamily="var(--font-data-mono)"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: "var(--color-surface)", 
                      border: "1px solid var(--color-outline-variant)", 
                      borderRadius: "0",
                      fontFamily: "var(--font-data-mono)",
                      fontSize: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-surface-container/10 flex items-center justify-center border border-dashed border-outline-variant/30">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            )}
          </div>
        </div>

        {/* Regional Density */}
        <div className="lg:col-span-4 bg-white p-10 hairline-border luxury-card-shadow">
          <div className="flex items-center justify-between mb-12">
            <h3 className="font-headline-md text-2xl">Regional Density</h3>
            <Globe className="text-primary opacity-30" size={20} />
          </div>
          <div className="space-y-8">
            {cities.slice(0, 6).map((city: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between font-label-caps text-[10px]">
                  <span className="text-on-surface uppercase tracking-widest">{city.name}</span>
                  <span className="text-primary font-bold">{city.value} UNITS</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${(city.value / cities[0].value) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-8 border-t border-outline-variant/30 text-center">
            <Link href="/orders" className="font-label-caps text-[10px] text-primary hover:gap-4 transition-all flex items-center justify-center gap-2">
              EXPAND GEOGRAPHICAL DATA <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Asset Performance & Operational Faults */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Top Assets */}
        <div className="lg:col-span-8 bg-white p-10 hairline-border luxury-card-shadow">
          <h3 className="font-headline-md text-2xl mb-12">High-Yield Assets</h3>
          <div className="space-y-6">
            {products.slice(0, 5).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-6 bg-surface-container/30 hover:bg-white border border-transparent hover:border-outline-variant/30 transition-all duration-300">
                <div className="flex items-center gap-6">
                  <span className="font-data-mono text-xs text-outline">0{i+1}</span>
                  <p className="font-headline-md text-lg text-on-surface">{p.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-headline-md text-lg text-primary">{(p.value || 0).toLocaleString()} <span className="text-xs font-body-md">MAD</span></p>
                  <p className="font-label-caps text-[9px] text-outline uppercase tracking-widest">NET CONTRIBUTION</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stagnant Reserves */}
        <div className="lg:col-span-4 bg-white p-10 hairline-border luxury-card-shadow border-error/20">
          <div className="flex items-center gap-3 mb-10">
            <AlertCircle className="text-error" size={20} />
            <h3 className="font-headline-md text-2xl text-error">Stagnant Reserves</h3>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm italic leading-relaxed mb-10">
            Identified operational artifacts with zero movement in current period.
          </p>
          <div className="space-y-6">
            {deadStock.length === 0 ? (
              <div className="py-12 text-center bg-primary/5 p-8 border border-primary/20">
                <p className="font-label-caps text-[11px] text-primary uppercase tracking-widest">MAXIMUM FLUIDITY DETECTED</p>
              </div>
            ) : deadStock.slice(0, 5).map((v: any) => (
              <div key={v.sku} className="flex justify-between items-center py-4 border-b border-outline-variant/10">
                <span className="font-body-md text-sm text-on-surface-variant">{v.name}</span>
                <span className="font-data-mono text-xs font-bold text-error">{v.stock} PCS</span>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/inventory" className="w-full block text-center py-4 bg-surface-container font-label-caps text-[10px] hover:bg-error hover:text-white transition-all tracking-widest">
              CALIBRATE INVENTORY
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-20 text-center">
        <span className="font-label-caps text-[10px] tracking-[0.5em] text-outline uppercase">BySarou Intelligence Unit</span>
      </footer>

      <style jsx global>{`
        .font-display-xl { font-family: var(--font-noto-serif), serif; }
        .font-headline-md { font-family: var(--font-noto-serif), serif; }
        .font-data-mono { font-family: var(--font-data-mono), monospace; }
      `}</style>
    </main>
  );
}
