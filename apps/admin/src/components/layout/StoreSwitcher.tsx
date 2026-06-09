"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Store as StoreIcon, Plus, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StoreSwitcher() {
  const [stores, setStores] = useState<any[]>([]);
  const [activeStore, setActiveStore] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadStores = async () => {
      try {
        const res = await fetch("/api/stores");
        const data = await res.json();
        setStores(data.stores);
        setActiveStore(data.activeStore);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, []);

  const handleSwitch = async (storeId: string) => {
    setIsOpen(false);
    try {
      await fetch(`/api/stores/switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      router.refresh();
      window.location.reload(); // Hard refresh to reset all contexts
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="store-switcher-loading"><Loader2 size={16} className="animate-spin" /></div>;

  return (
    <div className="store-switcher" suppressHydrationWarning>
      <button className="switcher-toggle" onClick={() => setIsOpen(!isOpen)}>
        <div className="store-icon-box">
          <StoreIcon size={18} />
        </div>
        <div className="store-info">
          <span className="store-name">{activeStore?.name || "Select Store"}</span>
          <span className="store-role">Active Store</span>
        </div>
        <ChevronDown size={14} className={`chevron ${isOpen ? "rotate" : ""}`} />
      </button>

      {isOpen && (
        <div className="switcher-dropdown">
          <div className="dropdown-label">Your Stores</div>
          {stores.map((s) => (
            <button 
              key={s.id} 
              className={`store-item ${s.id === activeStore?.id ? "active" : ""}`}
              onClick={() => handleSwitch(s.id)}
            >
              <StoreIcon size={14} />
              <span>{s.name}</span>
              {s.id === activeStore?.id && <Check size={14} style={{ marginLeft: "auto" }} />}
            </button>
          ))}
          <div className="dropdown-divider" />
          <button className="store-item create-btn" onClick={() => router.push("/stores/new")}>
            <Plus size={14} />
            <span>Create New Store</span>
          </button>
        </div>
      )}

      <style jsx>{`
        .store-switcher {
          position: relative;
          width: 100%;
          padding: 0 8px;
          margin-bottom: 12px;
        }
        .switcher-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: var(--color-surface-container-low);
          border: 1px solid var(--color-outline-variant);
          border-radius: 0;
          color: var(--color-on-surface);
          cursor: pointer;
          transition: all 0.2s;
        }
        .switcher-toggle:hover {
          background: var(--color-surface-container-high);
          border-color: var(--color-primary);
        }
        .store-icon-box {
          width: 32px;
          height: 32px;
          background: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .store-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
          overflow: hidden;
        }
        .store-name {
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--color-on-surface);
        }
        .store-role {
          font-size: 10px;
          color: var(--color-outline);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .chevron {
          color: var(--color-outline);
          transition: transform 0.2s;
        }
        .chevron.rotate {
          transform: rotate(180deg);
        }
        .switcher-dropdown {
          position: absolute;
          top: 100%;
          left: 8px;
          right: 8px;
          margin-top: 8px;
          background: var(--color-surface-container-lowest);
          border: 1px solid var(--color-outline-variant);
          padding: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.12);
          z-index: 100;
        }
        .dropdown-label {
          padding: 8px 12px;
          font-size: 10px;
          font-weight: 800;
          color: var(--color-outline);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .store-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: transparent;
          border: none;
          color: var(--color-on-surface-variant);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .store-item:hover {
          background: var(--color-surface-container);
          color: var(--color-on-surface);
        }
        .store-item.active {
          background: rgba(119, 90, 25, 0.05);
          color: var(--color-primary);
          font-weight: 600;
        }
        .dropdown-divider {
          height: 1px;
          background: var(--color-outline-variant);
          margin: 8px 0;
        }
        .create-btn {
          color: var(--success);
          font-weight: 600;
        }
        .store-switcher-loading {
          padding: 20px;
          text-align: center;
          color: var(--color-outline);
        }
      `}</style>
    </div>
  );
}
