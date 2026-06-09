"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, RotateCcw, AlertTriangle, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RETURN_REASONS } from "@/lib/constants";

export default function CreateReturnPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return alert("Please select a reason");
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, reason, notes }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/returns/${data.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to register return");
      }
    } catch (error) {
      console.error("Error creating return:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
        <Loader2 className="animate-spin" size={32} style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="header-container" style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href={`/orders/${id}`} className="btn btn-ghost btn-sm btn-icon">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title">Register Return</h1>
            <p className="page-subtitle">For Order #{order.id.slice(-6).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="card shadow-lg">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", gap: "12px", padding: "16px", background: "rgba(255,165,2,0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,165,2,0.15)" }}>
            <AlertTriangle size={20} style={{ color: "var(--warning)", flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
              Registering a return will change the order status to <strong>RETURNED</strong> and move it to the returns queue for inspection.
            </p>
          </div>

          <div className="form-group">
            <label>Reason for Return</label>
            <select 
              className="input" 
              required 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select a reason</option>
              {RETURN_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Return Notes (Optional)</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Add details about the return condition, customer complaint, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: "48px" }} disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : <><RotateCcw size={20} /> Confirm & Register Return</>}
          </button>
        </form>
      </div>
    </div>
  );
}
