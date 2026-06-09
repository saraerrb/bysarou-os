"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Package, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import type { CategoryData } from "@/types";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    costPrice: "",
    sellingPrice: "",
    isActive: true,
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([product, cats]) => {
      setForm({
        name: product.name,
        description: product.description || "",
        categoryId: product.categoryId,
        costPrice: String(product.costPrice),
        sellingPrice: String(product.sellingPrice),
        isActive: product.isActive,
      });
      setCategories(cats);
      setLoading(false);
    }).catch(console.error);
  }, [id]);

  const handleSubmit = async () => {
    if (!form.name || !form.categoryId || !form.costPrice || !form.sellingPrice) {
      alert("Operational error: Mandatory fields missing.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) router.push("/inventory");
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

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
            <h1 className="font-display-xl text-[64px] leading-tight text-on-surface">Asset Calibration</h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed italic">
              Modifying operational parameters for the artifact <span className="font-bold text-on-surface">"{form.name}"</span>.
            </p>
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={saving}
            className="bg-primary text-white px-12 py-4 font-label-caps text-[11px] flex items-center gap-3 hover:opacity-90 transition-all shadow-lg tracking-widest"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> UPDATE ARCHIVE</>}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Identity & Logic */}
        <div className="lg:col-span-8 space-y-12">
          <div className="bg-white p-12 hairline-border luxury-card-shadow">
            <h2 className="font-headline-md text-3xl mb-12 flex items-center gap-4 text-on-surface">
              <Package className="text-primary" size={28} />
              Identity Artifact
            </h2>
            <div className="space-y-10">
              <div className="space-y-3">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Product Name *</label>
                <input className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 outline-none transition-all font-headline-md text-2xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-3">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Description Archive</label>
                <textarea className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 outline-none transition-all font-body-md text-sm italic resize-none h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Collection / Category *</label>
                  <select className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none font-body-md text-sm" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">Select Collection</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Operational Status</label>
                  <select className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-2 outline-none font-body-md text-sm" value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}>
                    <option value="true">Active Operational Asset</option>
                    <option value="false">Decommissioned / Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 hairline-border luxury-card-shadow">
            <h2 className="font-headline-md text-3xl mb-12 flex items-center gap-4 text-on-surface">
              <TrendingUp className="text-primary" size={28} />
              Financial Calibration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-3">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Unit Acquisition Cost (MAD) *</label>
                <input className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 outline-none transition-all font-data-mono text-2xl font-bold" type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
              </div>
              <div className="space-y-3">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Market Listing Price (MAD) *</label>
                <input className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 outline-none transition-all font-data-mono text-2xl font-bold" type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
              </div>
            </div>
            {form.costPrice && form.sellingPrice && (
              <div className="mt-12 bg-primary/5 p-8 border border-primary/20 flex justify-between items-center">
                <div>
                  <span className="font-label-caps text-[10px] text-primary tracking-widest uppercase">EXPECTED UNIT YIELD</span>
                  <p className="font-headline-md text-3xl text-primary mt-2">+{profit.toFixed(2)} MAD</p>
                </div>
                <div className="font-label-caps text-[9px] text-primary/50 text-right">
                  MARG: {parseFloat(form.sellingPrice) > 0 ? ((profit / parseFloat(form.sellingPrice)) * 100).toFixed(1) + "%" : "0.0%"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Advisory */}
        <aside className="lg:col-span-4">
          <div className="bg-surface-container/30 p-10 hairline-border border-dashed border-outline-variant/50 sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-primary" size={20} />
              <h3 className="font-label-caps text-[11px] text-primary tracking-widest uppercase">Calibration Advisory</h3>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed italic">
              Changes to pricing artifacts will immediately propagate across the commerce grid. Ensure regional tax implications are factored into the market listing price.
            </p>
          </div>
        </aside>
      </div>

      {/* Bottom Actions Bar */}
      <div className="mt-12 p-8 bg-white border border-outline-variant/30 flex justify-between items-center luxury-card-shadow">
        <Link href="/inventory" className="text-on-surface-variant hover:text-primary transition-all font-label-caps text-[11px] tracking-widest flex items-center gap-2">
          <ArrowLeft size={16} /> CANCEL & RETURN
        </Link>
        <button 
          onClick={handleSubmit} 
          disabled={saving}
          className="bg-primary text-white px-12 py-4 font-label-caps text-[11px] flex items-center gap-3 hover:opacity-90 transition-all shadow-lg tracking-widest"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> SAVE CHANGES</>}
        </button>
      </div>

      <footer className="py-20 text-center">
        <span className="font-label-caps text-[10px] tracking-[0.5em] text-outline uppercase">BySarou System Core</span>
      </footer>

      <style jsx global>{`
        .font-display-xl { font-family: var(--font-noto-serif), serif; }
        .font-headline-md { font-family: var(--font-noto-serif), serif; }
        .font-data-mono { font-family: var(--font-data-mono), monospace; }
      `}</style>
    </main>
  );
}
