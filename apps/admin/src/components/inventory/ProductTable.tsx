"use client";

import { Edit3, Trash2, Eye, Package, AlertTriangle, TrendingUp } from "lucide-react";
import type { ProductWithVariants } from "@/types";

const LOW_STOCK = 5;

interface Props {
  products: ProductWithVariants[];
  onView: (p: ProductWithVariants) => void;
  onDelete: (id: string) => void;
}

export default function ProductTable({ products, onView, onDelete }: Props) {
  const getTotalStock = (p: ProductWithVariants) => p.variants.reduce((s, v) => s + v.stockQuantity, 0);
  const hasLow = (p: ProductWithVariants) => p.variants.some((v) => v.stockQuantity > 0 && v.stockQuantity <= LOW_STOCK);
  const hasOut = (p: ProductWithVariants) => p.variants.some((v) => v.stockQuantity === 0);

  return (
    <div className="space-y-6">
      {products.map((product) => {
        const total = getTotalStock(product);
        const low = hasLow(product);
        const out = hasOut(product);
        const profit = product.sellingPrice - product.costPrice;
        
        return (
          <div key={product.id} className="bg-white p-8 hairline-border luxury-card-shadow hover:border-primary transition-all duration-300 flex flex-col lg:flex-row items-center gap-12 group">
            {/* Artifact Branding */}
            <div className="w-full lg:w-72 flex gap-6 items-center">
              <div className="w-16 h-16 bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/20">
                <Package className="text-primary/40 group-hover:text-primary transition-colors" size={24} />
              </div>
              <div className="space-y-1">
                <span className="font-label-caps text-[9px] text-outline uppercase tracking-widest">{product.category.name}</span>
                <h3 className="font-headline-md text-xl text-on-surface leading-tight">{product.name}</h3>
                <p className="font-data-mono text-[10px] text-on-surface-variant font-bold uppercase">{product.variants.length} SKU Variants</p>
              </div>
            </div>

            {/* Financial & Logistical Matrix */}
            <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
              <div className="space-y-1">
                <span className="font-label-caps text-[9px] text-outline block">UNIT COST</span>
                <p className="font-body-md text-sm font-medium">{product.costPrice.toFixed(2)} MAD</p>
              </div>
              <div className="space-y-1">
                <span className="font-label-caps text-[9px] text-outline block">MARKET PRICE</span>
                <p className="font-headline-md text-lg text-on-surface">{product.sellingPrice.toFixed(2)} MAD</p>
              </div>
              <div className="space-y-1">
                <span className="font-label-caps text-[9px] text-outline block">PROFIT MARGIN</span>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className={profit > 0 ? "text-primary" : "text-error"} />
                  <p className={`font-data-mono text-sm font-bold ${profit > 0 ? "text-primary" : "text-error"}`}>
                    {profit.toFixed(0)} MAD
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-label-caps text-[9px] text-outline block">AVAILABILITY</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${out ? "bg-error" : low ? "bg-primary animate-pulse" : "bg-primary"}`}></span>
                  <p className="font-headline-md text-lg">{total} <span className="font-body-md text-[10px] text-outline uppercase tracking-widest">Units</span></p>
                </div>
              </div>
            </div>

            {/* Decision Actions */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button 
                onClick={() => onView(product)}
                className="flex-1 lg:flex-none bg-surface-container px-8 py-3 font-label-caps text-[10px] hover:bg-primary hover:text-white transition-all text-center tracking-widest"
              >
                VIEW ASSET
              </button>
              <a 
                href={`/inventory/edit/${product.id}`}
                className="p-3 bg-white border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all"
              >
                <Edit3 size={18} />
              </a>
              <button 
                onClick={() => onDelete(product.id)}
                className="p-3 text-error hover:bg-error/5 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
