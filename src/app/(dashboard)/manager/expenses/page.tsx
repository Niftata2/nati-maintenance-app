"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Receipt, X, Calendar, User, TrendingDown } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "Supplies",
    amount: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          amount: parseFloat(formData.amount) || 0,
          description: formData.description,
        }),
      });
      if (!res.ok) throw new Error("Failed to create expense");
      setFormData({ name: "", category: "Supplies", amount: "", description: "" });
      setShowForm(false);
      fetchExpenses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = expenses.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch = !search || e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    const matchesFilter = filter === "ALL" || e.category === filter;
    return matchesSearch && matchesFilter;
  });

  const totalAll = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalToday = expenses
    .filter((e) => new Date(e.date || e.createdAt) >= today)
    .reduce((s, e) => s + Number(e.amount), 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const totalMonth = expenses
    .filter((e) => new Date(e.date || e.createdAt) >= monthStart)
    .reduce((s, e) => s + Number(e.amount), 0);

  const categories = Array.from(new Set(expenses.map((e) => e.category)));
  const categoryColor = (c: string) => {
    const colors: Record<string, string> = {
      Rent: "bg-purple-500/10 text-purple-500",
      Electricity: "bg-amber-500/10 text-amber-500",
      Internet: "bg-blue-500/10 text-blue-500",
      Transport: "bg-cyan-500/10 text-cyan-500",
      Salaries: "bg-pink-500/10 text-pink-500",
      Supplies: "bg-emerald-500/10 text-emerald-500",
      Maintenance: "bg-orange-500/10 text-orange-500",
      Other: "bg-zinc-500/10 text-zinc-400",
    };
    return colors[c] || "bg-zinc-500/10 text-zinc-400";
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
            <p className="text-sm text-muted-foreground mt-1">Record and track business expenses</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Today</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalToday.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">ETB</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">This Month</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalMonth.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">ETB</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Total All-Time
            </p>
            <p className="text-2xl font-bold text-red-500 mt-1">{totalAll.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">ETB</p>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-card border border-border rounded-lg p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">New Expense</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-sm text-red-500">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Expense Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Electric bill October"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Amount (ETB) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Rent</option>
                  <option>Electricity</option>
                  <option>Internet</option>
                  <option>Transport</option>
                  <option>Salaries</option>
                  <option>Supplies</option>
                  <option>Maintenance</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional notes..."
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Expense"}
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

        {/* Filter */}
        <div className="bg-card border border-border rounded-lg mb-4 p-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              <Receipt className="mx-auto h-12 w-12 opacity-20 mb-3" />
              No expenses yet
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Expense</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((expense) => (
                  <tr
                    key={expense.id}
                    onClick={() => setSelected(expense)}
                    className={"border-b border-border last:border-0 cursor-pointer transition-colors " + (selected?.id === expense.id ? "bg-accent" : "hover:bg-accent/50")}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{expense.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={"px-2 py-0.5 rounded text-xs font-medium " + categoryColor(expense.category)}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {formatDate(expense.date || expense.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-red-500 text-right">
                      - {Number(expense.amount).toLocaleString()} ETB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <div className="w-[420px] bg-card border-l border-border fixed right-0 top-0 h-screen overflow-y-auto z-20 shadow-xl">
          <div className="px-5 py-4 border-b border-border flex items-start justify-between sticky top-0 bg-card z-10">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Expense</p>
              <h2 className="text-base font-bold text-foreground">{selected.name}</h2>
            </div>
            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 py-6 border-b border-border text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Amount</p>
            <p className="text-3xl font-bold text-red-500">- {Number(selected.amount).toLocaleString()} ETB</p>
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Category</h3>
            <span className={"px-2 py-0.5 rounded text-xs font-medium " + categoryColor(selected.category)}>
              {selected.category}
            </span>
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Date</h3>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {new Date(selected.date || selected.createdAt).toLocaleDateString("en-GB", {
                weekday: "long", day: "2-digit", month: "long", year: "numeric",
              })}
            </div>
          </div>

          {selected.description && (
            <div className="px-5 py-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</h3>
              <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}