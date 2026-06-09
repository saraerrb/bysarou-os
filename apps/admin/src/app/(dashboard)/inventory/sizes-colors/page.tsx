"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Save, Trash2, Edit2, TrendingUp, AlertCircle, X } from "lucide-react";
import Link from "next/link";
import type { SizeData, ColorData } from "@/types";

export default function SizesColorsPage() {
  const [activeTab, setActiveTab] = useState<"sizes" | "colors" | "analytics">("sizes");
  
  const [sizes, setSizes] = useState<SizeData[]>([]);
  const [colors, setColors] = useState<ColorData[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newSizeName, setNewSizeName] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sizesRes, colorsRes, analyticsRes] = await Promise.all([
        fetch("/api/sizes").then(r => r.json()),
        fetch("/api/colors").then(r => r.json()),
        fetch("/api/analytics/variants").then(r => r.json()),
      ]);
      setSizes(sizesRes);
      setColors(colorsRes);
      setAnalytics(analyticsRes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSize = async () => {
    if (!newSizeName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/sizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newSizeName.trim(),
          displayOrder: sizes.length + 1
        }),
      });
      if (res.ok) {
        setNewSizeName("");
        fetchData();
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDeleteSize = async (id: string) => {
    if (!confirm("Delete this size? Variants using it will revert to string matches.")) return;
    try {
      const res = await fetch(`/api/sizes/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const handleAddColor = async () => {
    if (!newColorName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newColorName.trim(),
          hexCode: newColorHex
        }),
      });
      if (res.ok) {
        setNewColorName("");
        setNewColorHex("#000000");
        fetchData();
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDeleteColor = async (id: string) => {
    if (!confirm("Delete this color? Variants using it will revert to string matches.")) return;
    try {
      const res = await fetch(`/api/colors/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-12">
      {/* Header & Navigation */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <span className="font-label-caps text-primary tracking-[0.2em] uppercase text-xs">ASSET ARCHITECTURE</span>
            <h1 className="font-display-xl text-[64px] leading-tight text-on-surface">Sizes & Colors</h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed italic">
              Define the physical dimensions and visual identity attributes for your commerce grid.
            </p>
          </div>
          <Link href="/inventory" className="bg-surface-container text-on-surface px-8 py-3 font-label-caps text-[11px] hover:bg-outline-variant transition-all">
            BACK TO ASSETS
          </Link>
        </div>

        <div className="flex gap-2 border-b border-outline-variant/30 overflow-x-auto no-scrollbar">
          {(["sizes", "colors", "analytics"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-label-caps text-[11px] tracking-widest uppercase transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {tab === "analytics" ? "Variant Analytics" : tab}
            </button>
          ))}
        </div>
      </section>

      <div className="fade-in">
        {/* SIZES TAB */}
        {activeTab === "sizes" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 bg-white p-10 hairline-border luxury-card-shadow">
              <h2 className="font-headline-md text-2xl mb-8">Dimensions Archive</h2>
              <div className="space-y-4">
                {sizes.map((size) => (
                  <div key={size.id} className="flex items-center justify-between p-4 bg-surface-container/30 border border-transparent hover:border-outline-variant/50 transition-all">
                    <div className="flex items-center gap-4">
                      <span className="font-data-mono text-xs text-outline">{size.displayOrder}</span>
                      <span className="font-headline-md text-xl">{size.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-label-caps px-3 py-1 ${size.active ? 'bg-primary/10 text-primary' : 'bg-surface-container text-outline'}`}>
                        {size.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                      <button onClick={() => handleDeleteSize(size.id)} className="text-outline hover:text-error transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {sizes.length === 0 && <p className="text-outline italic text-sm py-8 text-center">No dimensions logged.</p>}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-10 hairline-border luxury-card-shadow sticky top-24">
              <h3 className="font-label-caps text-[11px] text-primary tracking-widest uppercase mb-8">INITIALIZE DIMENSION</h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase">Size Label</label>
                  <input 
                    className="w-full bg-surface-container/30 border-b border-outline-variant/30 focus:border-primary py-3 px-2 outline-none font-headline-md" 
                    value={newSizeName} 
                    onChange={(e) => setNewSizeName(e.target.value)} 
                    placeholder="e.g. XL"
                    maxLength={10}
                  />
                </div>
                <button 
                  onClick={handleAddSize}
                  disabled={saving || !newSizeName}
                  className="w-full bg-primary text-white py-4 font-label-caps text-[11px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <><Plus size={16} /> ADD DIMENSION</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COLORS TAB */}
        {activeTab === "colors" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 bg-white p-10 hairline-border luxury-card-shadow">
              <h2 className="font-headline-md text-2xl mb-8">Colorways Archive</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {colors.map((color) => (
                  <div key={color.id} className="p-4 bg-surface-container/30 border border-transparent hover:border-outline-variant/50 transition-all flex flex-col items-center text-center gap-4 group">
                    <div className="w-16 h-16 rounded-full border border-outline-variant/30 shadow-inner relative" style={{ backgroundColor: color.hexCode }}>
                      <button onClick={() => handleDeleteColor(color.id)} className="absolute -top-2 -right-2 bg-white text-error rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div>
                      <p className="font-headline-md text-lg">{color.name}</p>
                      <p className="font-data-mono text-[10px] text-outline uppercase">{color.hexCode}</p>
                    </div>
                  </div>
                ))}
                {colors.length === 0 && <p className="text-outline italic text-sm py-8 col-span-full text-center">No colorways logged.</p>}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-10 hairline-border luxury-card-shadow sticky top-24">
              <h3 className="font-label-caps text-[11px] text-primary tracking-widest uppercase mb-8">INITIALIZE COLORWAY</h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase">Color Name</label>
                  <input 
                    className="w-full bg-surface-container/30 border-b border-outline-variant/30 focus:border-primary py-3 px-2 outline-none font-headline-md" 
                    value={newColorName} 
                    onChange={(e) => setNewColorName(e.target.value)} 
                    placeholder="e.g. Midnight Blue"
                  />
                </div>
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase">Hex Code</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      className="w-12 h-12 bg-transparent border-none cursor-pointer" 
                      value={newColorHex} 
                      onChange={(e) => setNewColorHex(e.target.value)} 
                    />
                    <input 
                      className="flex-grow bg-surface-container/30 border-b border-outline-variant/30 focus:border-primary py-3 px-2 outline-none font-data-mono text-sm uppercase" 
                      value={newColorHex} 
                      onChange={(e) => setNewColorHex(e.target.value)} 
                      maxLength={7}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddColor}
                  disabled={saving || !newColorName}
                  className="w-full bg-primary text-white py-4 font-label-caps text-[11px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <><Plus size={16} /> ADD COLORWAY</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && analytics && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-white p-10 hairline-border luxury-card-shadow">
                <h3 className="font-headline-md text-2xl mb-8 flex items-center gap-3"><TrendingUp size={20} className="text-primary"/> Top Dimensions</h3>
                <div className="space-y-6">
                  {analytics.sizes.slice(0, 5).map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-surface-container/30">
                      <div className="flex gap-4 items-center">
                        <span className="font-data-mono text-outline text-xs">0{i+1}</span>
                        <span className="font-headline-md text-lg">{s.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-data-mono text-primary font-bold">{s.sales} SOLD</p>
                        <p className="text-[9px] font-label-caps text-outline">RETURNS: {s.returns}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-10 hairline-border luxury-card-shadow">
                <h3 className="font-headline-md text-2xl mb-8 flex items-center gap-3"><TrendingUp size={20} className="text-primary"/> Top Colorways</h3>
                <div className="space-y-6">
                  {analytics.colors.slice(0, 5).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-surface-container/30">
                      <div className="flex gap-4 items-center">
                        <span className="font-data-mono text-outline text-xs">0{i+1}</span>
                        <span className="font-headline-md text-lg">{c.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-data-mono text-primary font-bold">{c.sales} SOLD</p>
                        <p className="text-[9px] font-label-caps text-outline">RETURNS: {c.returns}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-10 hairline-border luxury-card-shadow border-error/20">
              <h3 className="font-headline-md text-2xl mb-8 flex items-center gap-3 text-error"><AlertCircle size={20} /> Stagnant Variants (Dead Stock)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-outline-variant/30">
                      <th className="py-4 font-label-caps text-[10px] text-outline tracking-widest">VARIANT</th>
                      <th className="py-4 font-label-caps text-[10px] text-outline tracking-widest">SKU</th>
                      <th className="py-4 font-label-caps text-[10px] text-outline tracking-widest text-right">STAGNANT RESERVE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.deadStock.slice(0, 10).map((v: any) => (
                      <tr key={v.id} className="border-b border-outline-variant/10 hover:bg-surface-container/20">
                        <td className="py-4 font-headline-md text-sm">{v.name}</td>
                        <td className="py-4 font-data-mono text-xs">{v.sku}</td>
                        <td className="py-4 font-data-mono text-error font-bold text-right">{v.stock}</td>
                      </tr>
                    ))}
                    {analytics.deadStock.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-outline italic">No stagnant variants detected.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
