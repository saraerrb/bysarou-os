"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Phone, 
  User, 
  MapPin, 
  Package, 
  MessageSquare, 
  History, 
  CheckCircle, 
  XCircle, 
  Clock, 
  PhoneMissed, 
  AlertOctagon,
  Loader2,
  Verified,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { format } from "date-fns";

export default function AgentWorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusNotes, setStatusNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      });
  }, [id]);

  const handleAction = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, statusNotes, agentName: "A. Sterling" }),
      });
      if (res.ok) router.push("/confirmation");
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  if (!order) return null;

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-12">
      {/* Workspace Header */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Link href="/confirmation" className="text-primary hover:opacity-70 transition-all">
                <ArrowLeft size={24} />
              </Link>
              <span className="font-label-caps text-primary tracking-[0.2em] uppercase text-xs">ORDER VERIFICATION PORTAL</span>
            </div>
            <h1 className="font-display-xl text-[64px] leading-tight text-on-surface">Confirmation Desk</h1>
            <p className="font-body-lg text-on-surface-variant max-w-xl leading-relaxed italic">
              Reviewing high-priority transaction <span className="font-data-mono font-bold text-on-surface">#LX-{order.id.slice(-6).toUpperCase()}</span>
            </p>
          </div>
          <div className="flex items-center gap-4 bg-primary/5 border border-primary/20 px-8 py-4 luxury-card-shadow">
            <Verified className="text-primary" size={24} />
            <div className="font-label-caps text-[10px] text-primary tracking-widest">GEO-VERIFIED STATUS: AUTHENTICATED</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Dossier & Items */}
        <div className="lg:col-span-8 space-y-12">
          {/* Customer Dossier */}
          <div className="bg-white p-12 hairline-border luxury-card-shadow">
            <h2 className="font-headline-md text-3xl mb-12 flex items-center gap-4">
              <User className="text-primary" size={28} />
              Customer Dossier
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-10">
                <div>
                  <label className="font-label-caps text-[10px] text-outline block mb-3">LEGAL IDENTITY</label>
                  <p className="font-headline-md text-2xl text-on-surface">{order.customerName}</p>
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-outline block mb-3">CONTACT FREQUENCY</label>
                  <p className="font-data-mono text-3xl font-bold text-primary tracking-tighter">{order.customerPhone}</p>
                </div>
              </div>
              <div className="space-y-10">
                <div>
                  <label className="font-label-caps text-[10px] text-outline block mb-3">DELIVERY COORDINATES</label>
                  <p className="font-body-lg text-on-surface-variant leading-relaxed italic">
                    {order.customerAddress}<br/>
                    <span className="font-bold text-on-surface not-italic">{order.customerCity}</span>
                  </p>
                </div>
                <div className="h-24 bg-surface-container/50 border border-outline-variant/20 rounded flex items-center justify-center">
                  <MapPin size={32} className="text-outline-variant/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Artifacts */}
          <div className="bg-white p-12 hairline-border luxury-card-shadow">
            <h2 className="font-headline-md text-3xl mb-12 flex items-center gap-4">
              <Package className="text-primary" size={28} />
              Transaction Artifacts
            </h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="text-left py-4 font-label-caps text-[10px] text-outline">PRODUCT ENTITY</th>
                  <th className="text-center py-4 font-label-caps text-[10px] text-outline">QTY</th>
                  <th className="text-right py-4 font-label-caps text-[10px] text-outline">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {order.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-8">
                      <p className="font-headline-md text-lg">{item.variant.product.name}</p>
                      <p className="font-label-caps text-[9px] text-outline-variant mt-1">{item.variant.color} / {item.variant.size}</p>
                    </td>
                    <td className="py-8 text-center font-data-mono font-bold text-sm">0{item.quantity}</td>
                    <td className="py-8 text-right font-headline-md text-xl text-primary">{item.price.toLocaleString()} <span className="text-xs font-body-md">MAD</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-12 pt-8 border-t-2 border-primary/10 flex justify-end">
              <div className="text-right space-y-2">
                <span className="font-label-caps text-[10px] text-outline block">TOTAL PAYABLE AT DELIVERY</span>
                <p className="font-headline-md text-[40px] text-primary">{order.totalAmount.toLocaleString()} <span className="text-xl font-body-md">MAD</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Call Control & Decision */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Confirmation Notes */}
          <div className="bg-surface-container/50 p-10 hairline-border border-dashed">
            <label className="font-label-caps text-[11px] text-primary block mb-6 tracking-widest text-center">CONFIRMATION NOTES</label>
            <textarea 
              className="w-full h-48 bg-transparent border-b border-outline-variant/50 focus:border-primary outline-none transition-all py-2 resize-none font-body-md text-sm placeholder:italic"
              placeholder="Document the customer engagement artifacts here..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
            <div className="mt-6 flex items-center justify-center gap-2 text-outline text-[10px] uppercase font-bold tracking-tighter">
              <Clock size={12} /> SYNCED TO COMMERCE GATEWAY
            </div>
          </div>

          {/* Decision Panel */}
          <div className="bg-white p-10 hairline-border luxury-card-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <h3 className="font-label-caps text-[11px] text-on-surface mb-10 tracking-widest border-b border-outline-variant/10 pb-4">VERIFICATION DECISION</h3>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleAction("CONFIRMED")}
                disabled={updating}
                className="w-full bg-primary text-white py-6 font-label-caps text-[12px] tracking-[0.2em] shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3"
              >
                <CheckCircle size={20} /> CONFIRMED & RELEASE
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAction("NO_ANSWER")}
                  disabled={updating}
                  className="bg-white border border-outline-variant py-5 font-label-caps text-[10px] text-on-surface-variant hover:border-primary transition-all flex flex-col items-center gap-2"
                >
                  <PhoneMissed size={18} /> NO ANSWER
                </button>
                <button 
                  onClick={() => handleAction("CALL_LATER")}
                  disabled={updating}
                  className="bg-white border border-outline-variant py-5 font-label-caps text-[10px] text-on-surface-variant hover:border-primary transition-all flex flex-col items-center gap-2"
                >
                  <Clock size={18} /> CALL LATER
                </button>
              </div>

              <button 
                onClick={() => handleAction("WRONG_NUMBER")}
                disabled={updating}
                className="w-full border border-error/30 text-error py-5 font-label-caps text-[11px] tracking-widest hover:bg-error/5 transition-all flex items-center justify-center gap-3"
              >
                <AlertOctagon size={18} /> WRONG NUMBER
              </button>
            </div>

            <div className="mt-12 pt-8 border-t border-outline-variant/10 flex justify-between items-center text-[10px] font-label-caps text-outline">
              <div>OPERATOR: A. STERLING</div>
              <div className="text-primary font-bold">ATTEMPTS: {order.callAttempts || 0}</div>
            </div>
          </div>

          {/* Lifecycle Artifacts */}
          <div className="px-6">
            <h4 className="font-label-caps text-[10px] text-outline mb-8 border-l-2 border-primary pl-4 uppercase tracking-widest">Lifecycle Artifacts</h4>
            <div className="space-y-10 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-outline-variant/20"></div>
              {order.history?.map((log: any) => (
                <div key={log.id} className="relative pl-10">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-primary"></div>
                  <div className="space-y-1">
                    <p className="font-label-caps text-[10px] text-primary">{log.status.replace('_', ' ')}</p>
                    <p className="font-data-mono text-[10px] text-outline-variant">{format(new Date(log.createdAt), "MMM dd, HH:mm")}</p>
                    {log.notes && <p className="font-body-md text-xs text-on-surface-variant italic mt-3 bg-surface-container/30 p-3 hairline-border">"{log.notes}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <footer className="py-20 text-center">
        <span className="font-label-caps text-[10px] tracking-[0.5em] text-outline">BYSAROU OS • CONFIRMATION DESK</span>
      </footer>
    </main>
  );
}
