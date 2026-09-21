"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, Package, AlertTriangle, X } from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "ALL" ||
      (filter === "LOW" && p.currentStock <= p.minimumStock && p.currentStock > 0) ||
      (filter === "OUT" && p.currentStock === 0) ||
      (filter === "IN" && p.currentStock > p.minimumStock);
    return matchesSearch && matchesFilter;
  });

  const lowCount = products.filter((p) => p.currentStock <= p.minimumStock && p.currentStock > 0).length;
  const outCount = products.filter((p) => p.currentStock === 0).length;

  const status = (p: any) => {
    if (p.currentStock === 0) return { dot: "bg-red-500", label: "Out of stock", color: "text-red-500" };
    if (p.currentStock <= p.minimumStock) return { dot: "bg-amber-500", label: "Low stock", color: "text-amber-500" };
    return { dot: "bg-emerald-500", label: "In stock", color: "text-emerald-500" };
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage products and stock levels</p>
          </div>
          <Link
            href="/manager/inventory/new"
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Products</p>
            <p className="text-2xl font-bold text-foreground mt-1">{products.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Low Stock</p>
            <p className="text-2xl font-bold text-amber-500 mt-1">{lowCount}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Out of Stock</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{outCount}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg mb-4 p-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
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
            <option value="ALL">All</option>
            <option value="IN">In stock</option>
            <option value="LOW">Low stock</option>
            <option value="OUT">Out of stock</option>
          </select>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              <Package className="mx-auto h-12 w-12 opacity-20 mb-3" />
              No products found
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">SKU</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const s = status(p);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className={"border-b border-border last:border-0 cursor-pointer transition-colors " + (selected?.id === p.id ? "bg-accent" : "hover:bg-accent/50")}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{p.sku}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{p.category?.name || "—"}</td>
                      <td className="px-5 py-4 text-sm font-medium text-foreground text-right">
                        {Number(p.sellingPrice).toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-foreground text-right">{p.currentStock}</td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-2 text-xs">
                          <span className={"w-1.5 h-1.5 rounded-full " + s.dot}></span>
                          <span className={s.color + " font-medium"}>{s.label}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <div className="w-[420px] bg-card border-l border-border fixed right-0 top-0 h-screen overflow-y-auto z-20 shadow-xl">
          <div className="px-5 py-4 border-b border-border flex items-start justify-between sticky top-0 bg-card z-10">
            <div>
              <h2 className="text-base font-bold text-foreground">{selected.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.sku}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-border">
            <div className="bg-background rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">Current Stock</p>
              <p className="text-2xl font-bold text-foreground">{selected.currentStock}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.unit || "pcs"}</p>
            </div>
            <div className="bg-background rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">Min. Stock</p>
              <p className="text-2xl font-bold text-foreground">{selected.minimumStock}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.unit || "pcs"}</p>
            </div>
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pricing</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Purchase</span>
                <span className="text-sm font-medium text-foreground">{Number(selected.purchasePrice).toLocaleString()} ETB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Selling</span>
                <span className="text-sm font-bold text-foreground">{Number(selected.sellingPrice).toLocaleString()} ETB</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Margin</span>
                <span className="text-sm font-medium text-emerald-500">
                  {Number(selected.sellingPrice) - Number(selected.purchasePrice)} ETB
                </span>
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Details</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="text-sm text-foreground">{selected.category?.name || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Barcode</span>
                <span className="text-sm text-foreground">{selected.barcode || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}