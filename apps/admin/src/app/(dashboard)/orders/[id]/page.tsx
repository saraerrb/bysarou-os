"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Loader2, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Phone, 
  User, 
  MapPin, 
  Calendar,
  History,
  RotateCcw,
  Printer,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { format } from "date-fns";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Shipping Modal State
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [carriers, setCarriers] = useState<any[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
      } else {
        router.push("/orders");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarriers = async () => {
    try {
      const res = await fetch("/api/carriers");
      const data = await res.json();
      setCarriers(data);
    } catch (error) {
      console.error("Error fetching carriers:", error);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchCarriers();
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchOrder();
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignCarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarrier) return alert("Please select a carrier");
    
    setUpdating(true);
    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          carrierId: selectedCarrier,
          trackingNumber,
        }),
      });
      
      if (res.ok) {
        setShowShippingModal(false);
        fetchOrder();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to assign carrier");
      }
    } catch (error) {
      console.error("Assignment error:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
        <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="fade-in">
      <div className="header-container" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/orders" className="btn btn-ghost btn-sm btn-icon">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title">Order Details</h1>
            <p className="page-subtitle">#{order.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {order.status === "PENDING_CONFIRMATION" || order.status === "NEW" || order.status === "NO_ANSWER" || order.status === "CALL_LATER" ? (
            <button 
              className="btn btn-primary" 
              onClick={() => handleUpdateStatus("CONFIRMED")}
              disabled={updating}
              style={{ background: "var(--success)" }}
            >
              <CheckCircle size={18} /> Confirm Order
            </button>
          ) : order.status === "CONFIRMED" ? (
            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                className="btn btn-primary" 
                onClick={() => handleUpdateStatus("SHIPPED")}
                disabled={updating}
                style={{ background: "#a29bfe" }}
              >
                <Truck size={18} /> Mark as Shipped (Manual)
              </button>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowShippingModal(true)}
                style={{ border: "1px solid var(--color-primary)", color: "var(--color-primary)" }}
              >
                <Package size={18} /> Ship with Carrier
              </button>
            </div>
          ) : order.status === "SHIPPED" ? (
            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                className="btn btn-primary" 
                onClick={() => handleUpdateStatus("DELIVERED")}
                disabled={updating}
                style={{ background: "#00b894" }}
              >
                <CheckCircle size={18} /> Mark as Delivered
              </button>
              <Link href={`/orders/${order.id}/return`} className="btn btn-ghost" style={{ color: "#e17055" }}>
                <RotateCcw size={18} /> Register Return
              </Link>
            </div>
          ) : order.status === "DELIVERED" ? (
            <Link href={`/orders/${order.id}/return`} className="btn btn-ghost" style={{ color: "#e17055" }}>
              <RotateCcw size={18} /> Register Return
            </Link>
          ) : null}

          {/* Cancellation Option for early stages */}
          {(order.status === "NEW" || order.status === "PENDING_CONFIRMATION" || order.status === "CONFIRMED") && (
            <button 
              className="btn btn-ghost" 
              style={{ color: "var(--danger)" }}
              onClick={() => handleUpdateStatus("CANCELLED")}
              disabled={updating}
            >
              <XCircle size={18} /> Cancel Order
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Main Info Card */}
          <div className="card">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "var(--color-outline)", marginBottom: "4px" }}>Status</div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--color-outline)", marginBottom: "4px" }}>Order Date</div>
                <div style={{ fontWeight: 600 }}>{format(new Date(order.createdAt), "MMMM dd, yyyy")}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--color-outline)", marginBottom: "4px" }}>Total Amount</div>
                <div style={{ fontWeight: 800, color: "var(--color-primary)", fontSize: "18px" }}>{order.totalAmount} MAD</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="card">
            <h3 style={{ marginBottom: "20px" }}>Order Items</h3>
            <div className="table-container" style={{ border: "none" }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Variant</th>
                    <th style={{ textAlign: "center" }}>Price</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item: any) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.variant.product.name}</td>
                      <td>{item.variant.color} / {item.variant.size}</td>
                      <td style={{ textAlign: "center" }}>{item.price} MAD</td>
                      <td style={{ textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>{(item.price * item.quantity).toFixed(2)} MAD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shipping Info Card (If exists) */}
          {(order.carrier || order.trackingNumber) && (
            <div className="card shadow-lg" style={{ border: "1px solid var(--info-bg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Truck size={20} style={{ color: "var(--info)" }} /> Shipping Information
                </h3>
                <Link href={`/shipping/${order.id}/label`} target="_blank" className="btn btn-ghost btn-sm">
                  <Printer size={16} /> Print Label
                </Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--color-outline)" }}>Carrier</div>
                  <div style={{ fontWeight: 600 }}>{order.carrier?.name || "Manual / None"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--color-outline)" }}>Tracking Number</div>
                  <div style={{ fontWeight: 700, fontFamily: "monospace" }}>{order.trackingNumber || "Not assigned"}</div>
                </div>
              </div>
            </div>
          )}

          {/* History / Timeline */}
          <div className="card">
            <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <History size={20} /> Order History
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {order.history && order.history.map((log: any) => (
                <div key={log.id} style={{ borderLeft: "2px solid var(--color-surface-variant)", paddingLeft: "16px", position: "relative" }}>
                  <div style={{ position: "absolute", left: "-6px", top: "0", width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-primary)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ fontWeight: 600, fontSize: "13px" }}>{log.status}</div>
                    <div style={{ fontSize: "11px", color: "var(--color-outline)" }}>{format(new Date(log.createdAt), "MMM dd, HH:mm")}</div>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--color-on-surface-variant)" }}>{log.notes}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-outline)", marginTop: "4px" }}>By {log.agentName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Customer Info Card */}
          <div className="card">
            <h3 style={{ marginBottom: "20px" }}>Customer</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "var(--color-surface-variant)", padding: "8px", borderRadius: "8px" }}>
                  <User size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--color-outline)" }}>Name</div>
                  <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "var(--color-surface-variant)", padding: "8px", borderRadius: "8px" }}>
                  <Phone size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--color-outline)" }}>Phone</div>
                  <div style={{ fontWeight: 600 }}>{order.customerPhone}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "var(--color-surface-variant)", padding: "8px", borderRadius: "8px" }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--color-outline)" }}>Address</div>
                  <div style={{ fontWeight: 600 }}>{order.customerCity}</div>
                  <div style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }}>{order.customerAddress}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Finance Snapshot */}
          <div className="card">
            <h3 style={{ marginBottom: "20px" }}>Financial Snapshot</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-outline)" }}>Items Total</span>
                <span>{(order.totalAmount - order.shippingCost - order.codFee - order.packagingCost).toFixed(2)} MAD</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-outline)" }}>Shipping</span>
                <span>{order.shippingCost.toFixed(2)} MAD</span>
              </div>
              {order.codFee > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-outline)" }}>COD Fee</span>
                  <span>{order.codFee.toFixed(2)} MAD</span>
                </div>
              )}
              {order.packagingCost > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-outline)" }}>Packaging</span>
                  <span>{order.packagingCost.toFixed(2)} MAD</span>
                </div>
              )}
              <div style={{ height: "1px", background: "var(--color-outline-variant)", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700 }}>Grand Total</span>
                <span style={{ fontWeight: 800, color: "var(--color-primary)", fontSize: "18px" }}>{order.totalAmount.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Assignment Modal */}
      {showShippingModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "450px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0 }}>Assign Carrier</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowShippingModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleAssignCarrier} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="form-group">
                <label>Select Shipping Carrier</label>
                <select 
                  className="input" 
                  required 
                  value={selectedCarrier} 
                  onChange={(e) => setSelectedCarrier(e.target.value)}
                >
                  <option value="">Choose a carrier...</option>
                  {carriers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Default: {c.defaultCost} MAD)</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tracking Number (Manual)</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. TRK123456789"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Leave blank to assign later from the Shipping dashboard.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={updating}>
                  {updating ? <Loader2 className="animate-spin" /> : "Confirm Shipment"}
                </button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowShippingModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(6px);
        }
        .modal-content {
          background: var(--color-surface-container-lowest);
          padding: 32px;
          border: 1px solid var(--color-outline-variant);
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}
