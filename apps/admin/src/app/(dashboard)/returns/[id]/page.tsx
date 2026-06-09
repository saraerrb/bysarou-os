"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Loader2, 
  RotateCcw, 
  Package, 
  AlertTriangle, 
  CheckCircle,
  Truck,
  MessageSquare,
  History,
  Save
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RETURN_STATUSES, RETURN_REASONS } from "@/lib/constants";
import { format } from "date-fns";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

export default function ReturnDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ret, setRet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  const fetchReturn = async () => {
    try {
      const res = await fetch(`/api/returns/${id}`);
      const data = await res.json();
      if (res.ok) {
        setRet(data);
        setNotes(data.notes || "");
      } else {
        router.push("/returns");
      }
    } catch (error) {
      console.error("Error fetching return:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturn();
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/returns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      
      if (res.ok) {
        fetchReturn();
      } else {
        const err = await res.json();
        alert(err.error || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
        <Loader2 className="animate-spin" size={32} style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  if (!ret) return null;

  const currentStatusConfig = RETURN_STATUSES.find(s => s.value === ret.status);
  const reasonLabel = RETURN_REASONS.find(r => r.value === ret.reason)?.label || ret.reason;

  return (
    <div className="fade-in" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div className="header-container" style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/returns" className="btn btn-ghost btn-sm btn-icon">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <h1 className="page-title" style={{ margin: 0 }}>Return Management</h1>
              <span className="badge" style={{ background: currentStatusConfig?.bg, color: currentStatusConfig?.color }}>
                {currentStatusConfig?.label}
              </span>
            </div>
            <p className="page-subtitle">Linked to Order #{ret.order.id.slice(-6).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "24px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Status Control */}
          <div className="card shadow-lg" style={{ border: "2px solid var(--primary-glow)" }}>
            <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <RotateCcw size={20} style={{ color: "var(--primary)" }} /> Process Return
            </h3>
            
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label>Internal Return Notes</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Inspection results, damage description, etc..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {ret.status === "PENDING" && (
                <button 
                  className="btn btn-primary" 
                  style={{ background: "var(--info)" }}
                  onClick={() => handleUpdateStatus("RECEIVED")}
                  disabled={updating}
                >
                  Mark as Received
                </button>
              )}
              {ret.status === "RECEIVED" && (
                <>
                  <button 
                    className="btn btn-primary" 
                    style={{ background: "var(--success)" }}
                    onClick={() => handleUpdateStatus("RESTOCKED")}
                    disabled={updating}
                  >
                    <CheckCircle size={18} /> Restock to Inventory
                  </button>
                  <button 
                    className="btn btn-ghost" 
                    style={{ color: "var(--danger)", background: "var(--danger-bg)" }}
                    onClick={() => handleUpdateStatus("DAMAGED")}
                    disabled={updating}
                  >
                    <AlertTriangle size={18} /> Damaged / Write-off
                  </button>
                </>
              )}
            </div>
            
            {ret.status === "RESTOCKED" && (
              <div style={{ padding: "16px", background: "var(--success-bg)", borderRadius: "var(--radius-sm)", color: "var(--success)", display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={20} />
                <span style={{ fontWeight: 600 }}>This return has been restocked and closed.</span>
              </div>
            )}
            {ret.status === "DAMAGED" && (
              <div style={{ padding: "16px", background: "var(--danger-bg)", borderRadius: "var(--radius-sm)", color: "var(--danger)", display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertTriangle size={20} />
                <span style={{ fontWeight: 600 }}>This return is marked as damaged and closed.</span>
              </div>
            )}
          </div>

          {/* Original Items */}
          <div className="card">
            <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Package size={20} /> Returned Items
            </h3>
            <div className="table-container" style={{ border: "none" }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {ret.order.items.map((item: any) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.variant.product.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {item.variant.color} / {item.variant.size}
                        </div>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>×{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Return Info */}
          <div className="card">
            <h3 style={{ marginBottom: "20px" }}>Return Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Reason for Return</div>
                <div className="badge badge-neutral" style={{ fontWeight: 600 }}>{reasonLabel}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Return Date</div>
                <div style={{ fontWeight: 600 }}>{format(new Date(ret.returnDate), "MMMM dd, yyyy")}</div>
              </div>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Customer</div>
                <div style={{ fontWeight: 600 }}>{ret.order.customerName}</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{ret.order.customerPhone}</div>
              </div>
            </div>
          </div>

          {/* Audit History */}
          <div className="card">
            <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <History size={18} /> History
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {ret.order.history.slice(0, 3).map((log: any) => (
                <div key={log.id} style={{ borderLeft: "2px solid rgba(255,255,255,0.06)", paddingLeft: "12px" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{format(new Date(log.createdAt), "MMM dd, HH:mm")}</div>
                  <OrderStatusBadge status={log.status} />
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{log.notes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
