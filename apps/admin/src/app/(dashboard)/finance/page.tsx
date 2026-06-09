"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Plus, 
  Calendar,
  Loader2,
  Trash2,
  PieChart,
  BarChart3,
  ArrowRight
} from "lucide-react";
import { format, subDays } from "date-fns";
import ClientOnly from "@/components/ClientOnly";
import Link from "next/link";

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: "", notes: "", date: format(new Date(), "yyyy-MM-dd") });

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(dateRange).toString();
      const [statsRes, expensesRes] = await Promise.all([
        fetch(`/api/finance/stats?${query}`),
        fetch("/api/finance/expenses")
      ]);
      
      const statsData = await statsRes.json();
      const expensesData = await expensesRes.json();
      
      setStats(statsData);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
    } catch (error) {
      console.error(error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });
      if (res.ok) {
        setShowExpenseModal(false);
        setNewExpense({ amount: "", notes: "", date: format(new Date(), "yyyy-MM-dd") });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const summary = stats?.summary || { 
    totalRevenue: 0, 
    totalCosts: 0, 
    netProfit: 0, 
    profitMargin: "0.0%",
  };
  
  const breakdown = stats?.breakdown || { byCity: [], byProduct: [] };

  return (
    <ClientOnly>
      <main className="max-w-container-max mx-auto px-margin-desktop py-12">
        {/* Finance Header */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-4">
              <span className="font-label-caps text-primary tracking-[0.2em] uppercase text-xs">FISCAL AUDIT</span>
              <h1 className="font-display-xl text-[64px] leading-tight text-on-surface">Finance & Profit</h1>
              <p className="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed italic">
                Precision net profit analysis and logistical cost auditing within the commerce grid.
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowExpenseModal(true)}
                className="bg-white border border-outline-variant px-8 py-4 font-label-caps text-[11px] hover:border-primary transition-all flex items-center gap-3 tracking-widest"
              >
                <Plus size={18} /> LOG EXPENSE
              </button>
              <div className="bg-primary/5 border border-primary/20 px-6 py-3 flex items-center gap-4">
                <Calendar size={18} className="text-primary" />
                <div className="flex items-center gap-2 font-data-mono text-xs font-bold text-primary">
                  <input 
                    type="date" 
                    className="bg-transparent outline-none" 
                    value={dateRange.startDate} 
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} 
                  />
                  <span>—</span>
                  <input 
                    type="date" 
                    className="bg-transparent outline-none" 
                    value={dateRange.endDate} 
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Scorecards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="bg-white p-10 hairline-border luxury-card-shadow">
            <div className="flex justify-between items-start mb-12">
              <span className="font-label-caps text-[11px] text-outline">GROSS REVENUE</span>
              <ArrowUpCircle className="text-primary opacity-30" size={20} />
            </div>
            <p className="font-headline-lg text-[36px] text-on-surface">{(summary.totalRevenue || 0).toLocaleString()} <span className="text-lg font-body-md">MAD</span></p>
          </div>

          <div className="bg-white p-10 hairline-border luxury-card-shadow">
            <div className="flex justify-between items-start mb-12">
              <span className="font-label-caps text-[11px] text-outline">TOTAL COSTS</span>
              <ArrowDownCircle className="text-error opacity-30" size={20} />
            </div>
            <p className="font-headline-lg text-[36px] text-on-surface">{(summary.totalCosts || 0).toLocaleString()} <span className="text-lg font-body-md">MAD</span></p>
          </div>

          <div className="bg-primary p-10 luxury-card-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="flex justify-between items-start mb-12 relative z-10">
              <span className="font-label-caps text-[11px] text-white/70">NET PROFIT</span>
              <DollarSign className="text-white opacity-50" size={20} />
            </div>
            <p className="font-headline-lg text-[36px] text-white relative z-10">{(summary.netProfit || 0).toLocaleString()} <span className="text-lg font-body-md text-white/70">MAD</span></p>
          </div>

          <div className="bg-white p-10 hairline-border luxury-card-shadow">
            <div className="flex justify-between items-start mb-12">
              <span className="font-label-caps text-[11px] text-outline">MARGIN</span>
              <TrendingUp className="text-primary opacity-30" size={20} />
            </div>
            <p className="font-headline-lg text-[36px] text-on-surface">{summary.profitMargin || "0.0%"}</p>
          </div>
        </section>

        {/* Profitability Matrices */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* By Product */}
          <div className="bg-white p-12 hairline-border luxury-card-shadow">
            <div className="flex items-center justify-between mb-12">
              <h3 className="font-headline-md text-2xl">Yield by Artifact</h3>
              <BarChart3 size={20} className="text-primary opacity-30" />
            </div>
            <div className="space-y-6">
              {(breakdown.byProduct || []).map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-6 bg-surface-container/30 border-l-2 border-primary">
                  <p className="font-headline-md text-lg text-on-surface">{p.name}</p>
                  <p className="font-data-mono text-lg font-bold text-primary">+{(p.profit || 0).toLocaleString()} MAD</p>
                </div>
              ))}
            </div>
          </div>

          {/* By City */}
          <div className="bg-white p-12 hairline-border luxury-card-shadow">
            <div className="flex items-center justify-between mb-12">
              <h3 className="font-headline-md text-2xl">Regional Profitability</h3>
              <PieChart size={20} className="text-primary opacity-30" />
            </div>
            <div className="space-y-6">
              {(breakdown.byCity || []).map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-6 bg-surface-container/30 border-l-2 border-primary">
                  <p className="font-headline-md text-lg text-on-surface">{c.name}</p>
                  <p className="font-data-mono text-lg font-bold text-primary">+{(c.profit || 0).toLocaleString()} MAD</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cost Audit Ledger */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 bg-white p-10 hairline-border luxury-card-shadow">
            <h3 className="font-label-caps text-[11px] text-primary mb-12 tracking-widest uppercase">Cost Breakdown</h3>
            <div className="space-y-8">
              {[
                { label: "Product COGS", value: stats.summary.totalProductCost },
                { label: "Shipping Grid", value: stats.summary.totalShippingCost },
                { label: "COD Gateways", value: stats.summary.totalCodFee },
                { label: "Packaging Material", value: stats.summary.totalPackagingCost },
                { label: "Acquisition (Ads)", value: stats.summary.totalAdsCost },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <span className="font-label-caps text-[10px] text-on-surface-variant group-hover:text-on-surface transition-colors">{item.label}</span>
                  <span className="font-data-mono text-sm font-bold">{(item.value || 0).toLocaleString()} MAD</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white p-10 hairline-border luxury-card-shadow">
            <div className="flex items-center justify-between mb-12">
              <h3 className="font-label-caps text-[11px] text-primary tracking-widest uppercase">Operational Expenses</h3>
              <span className="font-data-mono text-[10px] text-outline uppercase">Recent Artifacts</span>
            </div>
            <div className="space-y-4">
              {(expenses || []).slice(0, 5).map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-6 bg-surface-container/10 hover:bg-white border border-transparent hover:border-outline-variant/30 transition-all group">
                  <div className="flex items-center gap-8">
                    <span className="font-data-mono text-[10px] text-outline uppercase">{format(new Date(exp.date), "MMM dd")}</span>
                    <div>
                      <p className="font-headline-md text-lg text-on-surface">{exp.notes || "Operational Expenditure"}</p>
                      <span className="font-label-caps text-[9px] text-outline-variant tracking-widest">ADVERTISING ACQUISITION</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <p className="font-data-mono text-lg font-bold text-error">-{exp.amount.toLocaleString()} MAD</p>
                    <button 
                      className="text-error opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={async () => {
                        if (!confirm("Delete this expense?")) return;
                        try {
                          const res = await fetch(`/api/finance/expenses/${exp.id}`, { method: "DELETE" });
                          if (res.ok) fetchData();
                        } catch (err) {
                          console.error("Delete error:", err);
                        }
                      }}
                    ><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Expense Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-[480px] p-12 hairline-border luxury-card-shadow relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <h2 className="font-headline-md text-3xl mb-12">Log Expenditure</h2>
              <form onSubmit={handleAddExpense} className="space-y-8">
                <div className="space-y-2">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Amount (MAD)</label>
                  <input type="number" className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 outline-none transition-all font-body-md text-sm" required value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Date</label>
                  <input type="date" className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 outline-none transition-all font-data-mono text-sm uppercase" required value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-widest block">Notes / Reason</label>
                  <input type="text" className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary py-3 outline-none transition-all font-body-md text-sm italic" value={newExpense.notes} onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })} />
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="submit" className="flex-1 bg-primary text-white py-5 font-label-caps text-[12px] tracking-[0.2em] shadow-lg hover:opacity-90">ARCHIVE EXPENSE</button>
                  <button type="button" className="flex-1 bg-surface-container py-5 font-label-caps text-[12px] tracking-[0.2em] hover:bg-outline-variant/10" onClick={() => setShowExpenseModal(false)}>CANCEL</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer className="py-20 text-center">
          <span className="font-label-caps text-[10px] tracking-[0.5em] text-outline uppercase">BySarou Fiscal Unit</span>
        </footer>
      </main>
    </ClientOnly>
  );
}
