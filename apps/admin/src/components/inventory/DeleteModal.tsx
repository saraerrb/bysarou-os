"use client";

import { Trash2 } from "lucide-react";

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ onClose, onConfirm }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--danger-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trash2 size={22} style={{ color: "var(--color-error)" }} />
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Delete Product?</h2>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "14px" }}>
            This will permanently delete this product and all its variants. This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-danger" onClick={onConfirm}>Delete Product</button>
          </div>
        </div>
      </div>
    </div>
  );
}
