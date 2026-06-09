"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  Database,
  Search
} from "lucide-react";
import { format } from "date-fns";

export default function AutomationsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/automations");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Polling
    return () => clearInterval(interval);
  }, []);

  const handleRetry = async (log: any) => {
    const id = `${log.entityId}-${log.ruleName}`;
    setRetrying(id);
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleName: log.ruleName, entityId: log.entityId }),
      });
      if (res.ok) {
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRetrying(null);
    }
  };

  const filteredLogs = logs.filter(l => 
    l.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="header-container">
        <div>
          <h1 className="page-title">Automation Engine</h1>
          <p className="page-subtitle">Monitoring background business rules and event triggers</p>
        </div>
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: "32px" }}>
        <div className="stat-card">
          <CheckCircle size={20} color="var(--success)" />
          <div>
            <div className="stat-value">{logs.filter(l => l.status === "SUCCESS").length}</div>
            <div className="stat-label">Successful Rules</div>
          </div>
        </div>
        <div className="stat-card">
          <XCircle size={20} color="var(--danger)" />
          <div>
            <div className="stat-value">{logs.filter(l => l.status === "FAILED").length}</div>
            <div className="stat-label">Failed Triggers</div>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={20} color="var(--primary)" />
          <div>
            <div className="stat-value">{logs.length}</div>
            <div className="stat-label">Total Events Logs</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Event / Rule</th>
              <th>Target ID</th>
              <th>Status</th>
              <th>Outcome / Details</th>
              <th>Executed At</th>
              <th style={{ textAlign: "right" }}>Control</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                  <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
                </td>
              </tr>
            ) : filteredLogs.map((log) => (
              <tr key={`${log.entityId}-${log.ruleName}`}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                    <Zap size={14} color="var(--color-primary)" />
                    {log.ruleName.replace(/_/g, " ")}
                  </div>
                </td>
                <td style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--color-outline)" }}>
                  {log.entityId}
                </td>
                <td>
                  <span className={`badge ${log.status === "SUCCESS" ? "badge-success" : "badge-danger"}`}>
                    {log.status}
                  </span>
                </td>
                <td style={{ maxWidth: "300px" }}>
                  <div style={{ 
                    fontSize: "12px", 
                    color: log.status === "FAILED" ? "var(--color-error)" : "var(--color-on-surface-variant)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {log.details || "No details available"}
                  </div>
                </td>
                <td style={{ fontSize: "12px", color: "var(--color-outline)" }}>
                  {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                </td>
                <td style={{ textAlign: "right" }}>
                  <button 
                    className="btn btn-ghost btn-sm btn-icon" 
                    title="Retry Automation"
                    disabled={retrying === `${log.entityId}-${log.ruleName}`}
                    onClick={() => handleRetry(log)}
                  >
                    {retrying === `${log.entityId}-${log.ruleName}` ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <RotateCcw size={14} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-surface-container);
          border: 1px solid var(--color-outline-variant);
          padding: 8px 16px;
          width: 300px;
        }
        .search-box input {
          background: transparent;
          border: none;
          color: var(--color-on-surface);
          outline: none;
          font-size: 14px;
          width: 100%;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: var(--color-surface-container-lowest);
          border: 1px solid var(--color-outline-variant);
        }
        .stat-value {
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
        }
        .stat-label {
          font-size: 12px;
          color: var(--color-outline);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
