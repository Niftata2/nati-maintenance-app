"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Wrench, Users, Banknote, CreditCard, Smartphone } from "lucide-react";

interface Technician {
  id: string;
  name: string;
  phone?: string;
}

export default function NewJobPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [problem, setProblem] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [laborCharge, setLaborCharge] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const res = await fetch("/api/technicians");
      const data = await res.json();
      setTechnicians(data);
    } catch (error) {
      console.error("Failed to fetch technicians:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!customerName || !customerPhone || !deviceType || !problem) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }
    if (!selectedTechnician) {
      setError("Please select a technician (fix man)");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          deviceType,
          deviceModel,
          problem,
          priority,
          technicianId: selectedTechnician,
          createdById: session?.user?.id,
          laborCharge: parseFloat(laborCharge) || 0,
          paymentMethod,
          paidAmount: parseFloat(paidAmount) || 0,
          status: "ASSIGNED",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job");
      }

      const job = await response.json();
      setSuccess("Job " + job.jobNumber + " created successfully");

      setCustomerName("");
      setCustomerPhone("");
      setDeviceType("");
      setDeviceModel("");
      setProblem("");
      setLaborCharge("");
      setPaidAmount("");
      setSelectedTechnician("");

      setTimeout(() => {
        setSuccess("");
        router.push("/my-jobs");
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Create Repair Job</h1>

      {success && (
        <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-emerald-500 text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-500 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center text-foreground">
            <User className="mr-2 h-4 w-4" />
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                Customer Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g., Abebe Kebede"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g., 0911223344"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
        </div>

        {/* Device & Problem */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center text-foreground">
            <Wrench className="mr-2 h-4 w-4" />
            Device & Problem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                Device Type *
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select device type</option>
                <option value="Phone">Phone</option>
                <option value="Tablet">Tablet</option>
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                Device Model
              </label>
              <input
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="e.g., Samsung A24"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
              Problem Description *
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe the problem..."
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Technician */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center text-foreground">
            <Users className="mr-2 h-4 w-4" />
            Assign to Fix Man
          </h2>
          <select
            value={selectedTechnician}
            onChange={(e) => setSelectedTechnician(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select a technician</option>
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.name} {tech.phone ? "— " + tech.phone : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Payment */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center text-foreground">
            <Banknote className="mr-2 h-4 w-4" />
            Estimated Price (Optional)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                Estimated Charge (ETB)
              </label>
              <input
                type="number"
                value={laborCharge}
                onChange={(e) => setLaborCharge(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                Advance Paid (ETB)
              </label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2 text-muted-foreground">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "CASH", label: "Cash", Icon: Banknote },
                { key: "BANK_TRANSFER", label: "Bank", Icon: CreditCard },
                { key: "MOBILE_MONEY", label: "Mobile", Icon: Smartphone },
              ].map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPaymentMethod(key)}
                  className={
                    "p-3 border rounded-md flex flex-col items-center text-xs font-medium transition-colors " +
                    (paymentMethod === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50")
                  }
                >
                  <Icon className="h-5 w-5 mb-1" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 font-medium text-sm disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create & Assign Job"}
        </button>
      </form>
    </div>
  );
}