"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

export default function RegisterAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card fade-in" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--success-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)" }}>
              <CheckCircle2 size={32} />
            </div>
          </div>
          <h1 className="auth-title">Setup Complete!</h1>
          <p className="auth-subtitle">
            Admin account and "BySarou" store created successfully.<br />
            Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="auth-container" suppressHydrationWarning>
        <div className="auth-card fade-in" suppressHydrationWarning>
          <div className="auth-header">
            <div className="auth-logo">
              <ShieldCheck size={28} />
            </div>
            <h1 className="auth-title">Initial Setup</h1>
            <p className="auth-subtitle">Create your root administrator account and first store</p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  id="name"
                  type="text"
                  className="input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="admin@bysarou.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Initializing System...
                </>
              ) : (
                <>
                  Create Account & Store <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <a href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign In</a>
          </div>
        </div>

        <style jsx>{`
          .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-main);
            padding: 20px;
          }
          .auth-card {
            width: 100%;
            max-width: 440px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 40px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          }
          .auth-header {
            text-align: center;
            margin-bottom: 32px;
          }
          .auth-logo {
            width: 56px;
            height: 56px;
            background: var(--gradient-primary);
            color: white;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            box-shadow: var(--shadow-primary);
          }
          .auth-title {
            font-size: 24px;
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 8px;
            letter-spacing: -0.02em;
          }
          .auth-subtitle {
            font-size: 14px;
            color: var(--text-muted);
            line-height: 1.5;
          }
          .auth-error {
            padding: 12px 16px;
            background: rgba(214, 48, 49, 0.1);
            border: 1px solid rgba(214, 48, 49, 0.2);
            border-radius: var(--radius-sm);
            color: var(--danger);
            font-size: 14px;
            margin-bottom: 24px;
            text-align: center;
          }
          .auth-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .form-group label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 8px;
          }
          .input-wrapper {
            position: relative;
          }
          .input-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
          }
          .input {
            padding-left: 40px !important;
          }
          .auth-footer {
            margin-top: 32px;
            text-align: center;
            font-size: 14px;
            color: var(--text-muted);
          }
        `}</style>
      </div>
    </ClientOnly>
  );
}
