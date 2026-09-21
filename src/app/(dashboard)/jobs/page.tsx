"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Wrench } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter !== "ALL" && job.status !== filter) return false;
    if (search && !job.customer.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    ASSIGNED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    WAITING_FOR_PARTS: "bg-orange-100 text-orange-800",
    READY_FOR_PICKUP: "bg-teal-100 text-teal-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Repair Jobs</h1>
        <Link href="/jobs/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <Plus className="mr-2 h-5 w-5" />
          New Job
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md">
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Wrench className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">No jobs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">{job.jobNumber}</p>
                  <p className="text-sm text-gray-500">{job.customer.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[job.status] || "bg-gray-100"}`}>{job.status}</span>
              </div>
              <div className="mt-2">
                <p className="text-sm"><span className="font-medium">Device:</span> {job.deviceType} {job.deviceModel || ""}</p>
                <p className="text-sm text-gray-600 mt-1">{job.problem}</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                <span>Priority: {job.priority}</span>
                <span>Technician: {job.technician?.name || "Unassigned"}</span>
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}