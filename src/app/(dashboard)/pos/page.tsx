"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Search, Plus, Minus, Trash2, ShoppingCart, Banknote, CreditCard, Smartphone, CheckCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  currentStock: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
}

export default function POSPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setLoading(true);
      fetch(`/api/products/search?q=${searchQuery}`)
        .then((res) => res.json())
        .then((data) => {
          setProducts(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setProducts([]);
    }
  }, [searchQuery]);

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.currentStock) {
        alert("Insufficient stock!");
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: Number(product.sellingPrice),
          quantity: 1,
          stock: product.currentStock,
        },
      ]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item;
          if (newQty > item.stock) {
            alert("Insufficient stock!");
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomer || null,
          cashierId: session?.user?.id,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
            total: item.price * item.quantity,
          })),
          paymentMethod,
          subtotal,
          total,
          paidAmount: total,
          remainingAmount: 0,
          status: "PAID",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete sale");
      }

      const sale = await response.json();
      setSuccess(`Sale completed! Invoice: ${sale.invoiceNumber}`);
      setCart([]);
      setSelectedCustomer("");
      setPaymentMethod("CASH");
      setShowPayment(false);

      setTimeout(() => setSuccess(""), 5000);
    } catch (error: any) {
      alert(error.message || "Failed to complete sale");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Success Message */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center">
          <CheckCircle className="h-6 w-6 mr-2" />
          {success}
        </div>
      )}

      {/* Product Search */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Point of Sale</h2>
        
        {/* Customer Selection */}
        <div className="mb-4">
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Walk-in Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} {customer.phone ? `- ${customer.phone}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {loading && <p className="text-gray-500">Searching...</p>}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h3 className="font-medium text-sm">{product.name}</h3>
              <p className="text-xs text-gray-500">{product.sku}</p>
              <p className="font-bold mt-2">ETB {Number(product.sellingPrice)}</p>
              <p className="text-xs text-gray-500">Stock: {product.currentStock}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-white rounded-lg shadow p-4 h-fit">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Cart ({cart.length} items)
        </h3>
        
        <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">ETB {item.price} x {item.quantity}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 border rounded">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 border rounded">
                  <Plus className="h-3 w-3" />
                </button>
                <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {cart.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Cart is empty</p>
        ) : (
          <>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total</span>
                <span>ETB {total}</span>
              </div>
              <button
                onClick={() => setShowPayment(true)}
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Proceed to Payment
              </button>
            </div>
          </>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Payment</h3>
            
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-4xl font-bold text-blue-600">ETB {total}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod("CASH")}
                  className={`p-4 border rounded-md flex flex-col items-center ${
                    paymentMethod === "CASH" ? "border-blue-600 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  <Banknote className="h-8 w-8 mb-2" />
                  <span className="text-sm">Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("BANK_TRANSFER")}
                  className={`p-4 border rounded-md flex flex-col items-center ${
                    paymentMethod === "BANK_TRANSFER" ? "border-blue-600 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  <CreditCard className="h-8 w-8 mb-2" />
                  <span className="text-sm">Bank</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("MOBILE_MONEY")}
                  className={`p-4 border rounded-md flex flex-col items-center ${
                    paymentMethod === "MOBILE_MONEY" ? "border-blue-600 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  <Smartphone className="h-8 w-8 mb-2" />
                  <span className="text-sm">Mobile</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSale}
                disabled={processing}
                className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? "Processing..." : "Complete Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}