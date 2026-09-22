"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Search, Plus, Minus, Trash2, ShoppingCart, Banknote, CreditCard, Smartphone, Printer, Check, X } from "lucide-react";

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
  const router = useRouter();
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
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
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
          setProducts(Array.isArray(data) ? data : []);
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
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
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
    setSearchQuery("");
    setProducts([]);
  };

  const removeFromCart = (id: string) => setCart(cart.filter((item) => item.id !== id));

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
        headers: { "Content-Type": "application/json" },
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
      setLastSaleId(sale.id);
      setSuccess(`Sale completed! Invoice: ${sale.invoiceNumber}`);
      setCart([]);
      setSelectedCustomer("");
      setPaymentMethod("CASH");
      setShowPayment(false);
    } catch (error: any) {
      alert(error.message || "Failed to complete sale");
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (lastSaleId) router.push(`/receipts/${lastSaleId}`);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:gap-6 lg:h-[calc(100vh-8rem)]">
      {/* Success toast */}
      {success && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3">
          <Check className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium flex-1 min-w-0 break-words">{success}</span>
          {lastSaleId && (
            <button
              onClick={handlePrintReceipt}
              className="px-3 py-1.5 bg-white text-emerald-600 text-xs font-bold rounded-md hover:bg-emerald-50 flex items-center gap-1.5 shrink-0"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
          )}
          <button
            onClick={() => {
              setSuccess("");
              setLastSaleId(null);
            }}
            className="p-1 hover:bg-emerald-600 rounded shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Left / Top: Search + Products */}
      <div className="flex-1 flex flex-col min-w-0 mb-4 lg:mb-0">
        <h1 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4">
          Point of Sale
        </h1>

        <div className="mb-3">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Customer
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Walk-in Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `— ${c.phone}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="relative mb-3 md:mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {loading && (
          <p className="text-sm text-muted-foreground text-center py-2">Searching...</p>
        )}

        <div className="flex-1 overflow-y-auto">
          {!loading && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.currentStock === 0}
                  className="bg-card border border-border rounded-md p-3 text-left hover:border-primary/50 hover:bg-accent/30 transition-all disabled:opacity-50"
                >
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.sku}</p>
                  <p className="text-sm font-bold text-foreground mt-2">
                    {Number(product.sellingPrice).toLocaleString()} ETB
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {product.currentStock > 0 ? `${product.currentStock} in stock` : "Out of stock"}
                  </p>
                </button>
              ))}
            </div>
          )}

          {!loading && searchQuery.length === 0 && (
            <div className="text-center py-12 md:py-16 text-muted-foreground">
              <Search className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Start typing to search products</p>
            </div>
          )}

          {!loading && searchQuery.length > 0 && products.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No products found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Right / Bottom: Cart */}
      <div className="w-full lg:w-96 bg-card border border-border rounded-lg flex flex-col lg:max-h-[calc(100vh-8rem)]">
        <div className="px-4 md:px-5 py-3 md:py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart ({cart.length} {cart.length === 1 ? "item" : "items"})
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 max-h-[40vh] lg:max-h-none">
          {cart.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-muted-foreground">
              <ShoppingCart className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="border border-border rounded-md p-3 bg-background">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.price.toLocaleString()} ETB each
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-red-500 p-0.5 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-2 py-1 hover:bg-accent text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium text-foreground border-x border-border min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-2 py-1 hover:bg-accent text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {(item.price * item.quantity).toLocaleString()} ETB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border p-3 md:p-4">
          <div className="flex justify-between mb-3 md:mb-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg md:text-xl font-bold text-foreground">
              {total.toLocaleString()} ETB
            </span>
          </div>
          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to Payment
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-4 md:px-5 py-3 md:py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Payment</h3>
              <button
                onClick={() => setShowPayment(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 md:p-5">
              <div className="text-center mb-5 md:mb-6 pb-4 md:pb-5 border-b border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Total amount
                </p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {total.toLocaleString()} ETB
                </p>
              </div>

              <p className="text-xs font-medium text-muted-foreground mb-3">
                Payment method
              </p>
              <div className="grid grid-cols-3 gap-2 mb-5 md:mb-6">
                {[
                  { key: "CASH", label: "Cash", Icon: Banknote },
                  { key: "BANK_TRANSFER", label: "Bank", Icon: CreditCard },
                  { key: "MOBILE_MONEY", label: "Mobile", Icon: Smartphone },
                ].map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPaymentMethod(key)}
                    className={
                      "flex flex-col items-center gap-1.5 py-3 rounded-md border text-xs font-medium transition-colors " +
                      (paymentMethod === key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50")
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex-1 py-2.5 border border-border text-foreground text-sm font-medium rounded-md hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSale}
                  disabled={processing}
                  className="flex-1 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-md hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {processing ? "..." : "Complete Sale"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}