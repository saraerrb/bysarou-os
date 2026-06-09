"use client";

import { useState, useEffect, useCallback } from "react";
import ProductTable from "@/components/inventory/ProductTable";
import ProductDetailModal from "@/components/inventory/ProductDetailModal";
import StockUpdateModal from "@/components/inventory/StockUpdateModal";
import DeleteModal from "@/components/inventory/DeleteModal";
import { Plus, Search, Package, Filter, Loader2, Download } from "lucide-react";
import type { ProductWithVariants, CategoryData } from "@/types";
import Link from "next/link";

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductWithVariants | null>(null);
  const [stockTarget, setStockTarget] = useState<{
    variantId: string; sku: string; currentStock: number;
  } | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterCategory) params.set("categoryId", filterCategory);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, filterCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      setCategories(await res.json());
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => {
    const t = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchProducts();
  };

  const handleStockUpdate = async (data: {
    variantId: string; type: string; quantity: number; reason: string;
  }) => {
    const res = await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setStockTarget(null);
      fetchProducts();
    } else {
      const err = await res.json();
      alert(err.error || "Failed");
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-12">
      {/* Inventory Header */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-4">
            <span className="font-label-caps text-primary tracking-[0.2em] uppercase text-xs">ASSET MANAGEMENT</span>
            <h1 className="font-display-xl text-[64px] leading-tight text-on-surface">Inventory Fluidity</h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed italic">
              Real-time monitoring and logistical calibration of your operational asset reserves.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white border border-outline-variant p-4 hover:border-primary transition-all">
              <Download size={20} className="text-primary" />
            </button>
            <Link href="/inventory/add" className="bg-primary text-white px-8 py-4 font-label-caps text-[11px] flex items-center gap-3 hover:opacity-90 transition-all">
              <Plus size={18} /> INITIALIZE ASSET
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="mb-8 border-b border-outline-variant/30 overflow-x-auto no-scrollbar flex gap-2">
        <Link href="/inventory" className="px-8 py-4 font-label-caps text-[11px] tracking-widest uppercase border-b-2 border-primary text-primary whitespace-nowrap">
          Products
        </Link>
        <Link href="/inventory/sizes-colors" className="px-8 py-4 font-label-caps text-[11px] tracking-widest uppercase text-on-surface-variant hover:text-primary transition-all whitespace-nowrap">
          Sizes & Colors
        </Link>
      </section>

      {/* Advanced Filter Bar */}
      <section className="bg-white hairline-border luxury-card-shadow p-6 mb-12 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="relative w-full lg:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" size={18} />
          <input 
            className="w-full pl-12 pr-6 py-3 bg-surface-container/30 border border-outline-variant/30 focus:border-primary outline-none transition-all font-body-md text-sm"
            placeholder="Search assets by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          <Filter size={18} className="text-primary shrink-0" />
          <button 
            onClick={() => setFilterCategory("")}
            className={`px-6 py-2 shrink-0 font-label-caps text-[10px] border transition-all ${filterCategory === "" ? "bg-primary text-white border-primary" : "bg-white text-on-surface-variant border-outline-variant hover:border-primary"}`}
          >
            ALL COLLECTIONS
          </button>
          {categories.map((c) => (
            <button 
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              className={`px-6 py-2 shrink-0 font-label-caps text-[10px] border transition-all ${filterCategory === c.id ? "bg-primary text-white border-primary" : "bg-white text-on-surface-variant border-outline-variant hover:border-primary"}`}
            >
              {c.name.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {/* Asset Entries */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : products.length > 0 ? (
          <ProductTable products={products} onView={setDetailProduct} onDelete={setDeleteId} />
        ) : (
          <div className="bg-white p-20 hairline-border luxury-card-shadow text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-8">
              <Package size={40} className="text-primary/30" />
            </div>
            <h3 className="font-headline-md text-2xl mb-4">Inventory Vacant</h3>
            <p className="font-body-md text-on-surface-variant italic max-w-sm mb-8">No operational assets are currently logged in the requested archive section.</p>
            <Link 
              href="/inventory/add"
              className="bg-primary text-white px-10 py-4 font-label-caps text-[11px] tracking-widest hover:opacity-90"
            >
              INITIALIZE FIRST ASSET
            </Link>
          </div>
        )}
      </div>

      {detailProduct && (
        <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} onStockClick={(v) => { setStockTarget(v); }} />
      )}
      {stockTarget && (
        <StockUpdateModal target={stockTarget} onClose={() => setStockTarget(null)} onSubmit={handleStockUpdate} />
      )}
      {deleteId && (
        <DeleteModal onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)} />
      )}

      <footer className="py-20 text-center">
        <span className="font-label-caps text-[10px] tracking-[0.5em] text-outline">BYSAROU OS • INVENTORY FLUIDITY</span>
      </footer>
    </main>
  );
}
