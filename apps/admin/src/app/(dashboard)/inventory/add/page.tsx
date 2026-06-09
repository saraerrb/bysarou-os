"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, X, ArrowLeft, Package, Zap, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import type { CategoryData, SizeData, ColorData } from "@/types";
import Link from "next/link";

interface VariantRow {
  colorId: string;
  sizes: Record<string, number>;
  skuPrefix: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [dbSizes, setDbSizes] = useState<SizeData[]>([]);
  const [dbColors, setDbColors] = useState<ColorData[]>([]);
  
  const [newCategory, setNewCategory] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    costPrice: "",
    sellingPrice: "",
  });

  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/sizes").then((r) => r.json()),
      fetch("/api/colors").then((r) => r.json())
    ]).then(([cats, sizes, colors]) => {
      setCategories(cats);
      setDbSizes(sizes);
      setDbColors(colors);
      
      // Initialize first row with dynamic sizes
      setVariantRows([{ 
        colorId: "", 
        sizes: Object.fromEntries(sizes.map((s: SizeData) => [s.id, 0])), 
        skuPrefix: "" 
      }]);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const addVariantRow = () => {
    setVariantRows([...variantRows, { colorId: "", sizes: Object.fromEntries(dbSizes.map((s) => [s.id, 0])), skuPrefix: "" }]);
  };

  const removeVariantRow = (idx: number) => {
    if (variantRows.length <= 1) return;
    setVariantRows(variantRows.filter((_, i) => i !== idx));
  };

  const updateVariantRow = (idx: number, field: string, value: string) => {
    const rows = [...variantRows];
    if (field === "colorId") {
      rows[idx].colorId = value;
      const colorObj = dbColors.find(c => c.id === value);
      if (colorObj) {
        rows[idx].skuPrefix = `${form.name.slice(0, 3).toUpperCase()}-${colorObj.name.slice(0, 3).toUpperCase()}`;
      }
    } else {
      rows[idx] = { ...rows[idx], [field]: value };
    }
    setVariantRows(rows);
  };

  const updateSizeQty = (rowIdx: number, sizeId: string, qty: number) => {
    const rows = [...variantRows];
    rows[rowIdx].sizes[sizeId] = Math.max(0, qty);
    setVariantRows(rows);
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      const cat = await res.json();
      setCategories([...categories, cat]);
      setForm({ ...form, categoryId: cat.id });
      setNewCategory("");
      setShowNewCat(false);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.categoryId || !form.costPrice || !form.sellingPrice) {
      alert("Operational error: Mandatory fields missing.");
      return;
    }

    setSaving(true);
    try {
      const variants = variantRows.flatMap((row) =>
        Object.entries(row.sizes)
          .filter(([, qty]) => qty > 0)
          .map(([sizeId, qty]) => {
            const sizeObj = dbSizes.find(s => s.id === sizeId);
            const colorObj = dbColors.find(c => c.id === row.colorId);
            return {
              size: sizeObj?.name || "Default",
              color: colorObj?.name || "Default",
              sizeId: sizeObj?.id,
              colorId: colorObj?.id,
              sku: `${row.skuPrefix || form.name.slice(0, 3).toUpperCase()}-${sizeObj?.name || 'DEF'}`,
              stockQuantity: qty,
              costPrice: form.costPrice,
              sellingPrice: form.sellingPrice,
            };
          })
      );

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, variants }),
      });

      if (res.ok) {
        router.push("/inventory");
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  const profit = parseFloat(form.sellingPrice) - parseFloat(form.costPrice);

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-12">
      {/* Header */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Link href="/inventory" className="text-primary hover:opacity-70 transition-all">
                <ArrowLeft size={24} />
              </Link>
              <span className="font-label-caps text-primary tracking-[0.2em] uppercase text-xs">ASSET MANAGEMENT</span>
            </div>
            <h1 className="font-display-xl text-[64px] leading-tight text-on-surface">Asset Initialization</h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed italic">
              Registering new operational artifacts into the commerce grid archives.
            </p>
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={saving}
            className="bg-primary text-white px-12 py-4 font-label-caps text-[11px] flex items-center gap-3 hover:opacity-90 transition-all shadow-lg tracking-widest"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> ARCHIVE ASSET</>}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Identity & Financials */}
        <div className="lg:col-span-8 space-y-12">
          {/* Identity Artifact */}
          <div className="bg-white p-12 hairline-border luxury-card-shadow">
            <h2 className="font-headline-md text-3xl mb-12 flex items-center gap-4 text-on-surface">
              <Package className="text-primary" size={28} />
              Artifact Identity
            </h2>
            <div className="space-y-10">
              <div className="space-y-3">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Product Name *</label>
                <input className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 outline-none transition-all font-headline-md text-2xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Robe Élégante Satin" />
              </div>
              <div className="space-y-3">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Description Archive</label>
                <textarea className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 outline-none transition-all font-body-md text-sm italic resize-none h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Log characteristic details..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Collection / Category *</label>
                  {showNewCat ? (
                    <div className="flex gap-2">
                      <input className="flex-grow bg-transparent border-b border-primary py-2 outline-none font-body-md text-sm" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New Collection..." />
                      <button className="bg-primary text-white px-4 py-2 font-label-caps text-[10px]" onClick={handleCreateCategory}>ADD</button>
                      <button className="text-outline hover:text-error" onClick={() => setShowNewCat(false)}>✕</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select className="flex-grow bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none font-body-md text-sm" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                        <option value="">Select Collection</option>
                        {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                      </select>
                      <button className="text-primary hover:opacity-70 transition-all" onClick={() => setShowNewCat(true)}><Plus size={20} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Calibration */}
          <div className="bg-white p-12 hairline-border luxury-card-shadow">
            <h2 className="font-headline-md text-3xl mb-12 flex items-center gap-4 text-on-surface">
              <TrendingUp className="text-primary" size={28} />
              Financial Calibration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-3">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Unit Acquisition Cost (MAD) *</label>
                <input className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 outline-none transition-all font-data-mono text-2xl font-bold" type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} placeholder="0.00" />
              </div>
              <div className="space-y-3">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Market Listing Price (MAD) *</label>
                <input className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 outline-none transition-all font-data-mono text-2xl font-bold" type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            {form.costPrice && form.sellingPrice && (
              <div className="bg-primary/5 p-8 border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="font-label-caps text-[10px] text-primary tracking-widest uppercase">EXPECTED UNIT YIELD</span>
                  <p className="font-headline-md text-3xl text-primary mt-2">+{profit.toFixed(2)} MAD</p>
                </div>
                <Zap className="text-primary opacity-20" size={48} />
              </div>
            )}
          </div>
        </div>

        {/* Right: Variant Matrix */}
        <aside className="lg:col-span-4 space-y-12">
          <div className="bg-white p-10 hairline-border luxury-card-shadow border-primary/20">
            <div className="flex items-center justify-between mb-12">
              <h3 className="font-label-caps text-[11px] text-primary tracking-widest">SKU VARIANT MATRIX</h3>
              <button onClick={addVariantRow} className="text-primary hover:opacity-70 transition-all">
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-12">
              {variantRows.map((row, idx) => (
                <div key={idx} className="space-y-8 pb-12 border-b border-outline-variant/10 last:border-0 relative group">
                  {variantRows.length > 1 && (
                    <button onClick={() => removeVariantRow(idx)} className="absolute -right-2 -top-2 text-error opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={16} />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-label-caps text-[9px] text-outline uppercase">COLORWAY</label>
                      <select 
                        className="w-full bg-surface-container/30 border-b border-outline-variant/30 focus:border-primary p-2 outline-none transition-all font-body-md text-xs" 
                        value={row.colorId} 
                        onChange={(e) => updateVariantRow(idx, "colorId", e.target.value)}
                      >
                        <option value="">Select Color</option>
                        {dbColors.filter(c => c.active).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-caps text-[9px] text-outline uppercase">SKU PREFIX</label>
                      <input className="w-full bg-surface-container/30 border-b border-outline-variant/30 focus:border-primary p-2 outline-none transition-all font-data-mono text-[10px] uppercase" value={row.skuPrefix} onChange={(e) => updateVariantRow(idx, "skuPrefix", e.target.value)} placeholder="AUTO" />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {dbSizes.filter(s => s.active).map((size) => (
                      <div key={size.id} className="space-y-1 text-center">
                        <span className="font-data-mono text-[9px] text-outline">{size.name}</span>
                        <input
                          className="w-full bg-white border border-outline-variant/20 focus:border-primary py-2 text-center outline-none font-data-mono text-xs"
                          type="number"
                          value={row.sizes[size.id] || ""}
                          onChange={(e) => updateSizeQty(idx, size.id, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-surface-container/30 flex items-center gap-4 border border-dashed border-outline-variant/50">
              <AlertCircle size={20} className="text-outline-variant" />
              <p className="text-[10px] font-body-md text-on-surface-variant italic">
                Variants with zero stock will be archived as 'Out of Transactional Bounds'.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <footer className="py-20 text-center">
        <span className="font-label-caps text-[10px] tracking-[0.5em] text-outline uppercase">BySarou Logistics Unit</span>
      </footer>

      <style jsx global>{`
        .font-display-xl { font-family: var(--font-noto-serif), serif; }
        .font-headline-md { font-family: var(--font-noto-serif), serif; }
        .font-data-mono { font-family: var(--font-data-mono), monospace; }
      `}</style>
    </main>
  );
}
