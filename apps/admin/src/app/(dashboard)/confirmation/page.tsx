"use client";

import { useState, useEffect } from "react";
import { Phone, Clock, AlertTriangle, ChevronRight, Loader2, Search, CheckCircle, Verified, MoreHorizontal } from "lucide-react";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { format } from "date-fns";
import Link from "next/link";

export default function ConfirmationPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const allOrders = await res.json();
      const needsConfirmation = ["NEW", "PENDING_CONFIRMATION", "CALL_LATER", "NO_ANSWER", "WRONG_NUMBER"];
      const filtered = allOrders.filter((o: any) => 
        needsConfirmation.includes(o.status) &&
        (o.customerName.toLowerCase().includes(search.toLowerCase()) || 
         o.customerPhone.includes(search))
      );
      setOrders(filtered);
    } catch (error) {
      console.error("Failed to fetch confirmation orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-12">
      {/* Queue Header */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-4">
            <span className="font-label-caps text-primary tracking-[0.2em] uppercase text-xs">OPERATIONAL WORKSPACE</span>
            <h1 className="font-display-xl text-[64px] leading-tight text-on-surface">Confirmation Desk</h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed italic">
              A high-priority verification queue for authorizing Cash on Delivery transactions through direct customer engagement.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-primary/5 border border-primary/20 px-8 py-4 luxury-card-shadow flex items-center gap-4">
              <Verified className="text-primary" size={24} />
              <div>
                <span className="font-label-caps text-[10px] text-primary block mb-1">QUEUE DENSITY</span>
                <div className="font-data-mono text-sm font-semibold">{orders.length} PENDING AUTHORIZATION</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Search & Actions */}
      <section className="bg-white hairline-border luxury-card-shadow p-6 mb-12 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="relative w-full lg:w-[450px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" size={18} />
          <input 
            className="w-full pl-12 pr-6 py-3 bg-surface-container/30 border border-outline-variant/30 focus:border-primary outline-none transition-all font-body-md text-sm"
            placeholder="Search priority queue by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-6 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">ACTIVE WORKFORCE: A. STERLING</span>
          </div>
          <button className="text-outline-variant hover:text-primary transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </section>

      {/* Confirmation Items */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-8 hairline-border luxury-card-shadow hover:border-primary transition-all duration-300 flex flex-col lg:flex-row items-center gap-12 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Profile Card */}
              <div className="w-full lg:w-72 space-y-2">
                <span className="font-label-caps text-[9px] text-outline">AUTHORIZATION REQ: #{order.id.slice(-4).toUpperCase()}</span>
                <h3 className="font-headline-md text-xl text-on-surface">{order.customerName}</h3>
                <div className="flex items-center gap-2 text-primary">
                  <Phone size={14} />
                  <p className="font-data-mono text-sm font-bold tracking-tight">{order.customerPhone}</p>
                </div>
              </div>

              {/* Logistical Metadata */}
              <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                <div className="space-y-1">
                  <span className="font-label-caps text-[9px] text-outline block">DESTINATION</span>
                  <p className="font-body-md text-sm font-medium">{order.customerCity}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-label-caps text-[9px] text-outline block">CALL ATTEMPTS</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${(order.callAttempts || 0) >= 3 ? "bg-error" : "bg-primary"}`}></span>
                    <p className="font-body-md text-sm font-medium">{order.callAttempts || 0} Attempts</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="font-label-caps text-[9px] text-outline block">PARCEL VALUE</span>
                  <p className="font-headline-md text-lg text-primary">{(order.totalAmount || 0).toLocaleString()} <span className="text-[10px] font-body-md">MAD</span></p>
                </div>
                <div className="space-y-1">
                  <span className="font-label-caps text-[9px] text-outline block">PHASE</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              {/* Decision Area */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <Link 
                  href={`/confirmation/${order.id}`}
                  className="flex-grow lg:flex-none bg-primary text-white px-12 py-4 font-label-caps text-[11px] hover:opacity-90 transition-all flex items-center justify-center gap-3 tracking-widest shadow-md"
                >
                  INITIALIZE CALL <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 hairline-border luxury-card-shadow text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-8">
              <CheckCircle size={40} className="text-primary" />
            </div>
            <h3 className="font-headline-md text-2xl mb-4">Queue Satisfied</h3>
            <p className="font-body-md text-on-surface-variant italic max-w-sm mb-8">All high-priority confirmation requests have been resolved. The operational desk is currently at zero density.</p>
          </div>
        )}
      </div>

      <footer className="py-20 text-center">
        <span className="font-label-caps text-[10px] tracking-[0.5em] text-outline">BYSAROU OS • CONFIRMATION DESK</span>
      </footer>
    </main>
  );
}
