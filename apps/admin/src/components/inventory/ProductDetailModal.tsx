"use client";

import { Edit3 } from "lucide-react";
import type { ProductWithVariants } from "@/types";

const LOW_STOCK = 5;

interface Props {
  product: ProductWithVariants;
  onClose: () => void;
  onStockClick: (data: { variantId: string; sku: string; currentStock: number }) => void;
}

export default function ProductDetailModal({ product, onClose, onStockClick }: Props) {
  const profit = product.sellingPrice - product.costPrice;

  // Group variants by color with sizes horizontal
  const colorGroups: Record<string, { hexCode: string, sizes: Record<string, typeof product.variants[0]> }> = {};
  for (const v of product.variants) {
    const cName = v.colorRef?.name || v.color || "N/A";
    const cHex = v.colorRef?.hexCode || v.color?.toLowerCase() || "#ccc";
    const sName = v.sizeRef?.name || v.size || "N/A";

    if (!colorGroups[cName]) colorGroups[cName] = { hexCode: cHex, sizes: {} };
    colorGroups[cName].sizes[sName] = v;
  }

  // Get all unique sizes and sort them by displayOrder if possible
  const allSizes = [...new Map(product.variants.map((v) => {
    const sName = v.sizeRef?.name || v.size || "N/A";
    const sOrder = v.sizeRef?.displayOrder || 99;
    return [sName, sOrder];
  })).entries()]
    .sort((a, b) => a[1] - b[1])
    .map(entry => entry[0]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>{product.name}</h2>
            <span className="badge badge-neutral">{product.category.name}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Prices */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--color-outline)", marginBottom: "4px" }}>Cost Price</div>
            <div style={{ fontSize: "18px", fontWeight: 700 }}>{product.costPrice.toFixed(2)} MAD</div>
          </div>
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--color-outline)", marginBottom: "4px" }}>Selling Price</div>
            <div style={{ fontSize: "18px", fontWeight: 700 }}>{product.sellingPrice.toFixed(2)} MAD</div>
          </div>
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--color-outline)", marginBottom: "4px" }}>Profit</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--success)" }}>+{profit.toFixed(2)} MAD</div>
          </div>
        </div>

        {/* Variant grid: sizes horizontal */}
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Variants & Stock
        </h3>
        <div className="table-container" style={{ marginBottom: "24px" }}>
          <table>
            <thead>
              <tr>
                <th>Color</th>
                {allSizes.map((s) => (<th key={s} style={{ textAlign: "center" }}>{s}</th>))}
                <th style={{ textAlign: "center" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(colorGroups).map(([color, group]) => {
                const colorTotal = Object.values(group.sizes).reduce((s, v) => s + v.stockQuantity, 0);
                return (
                  <tr key={color}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: group.hexCode, border: "2px solid var(--color-outline-variant)" }} />
                        <span style={{ fontWeight: 500 }}>{color}</span>
                      </div>
                    </td>
                    {allSizes.map((size) => {
                      const variant = group.sizes[size];
                      if (!variant) return <td key={size} style={{ textAlign: "center", color: "var(--color-outline)" }}>—</td>;
                      return (
                        <td key={size} style={{ textAlign: "center" }}>
                          <button
                            onClick={() => onStockClick({ variantId: variant.id, sku: variant.sku, currentStock: variant.stockQuantity })}
                            style={{
                              background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "15px",
                              padding: "4px 8px",
                              color: variant.stockQuantity === 0 ? "var(--color-error)" : variant.stockQuantity <= LOW_STOCK ? "var(--warning)" : "var(--color-on-surface)",
                              transition: "all 200ms ease",
                            }}
                            title={`${variant.sku} — Click to adjust\nPrice: ${variant.sellingPrice || product.sellingPrice} MAD`}
                          >
                            {variant.stockQuantity}
                          </button>
                        </td>
                      );
                    })}
                    <td style={{ textAlign: "center", fontWeight: 700, color: "var(--color-primary)" }}>{colorTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <a href={`/inventory/edit/${product.id}`} className="btn btn-primary"><Edit3 size={14} />Edit Product</a>
        </div>
      </div>
    </div>
  );
}
