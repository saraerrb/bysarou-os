"use client";

import { useState, useEffect } from "react";
import { UserPlus, Shield, Mail, Trash2, Edit, Loader2, UserX, UserCheck } from "lucide-react";
import { format } from "date-fns";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "CALL_AGENT" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        setShowModal(false);
        setNewUser({ name: "", email: "", password: "", role: "CALL_AGENT" });
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in">
      <div className="header-container">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Manage system users and access permissions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
          <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ opacity: user.isActive ? 1 : 0.6 }}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="user-avatar">{user.name?.[0] || user.email[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.name || "Unnamed User"}</div>
                        <div style={{ fontSize: "11px", color: "var(--color-outline)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Mail size={10} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select 
                      className="role-select" 
                      value={user.role} 
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    >
                      <option value="ADMIN">Owner/Admin</option>
                      <option value="MANAGER">Manager</option>
                      <option value="CALL_AGENT">Call Agent</option>
                      <option value="WAREHOUSE">Warehouse</option>
                      <option value="FINANCE">Finance</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? "badge-success" : "badge-neutral"}`} style={{ fontSize: "10px" }}>
                      {user.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--color-outline)" }}>
                    {format(new Date(user.createdAt), "MMM dd, yyyy")}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button 
                      className="btn btn-ghost btn-sm btn-icon" 
                      style={{ color: user.isActive ? "var(--color-error)" : "var(--success)" }}
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                    >
                      {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "450px" }}>
            <h2>Create Team Member</h2>
            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="input" required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="e.g. Samir Alaoui" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="input" required value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="samir@bysarou.com" />
              </div>
              <div className="form-group">
                <label>Initial Password</label>
                <input type="password" className="input" required value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>System Role</label>
                <select className="input" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="ADMIN">Owner/Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="CALL_AGENT">Call Agent</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="FINANCE">Finance</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Account</button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-avatar {
          width: 36px;
          height: 36px;
          background: var(--color-primary);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          text-transform: uppercase;
        }
        .role-select {
          background: var(--color-surface-container);
          border: 1px solid var(--color-outline-variant);
          color: var(--color-on-surface);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(6px);
        }
        .modal-content {
          background: var(--color-surface-container-lowest);
          padding: 32px;
          border: 1px solid var(--color-outline-variant);
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}
