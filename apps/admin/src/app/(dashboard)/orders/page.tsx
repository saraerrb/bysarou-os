"use client";

import { useState, useEffect } from "react";
import { Plus, ShoppingCart, Loader2, Search, Filter, MoreHorizontal, Eye, Trash2, Download } from "lucide-react";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { format } from "date-fns";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    city: "",
    search: "",
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/orders?${query}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-12">
      {/* Registry Header */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-4">
            <span className="font-label-caps text-primary tracking-[0.2em] uppercase text-xs">COMMERCE LEDGER</span>
            <h1 className="font-display-xl text-[64px] leading-tight text-on-surface">Order Registry</h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed italic">
              A comprehensive archive of all high-priority Cash on Delivery transactions within the BySarou operational grid.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white border border-outline-variant p-4 hover:border-primary transition-all">
              <Download size={20} className="text-primary" />
            </button>
            <Link href="/orders/add" className="bg-primary text-white px-8 py-4 font-label-caps text-[11px] flex items-center gap-3 hover:opacity-90 transition-all">
              <Plus size={18} /> INITIALIZE TRANSACTION
            </Link>
          </div>
        </div>
      </section>

      {/* Advanced Filter Bar */}
      <section className="bg-white hairline-border luxury-card-shadow p-6 mb-12 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="relative w-full lg:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" size={18} />
          <input 
            className="w-full pl-12 pr-6 py-3 bg-surface-container/30 border border-outline-variant/30 focus:border-primary outline-none transition-all font-body-md text-sm"
            placeholder="Filter by Name, ID, or Phone..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          <Filter size={18} className="text-primary shrink-0" />
          {["", "NEW", "PENDING_CONFIRMATION", "CONFIRMED", "SHIPPED", "DELIVERED", "RETURNED", "CANCELLED"].map((status) => (
            <button 
              key={status}
              onClick={() => setFilters({ ...filters, status })}
              className={`px-6 py-2 shrink-0 font-label-caps text-[10px] border transition-all ${filters.status === status ? "bg-primary text-white border-primary" : "bg-white text-on-surface-variant border-outline-variant hover:border-primary"}`}
            >
              {status || "ALL ENTRIES"}
            </button>
          ))}
        </div>
      </section>

      {/* Registry Entries */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-8 hairline-border luxury-card-shadow hover:border-primary transition-all duration-300 flex flex-col lg:flex-row items-center gap-12 group">
              {/* ID & Customer */}
              <div className="w-full lg:w-64 space-y-2">
                <span className="font-label-caps text-[9px] text-outline">REF: LX-{order.id.slice(-6).toUpperCase()}</span>
                <h3 className="font-headline-md text-xl text-on-surface group-hover:text-primary transition-colors">{order.customerName}</h3>
                <p className="font-data-mono text-xs text-on-surface-variant font-semibold tracking-tighter">{order.customerPhone}</p>
              </div>

              {/* Logistical Metadata */}
              <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                <div className="space-y-1">
                  <span className="font-label-caps text-[9px] text-outline block">DATE ARCHIVED</span>
                  <p className="font-body-md text-sm font-medium">{format(new Date(order.createdAt), "MMM dd, yyyy")}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-label-caps text-[9px] text-outline block">DESTINATION</span>
                  <p className="font-body-md text-sm font-medium">{order.customerCity}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-label-caps text-[9px] text-outline block">VALUE</span>
                  <p className="font-headline-md text-lg text-primary">{(order.totalAmount || 0).toLocaleString()} <span className="text-[10px] font-body-md">MAD</span></p>
                </div>
                <div className="space-y-1">
                  <span className="font-label-caps text-[9px] text-outline block">STATUS</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <Link 
                  href={`/orders/${order.id}`}
                  className="flex-1 lg:flex-none bg-surface-container px-8 py-3 font-label-caps text-[10px] hover:bg-primary hover:text-white transition-all text-center"
                >
                  VIEW DETAIL
                </Link>
                {(order.status === "NEW" || order.status === "PENDING_CONFIRMATION") && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}
                    className="flex-1 lg:flex-none bg-primary text-white px-8 py-3 font-label-caps text-[10px] hover:opacity-90 transition-all"
                  >
                    APPROVE
                  </button>
                )}
                <button 
                  className="p-3 text-error hover:bg-error/5 transition-all"
                  onClick={async () => {
                    if (!confirm("Are you sure you want to delete this order?")) return;
                    try {
                      const res = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
                      if (res.ok) fetchOrders();
                    } catch (err) {
                      console.error("Delete error:", err);
                    }
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 hairline-border luxury-card-shadow text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-8">
              <ShoppingCart size={40} className="text-primary/30" />
            </div>
            <h3 className="font-headline-md text-2xl mb-4">Registry Vacant</h3>
            <p className="font-body-md text-on-surface-variant italic max-w-sm mb-8">No transactions currently match your specific filtering parameters in the ledger.</p>
            <button 
              onClick={() => setFilters({ status: "", city: "", search: "" })}
              className="bg-primary text-white px-10 py-4 font-label-caps text-[11px] tracking-widest hover:opacity-90"
            >
              CLEAR FILTERS
            </button>
          </div>
        )}
      </div>

      <footer className="py-20 text-center">
        <span className="font-label-caps text-[10px] tracking-[0.5em] text-outline">BYSAROU OS • ORDER REGISTRY</span>
      </footer>
    </main>
  );
}
