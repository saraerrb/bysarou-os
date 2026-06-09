"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Search, ChevronRight, Loader2 } from "lucide-react";
import { RETURN_STATUSES, RETURN_REASONS } from "@/lib/constants";
import { format } from "date-fns";
import Link from "next/link";
import ClientOnly from "@/components/ClientOnly";

export default function ReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/returns");
      const data = await res.json();
      setReturns(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch returns:", error);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const filteredReturns = (Array.isArray(returns) ? returns : []).filter((r: any) => {
    const customerName = r?.order?.customerName?.toLowerCase() || "";
    const customerPhone = r?.order?.customerPhone || "";
    const orderId = r?.order?.id || "";
    const searchTerm = search.toLowerCase();
    
    return customerName.includes(searchTerm) || 
           customerPhone.includes(search) ||
           orderId.includes(search);
  });

  return (
    <ClientOnly>
      <div className="fade-in">
        <div className="header-container">
          <div>
            <h1 className="page-title">Returns Management</h1>
            <p className="page-subtitle">Track, restock, and analyze product returns</p>
          </div>
          <div className="badge badge-neutral" style={{ padding: "8px 16px", fontSize: "14px" }}>
            {returns.length} Total Returns
          </div>
        </div>

        <div className="card" style={{ marginBottom: "24px", padding: "16px" }}>
          <div style={{ position: "relative", maxWidth: "400px" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-outline)",
              }}
            />
            <input
              type="text"
              className="input"
              placeholder="Search by customer or order ID..."
              style={{ paddingLeft: "40px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
            <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : filteredReturns.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Reason</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map((ret) => {
                  const statusConfig = RETURN_STATUSES.find(s => s.value === ret.status);
                  const reasonLabel = RETURN_REASONS.find(r => r.value === ret.reason)?.label || ret.reason;
                  
                  return (
                    <tr key={ret.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>#{ret?.order?.id ? ret.order.id.slice(-6).toUpperCase() : "N/A"}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{ret?.order?.customerName || "Unknown"}</div>
                        <div style={{ fontSize: "12px", color: "var(--color-outline)" }}>{ret?.order?.customerPhone || "N/A"}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px" }}>{reasonLabel}</span>
                      </td>
                      <td style={{ fontSize: "13px", color: "var(--color-on-surface-variant)" }}>
                        {ret.createdAt ? format(new Date(ret.createdAt), "MMM dd, yyyy") : "N/A"}
                      </td>
                      <td>
                        <span className="badge" style={{ 
                          background: statusConfig?.bg || "var(--color-surface-container)", 
                          color: statusConfig?.color || "var(--color-on-surface)",
                          fontWeight: 600,
                          fontSize: "11px"
                        }}>
                          {statusConfig?.label || ret.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Link href={`/returns/${ret.id}`} className="btn btn-ghost btn-sm btn-icon">
                            <ChevronRight size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ background: "var(--color-surface-variant)", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <RotateCcw size={40} style={{ color: "var(--color-outline)" }} />
            </div>
            <h3>No returns found</h3>
            <p style={{ color: "var(--color-outline)" }}>
              Returns are created from the Order details page or Shipping module.
            </p>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
