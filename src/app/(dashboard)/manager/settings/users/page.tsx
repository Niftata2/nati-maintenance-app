"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X, User, Mail, Phone, Check, Ban, Wrench, Lock } from "lucide-react";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count?: { technicianJobs: number; createdJobs: number };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<UserRecord | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "TECHNICIAN",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }
      setSuccess("User created successfully");
      setFormData({ name: "", email: "", phone: "", password: "", role: "TECHNICIAN" });
      setShowForm(false);
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user: UserRecord) => {
    try {
      const res = await fetch("/api/users/" + user.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        fetchUsers();
        if (selected?.id === user.id) {
          setSelected({ ...user, isActive: !user.isActive });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone?.includes(q);
    const matchesFilter = filter === "ALL" || u.role === filter;
    return matchesSearch && matchesFilter;
  });

  const roleColor = (r: string) => {
    if (r === "OWNER") return "bg-purple-500/10 text-purple-500";
    if (r === "CASHIER") return "bg-blue-500/10 text-blue-500";
    return "bg-emerald-500/10 text-emerald-500";
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const counts = {
    ALL: users.length,
    OWNER: users.filter((u) => u.role === "OWNER").length,
    CASHIER: users.filter((u) => u.role === "CASHIER").length,
    TECHNICIAN: users.filter((u) => u.role === "TECHNICIAN").length,
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              User Management
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Manage staff accounts and fix men
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 md:px-4 py-2 bg-primary text-primary-foreground text-xs md:text-sm font-medium rounded-lg hover:opacity-90 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>

        {success && (
          <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-sm text-emerald-500 flex items-center gap-2">
            <Check className="h-4 w-4" />
            {success}
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div className="bg-card border border-border rounded-lg p-4 md:p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Create New User</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-md text-sm text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "TECHNICIAN", label: "Fix Man" },
                    { key: "CASHIER", label: "Cashier" },
                    { key: "OWNER", label: "Owner" },
                  ].map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.key })}
                      className={
                        "py-2 text-sm font-medium rounded-md border transition-colors " +
                        (formData.role === r.key
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/50")
                      }
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 border border-border text-foreground text-sm rounded-md hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg mb-4 p-1 flex gap-1 overflow-x-auto">
          {[
            { key: "ALL", label: "All" },
            { key: "OWNER", label: "Owners" },
            { key: "CASHIER", label: "Cashiers" },
            { key: "TECHNICIAN", label: "Fix Men" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={
                "px-3 py-2 text-xs md:text-sm font-medium rounded-md whitespace-nowrap transition-colors " +
                (filter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent")
              }
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-60">{counts[tab.key as keyof typeof counts]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-card border border-border rounded-lg mb-4 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Users list */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No users found
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelected(user)}
                  className={
                    "p-4 cursor-pointer transition-colors " +
                    (selected?.id === user.id ? "bg-accent" : "hover:bg-accent/50")
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-xs">
                          {getInitials(user.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-xs text-muted-foreground">
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={"px-2 py-0.5 rounded text-xs font-medium " + roleColor(user.role)}>
                        {user.role === "TECHNICIAN" ? "FIX MAN" : user.role}
                      </span>
                      <span
                        className={
                          "text-xs font-medium " +
                          (user.isActive ? "text-emerald-500" : "text-red-500")
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side panel */}
      {selected && (
        <div className="hidden lg:block w-[400px] bg-card border-l border-border fixed right-0 top-0 h-screen overflow-y-auto z-20 shadow-xl">
          <div className="px-5 py-4 border-b border-border flex items-start justify-between sticky top-0 bg-card z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {getInitials(selected.name)}
                </span>
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">{selected.name}</h2>
                <span className={"inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium " + roleColor(selected.role)}>
                  {selected.role === "TECHNICIAN" ? "FIX MAN" : selected.role}
                </span>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{selected.email}</span>
              </div>
              {selected.phone && (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {selected.phone}
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Account
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className={"px-2 py-0.5 rounded text-xs font-medium " + roleColor(selected.role)}>
                  {selected.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span
                  className={
                    "text-sm font-medium " +
                    (selected.isActive ? "text-emerald-500" : "text-red-500")
                  }
                >
                  {selected.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Joined</span>
                <span className="text-sm text-foreground">
                  {new Date(selected.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 sticky bottom-0 bg-card border-t border-border">
            <button
              onClick={() => toggleStatus(selected)}
              className={
                "w-full py-2.5 text-sm font-medium rounded-md flex items-center justify-center gap-2 " +
                (selected.isActive
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20")
              }
            >
              {selected.isActive ? (
                <>
                  <Ban className="h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Activate
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}