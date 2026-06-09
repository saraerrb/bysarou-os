"use client";

import { useState, useEffect } from "react";
import { 
  Truck, 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Globe, 
  Loader2, 
  Printer,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { SHIPPING_STATUSES, ORDER_STATUSES } from "@/lib/constants";
import Link from "next/link";

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState<"shipments" | "carriers">("shipments");
  const [shipments, setShipments] = useState<any[]>([]);
  const [carriers, setCarriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [showCarrierModal, setShowCarrierModal] = useState(false);
  const [newCarrier, setNewCarrier] = useState({ name: "", phone: "", website: "", defaultCost: "0" });

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [shipRes, carrRes] = await Promise.all([
        fetch("/api/shipping"),
        fetch("/api/carriers")
      ]);
      
      if (!shipRes.ok || !carrRes.ok) throw new Error("Fetch failed");
      
      const shipData = await shipRes.json();
      const carrData = await carrRes.json();
      
      // shipData is now an array of Orders
      setShipments(Array.isArray(shipData) ? shipData : []);
      setCarriers(Array.isArray(carrData) ? carrData : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/carriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCarrier),
      });
      if (res.ok) {
        setShowCarrierModal(false);
        setNewCarrier({ name: "", phone: "", website: "", defaultCost: "0" });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/shipping/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredShipments = shipments.filter(order => {
    const custName = order.customerName || "";
    const trackNum = order.trackingNumber || "";
    return custName.toLowerCase().includes(search.toLowerCase()) || 
           trackNum.includes(search);
  });

  const filteredCarriers = carriers.filter(c => 
    (c?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="shipping-view fade-in" suppressHydrationWarning>
      <div className="header-container">
        <div>
          <h1 className="page-title">Shipping & Logistics</h1>
          <p className="page-subtitle">Manage carriers, tracking, and delivery status</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            className={`btn ${activeTab === "shipments" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => { setActiveTab("shipments"); setSearch(""); }}
          >
            <Truck size={18} /> Shipments
          </button>
          <button 
            className={`btn ${activeTab === "carriers" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => { setActiveTab("carriers"); setSearch(""); }}
          >
            <BarChart3 size={18} /> Carriers
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ position: "relative", maxWidth: "400px", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-outline)" }} />
          <input
            type="text"
            className="input"
            placeholder={activeTab === "shipments" ? "Search customer or tracking..." : "Search carriers..."}
            style={{ paddingLeft: "40px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {activeTab === "carriers" && (
          <button className="btn btn-primary" onClick={() => setShowCarrierModal(true)}>
            <Plus size={18} /> Add Carrier
          </button>
        )}
      </div>

      {loading && shipments.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
          <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : error ? (
        <div className="empty-state">
          <AlertCircle size={48} color="var(--danger)" />
          <p>Failed to load shipping data</p>
          <button className="btn btn-primary" onClick={fetchData}>Retry</button>
        </div>
      ) : activeTab === "shipments" ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Carrier</th>
                <th>Tracking</th>
                <th>Status</th>
                <th>Actions</th>
                <th style={{ textAlign: "right" }}>Label</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No shipments found</td></tr>
              ) : filteredShipments.map((order) => {
                const statusConfig = ORDER_STATUSES.find(s => s.value === order.status);
                return (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                      <div style={{ fontSize: "11px", color: "var(--color-outline)" }}>#{order.id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{order.carrier?.name || "Manual / None"}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px", fontWeight: 700, fontFamily: "monospace" }}>
                        {order.trackingNumber || "PENDING"}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: statusConfig?.bg || "var(--bg-hover)", color: statusConfig?.color || "var(--text-muted)", fontSize: "11px" }}>
                        {statusConfig?.label || order.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {order.status === "CONFIRMED" && (
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--info)" }} onClick={() => handleUpdateStatus(order.id, "SHIPPED")}>
                            Shipped
                          </button>
                        )}
                        {order.status === "SHIPPED" && (
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--success)" }} onClick={() => handleUpdateStatus(order.id, "DELIVERED")}>
                            Delivered
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/shipping/${order.id}/label`} target="_blank" className="btn btn-ghost btn-sm btn-icon">
                        <Printer size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {filteredCarriers.length === 0 ? (
            <div className="col-span-full" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No carriers found</div>
          ) : filteredCarriers.map((carrier) => (
            <div key={carrier.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <h3 style={{ margin: 0 }}>{carrier.name}</h3>
                <div className="badge badge-neutral">{carrier.defaultCost} MAD</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--color-on-surface-variant)" }}>
                  <Phone size={14} /> {carrier.phone || "No phone"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--color-on-surface-variant)" }}>
                  <Globe size={14} /> {carrier.website || "No website"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--color-on-surface-variant)" }}>
                  <MapPin size={14} /> {carrier.contactPhone || "No contact"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCarrierModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "450px" }}>
            <h2>Add New Shipping Carrier</h2>
            <form onSubmit={handleAddCarrier} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
              <div className="form-group">
                <label>Carrier Name</label>
                <input type="text" className="input" required value={newCarrier.name} onChange={(e) => setNewCarrier({ ...newCarrier, name: e.target.value })} placeholder="e.g. Aramex, Cat Logistics..." />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" className="input" value={newCarrier.phone} onChange={(e) => setNewCarrier({ ...newCarrier, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Default Shipping Cost (MAD)</label>
                <input type="number" className="input" value={newCarrier.defaultCost} onChange={(e) => setNewCarrier({ ...newCarrier, defaultCost: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Carrier</button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCarrierModal(false)}>Cancel</button>
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
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          color: var(--color-outline);
          gap: 16px;
        }
      `}</style>
    </div>
  );
}
