"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, Save } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [description, setDescription] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {});
    fetch("/api/suppliers").then(r => r.json()).then(setSuppliers).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name || !sku || !sellingPrice) {
      setError("Please fill in Name, SKU, and Selling Price");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sku,
          barcode,
          categoryId: categoryId || null,
          supplierId: supplierId || null,
          purchasePrice: parseFloat(purchasePrice) || 0,
          sellingPrice: parseFloat(sellingPrice),
          currentStock: parseInt(currentStock) || 0,
          minimumStock: parseInt(minimumStock) || 0,
          unit,
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add product");
      }

      const product = await response.json();
      setSuccess("Product added successfully!");
      setName("");
      setSku("");
      setBarcode("");
      setCategoryId("");
      setSupplierId("");
      setPurchasePrice("");
      setSellingPrice("");
      setCurrentStock("");
      setMinimumStock("");
      setDescription("");

      setTimeout(() => {
        setSuccess("");
        router.push("/inventory");
      }, 2000);

    } catch (error) {
      setError(error.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., iPhone Screen" className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SKU *</label>
            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g., SCR-IP-001" className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Price (ETB)</label>
            <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="e.g., 1500" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Selling Price (ETB) *</label>
            <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="e.g., 2500" className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Stock</label>
            <input type="number" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} placeholder="e.g., 10" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Minimum Stock</label>
            <input type="number" value={minimumStock} onChange={(e) => setMinimumStock(e.target.value)} placeholder="e.g., 3" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Supplier</label>
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Select supplier</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>{sup.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-lg disabled:opacity-50">
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}