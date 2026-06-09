"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOROCCAN_CITIES } from "@/lib/constants";

export default function AddOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
  });

  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [codFee, setCodFee] = useState(0);
  const [packagingCost, setPackagingCost] = useState(0);
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<any[]>([
    { productId: "", variantId: "", quantity: 1, price: 0, variants: [] }
  ]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const handleProductChange = (index: number, productId: string) => {
    const newItems = [...items];
    const product = products.find((p: any) => p.id === productId);
    
    newItems[index].productId = productId;
    newItems[index].price = product?.sellingPrice || 0;
    newItems[index].variants = product?.variants || [];
    newItems[index].variantId = product?.variants?.[0]?.id || "";
    
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: "", variantId: "", quantity: 1, price: 0, variants: [] }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + 
                parseFloat(shippingCost.toString() || "0") + 
                parseFloat(codFee.toString() || "0") + 
                parseFloat(packagingCost.toString() || "0");
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customer.name,
          customerPhone: customer.phone,
          city,
          address,
          notes,
          shippingCost,
          codFee,
          packagingCost,
          items: items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: calculateTotal()
        }),
      });

      if (res.ok) {
        router.push("/orders");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div className="header-container">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/orders" className="btn btn-ghost btn-sm btn-icon">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title">Create Manual Order</h1>
            <p className="page-subtitle">Add a new customer order for COD</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Customer Section */}
          <div className="card">
            <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              Customer Information
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="e.g. Amina Alaoui"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="e.g. 0612345678"
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <select
                  className="input"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Select City</option>
                  {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Building, Apartment..."
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label>Internal Notes</label>
              <textarea
                className="input"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for confirmation or delivery..."
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}>Order Items</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
                <Plus size={16} /> Add Product
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {items.map((item, index) => (
                <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 120px 40px", gap: "12px", alignItems: "flex-end" }}>
                  <div className="form-group">
                    {index === 0 && <label>Product</label>}
                    <select
                      className="input"
                      required
                      value={item.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                    >
                      <option value="">Select Product</option>
                      {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    {index === 0 && <label>Variant (Size/Color)</label>}
                    <select
                      className="input"
                      required
                      disabled={!item.productId}
                      value={item.variantId}
                      onChange={(e) => handleItemChange(index, "variantId", e.target.value)}
                    >
                      <option value="">Select Variant</option>
                      {item.variants.map((v: any) => (
                        <option key={v.id} value={v.id}>
                          {v.color} - {v.size} ({v.stockQuantity} in stock)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    {index === 0 && <label>Qty</label>}
                    <input
                      type="number"
                      className="input"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    {index === 0 && <label>Price (MAD)</label>}
                    <input
                      type="number"
                      className="input"
                      required
                      value={item.price}
                      onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value))}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    style={{ marginBottom: "8px", color: "var(--danger)" }}
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="card shadow-lg" style={{ position: "sticky", top: "24px" }}>
            <h3 style={{ marginBottom: "20px" }}>Order Summary</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>Subtotal</span>
                <span>{(calculateTotal() - shippingCost - codFee - packagingCost).toFixed(2)} MAD</span>
              </div>
              <div className="form-group">
                <label>Shipping Cost</label>
                <input
                  type="number"
                  className="input"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label>COD Fee</label>
                  <input
                    type="number"
                    className="input"
                    value={codFee}
                    onChange={(e) => setCodFee(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>Packaging</label>
                  <input
                    type="number"
                    className="input"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)" }}>
                  {calculateTotal().toFixed(2)} MAD
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "24px", height: "48px" }}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Order</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
