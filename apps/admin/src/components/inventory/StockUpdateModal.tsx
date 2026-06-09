"use client";

import { useState } from "react";

interface Props {
  target: { variantId: string; sku: string; currentStock: number };
  onClose: () => void;
  onSubmit: (data: { variantId: string; type: string; quantity: number; reason: string }) => void;
}

export default function StockUpdateModal({ target, onClose, onSubmit }: Props) {
  const [type, setType] = useState("IN");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>Update Stock</h2>
        <p style={{ fontSize: "13px", color: "var(--color-outline)", marginBottom: "24px" }}>
          SKU: {target.sku} · Current: <strong>{target.currentStock}</strong>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label className="label">Movement Type</label>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="IN">Stock IN (Add)</option>
              <option value="OUT">Stock OUT (Remove)</option>
              <option value="RETURN">Return</option>
              <option value="MANUAL_ADJUSTMENT">Manual Adjustment (Set to)</option>
            </select>
          </div>
          <div>
            <label className="label">{type === "MANUAL_ADJUSTMENT" ? "New Stock Quantity" : "Quantity"}</label>
            <input className="input" type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={type === "MANUAL_ADJUSTMENT" ? "Set stock to..." : "Enter quantity..."} />
          </div>
          <div>
            <label className="label">Reason (optional)</label>
            <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. New shipment arrived" />
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!quantity} onClick={() => onSubmit({ variantId: target.variantId, type, quantity: parseInt(quantity), reason })}>
              Update Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
