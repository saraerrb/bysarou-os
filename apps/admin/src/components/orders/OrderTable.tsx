"use client";

import { Eye, Trash2 } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import { format } from "date-fns";

interface Props {
  orders: any[];
  onView: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function OrderTable({ orders, onView, onUpdateStatus, onDelete }: Props) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div 
          key={order.id} 
          className="bg-white border border-outline-variant/30 luxury-shadow p-6 flex flex-col md:flex-row items-center gap-8 hover:border-primary transition-all duration-300"
        >
          <div className="flex-shrink-0 w-full md:w-48">
            <p className="label-caps text-[10px] mb-1">ID: #{order?.id ? order.id.slice(-6).toUpperCase() : "N/A"}</p>
            <p className="text-xl font-noto-serif text-on-surface">{order?.customerName || "Unknown"}</p>
            <p className="text-sm text-on-surface-variant font-medium">{order?.customerPhone || "N/A"}</p>
          </div>

          <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
            <div>
              <p className="label-caps text-[10px] mb-1">Timestamp</p>
              <p className="text-sm font-medium">{order?.createdAt ? format(new Date(order.createdAt), "Oct dd, HH:mm") : "N/A"}</p>
            </div>
            <div>
              <p className="label-caps text-[10px] mb-1">Location</p>
              <p className="text-sm font-medium">{order?.customerCity || "N/A"}</p>
            </div>
            <div>
              <p className="label-caps text-[10px] mb-1">Value</p>
              <p className="text-sm font-bold text-primary">{(order?.totalAmount || 0).toLocaleString()} MAD</p>
            </div>
            <div>
              <p className="label-caps text-[10px] mb-1">Status</p>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button 
              className="flex-1 md:flex-none px-6 py-2 border border-outline-variant text-on-surface-variant label-caps text-[10px] hover:bg-surface transition-all"
              onClick={() => onView(order.id)}
            >
              VIEW DETAIL
            </button>
            {(order.status === "NEW" || order.status === "PENDING_CONFIRMATION") && (
              <button 
                className="flex-1 md:flex-none px-6 py-2 bg-primary text-white label-caps text-[10px] hover:opacity-90 transition-all"
                onClick={() => onUpdateStatus(order.id, "CONFIRMED")}
              >
                APPROVE
              </button>
            )}
            <button 
              className="px-3 py-2 text-error hover:bg-error/5 transition-all"
              onClick={() => onDelete(order.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}

      <style jsx>{`
        .font-noto-serif {
          font-family: var(--font-noto-serif), serif;
        }
      `}</style>
    </div>
  );
}
