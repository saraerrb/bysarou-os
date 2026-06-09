"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ShippingLabelPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!order) return <div style={{ textAlign: "center", padding: "50px" }}>Order not found</div>;

  return (
    <div className="label-container">
      <div className="label-content">
        {/* Header */}
        <div className="label-header">
          <div className="carrier-info">
            <div className="carrier-name">{order.carrier?.name?.toUpperCase() || "MANUAL SHIPPING"}</div>
            <div className="tracking-id">TRK: {order.trackingNumber || "PENDING"}</div>
          </div>
          <div className="qr-placeholder">
            <div style={{ width: "60px", height: "60px", background: "black" }}></div>
          </div>
        </div>

        {/* SHIP TO Section */}
        <div className="section ship-to">
          <div className="section-title">SHIP TO:</div>
          <div className="customer-name">{order.customerName.toUpperCase()}</div>
          <div className="customer-address">{order.customerAddress}</div>
          <div className="customer-city">{order.customerCity?.toUpperCase()}, MOROCCO</div>
          <div className="customer-phone">{order.customerPhone}</div>
        </div>

        {/* SHIP FROM Section */}
        <div className="section ship-from">
          <div className="section-title">FROM:</div>
          <div className="sender-name">BYSAROU OS STORE</div>
          <div className="sender-address">Main Warehouse, Casablanca</div>
        </div>

        {/* Order Items Summary */}
        <div className="section order-details">
          <div className="section-title">ORDER CONTENTS:</div>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.variant.product.name} ({item.variant.color}/{item.variant.size})</td>
                  <td style={{ textAlign: "right" }}>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* COD Section - VERY IMPORTANT */}
        <div className="cod-box">
          <div className="cod-title">CASH ON DELIVERY (COD)</div>
          <div className="cod-amount">{(order.totalAmount || 0).toFixed(2)} MAD</div>
        </div>

        {/* Barcode placeholder */}
        <div className="barcode-area">
          <div className="barcode-visual"></div>
          <div className="order-id">ORD-{order.id.slice(-8).toUpperCase()}</div>
        </div>
      </div>

      <style jsx global>{`
        body {
          background: white !important;
          color: black !important;
          margin: 0;
          padding: 0;
          font-family: 'Inter', sans-serif;
        }
        .label-container {
          width: 100vw;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 40px;
        }
        .label-content {
          width: 400px;
          border: 2px solid black;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        .label-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid black;
          padding-bottom: 15px;
          margin-bottom: 15px;
        }
        .carrier-name {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -1px;
        }
        .tracking-id {
          font-size: 12px;
          font-weight: 600;
          margin-top: 4px;
        }
        .section {
          margin-bottom: 15px;
        }
        .section-title {
          font-size: 10px;
          font-weight: 800;
          color: #555;
          margin-bottom: 4px;
        }
        .customer-name {
          font-size: 18px;
          font-weight: 800;
        }
        .customer-address {
          font-size: 14px;
          margin-top: 4px;
        }
        .customer-city {
          font-size: 14px;
          font-weight: 700;
          margin-top: 2px;
        }
        .customer-phone {
          font-size: 14px;
          font-weight: 700;
          margin-top: 4px;
        }
        .ship-from {
          border-top: 1px dashed #ccc;
          padding-top: 10px;
        }
        .sender-name {
          font-size: 11px;
          font-weight: 700;
        }
        .sender-address {
          font-size: 11px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .items-table th {
          text-align: left;
          border-bottom: 1px solid black;
        }
        .cod-box {
          border: 4px solid black;
          padding: 10px;
          text-align: center;
          margin: 10px 0;
        }
        .cod-title {
          font-size: 12px;
          font-weight: 900;
        }
        .cod-amount {
          font-size: 28px;
          font-weight: 900;
        }
        .barcode-area {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .barcode-visual {
          width: 100%;
          height: 50px;
          background: repeating-linear-gradient(
            90deg,
            black,
            black 2px,
            transparent 2px,
            transparent 4px
          );
          margin-bottom: 5px;
        }
        .order-id {
          font-size: 10px;
          font-weight: 700;
        }
        @media print {
          .label-container {
            padding: 0;
          }
          .btn-ghost { display: none; }
        }
      `}</style>
    </div>
  );
}
