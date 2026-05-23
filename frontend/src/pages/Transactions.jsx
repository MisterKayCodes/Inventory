import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Transactions() {
  const { accessToken, role, activeShopId } = useAuth();

  // State
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Pagination
  const [skip, setSkip] = useState(0);
  const limit = 20;

  // Access control
  if (role !== "owner") {
    return (
      <div className="glass p-8 max-w-lg mx-auto text-center mt-10">
        <h2 className="text-xl font-bold text-error mb-2">Access Denied</h2>
        <p className="text-sm text-gray-400">Only business owners can access sales history.</p>
      </div>
    );
  }

  useEffect(() => {
    if (activeShopId) {
      fetchData();
    }
  }, [activeShopId, statusFilter, startDate, endDate, skip]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch products for mapping name/model
      const prodRes = await fetch(`${import.meta.env.VITE_API_URL}/products/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      // 2. Fetch transactions
      let url = `${import.meta.env.VITE_API_URL}/transactions?shop_id=${activeShopId}&skip=${skip}&limit=${limit}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      if (startDate) {
        // Convert to ISO string or backend expected format (Backend expects datetime object)
        url += `&start_date=${new Date(startDate).toISOString()}`;
      }
      if (endDate) {
        url += `&end_date=${new Date(endDate).toISOString()}`;
      }

      const txRes = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (skip >= limit) {
      setSkip(skip - limit);
    }
  };

  const handleNextPage = () => {
    if (transactions.length === limit) {
      setSkip(skip + limit);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Sales History</h1>
        <p className="text-sm text-gray-400">Review all successful and failed sales checks for this shop.</p>
      </div>

      {/* Filter Options */}
      <div className="glass p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setSkip(0);
            }}
            className="w-full p-2.5 rounded border border-white/10 bg-[#111122]/50 text-white focus:outline-none focus:border-[#5c5cff] cursor-pointer text-sm"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setSkip(0);
            }}
            className="w-full p-2 rounded border border-white/10 bg-[#111122]/50 text-white focus:outline-none focus:border-[#5c5cff] text-sm cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setSkip(0);
            }}
            className="w-full p-2 rounded border border-white/10 bg-[#111122]/50 text-white focus:outline-none focus:border-[#5c5cff] text-sm cursor-pointer"
          />
        </div>

        <button
          onClick={() => {
            setStatusFilter("");
            setStartDate("");
            setEndDate("");
            setSkip(0);
          }}
          className="px-4 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 font-semibold text-sm transition-colors w-full"
        >
          Reset Filters
        </button>
      </div>

      {/* Transaction Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="glass p-12 text-center border border-dashed border-white/10 rounded-lg">
          <p className="text-gray-400">No transactions recorded yet matching this criteria.</p>
        </div>
      ) : (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#191032]/40 text-xs text-gray-400 uppercase font-semibold">
                  <th className="p-4">Sale ID</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Serial Number</th>
                  <th className="p-4">Checked At</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {transactions.map((tx) => {
                  const prod = products.find((p) => p.id === tx.product_id);
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-gray-400">#{tx.id}</td>
                      <td className="p-4 font-semibold text-white">
                        {prod ? prod.brand_model : `Product ID: ${tx.product_id}`}
                      </td>
                      <td className="p-4 font-mono text-gray-300 uppercase">{tx.serial_number}</td>
                      <td className="p-4 text-gray-400">
                        {new Date(tx.verified_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            tx.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : tx.status === "failed"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="p-4 border-t border-white/10 flex justify-between items-center bg-[#191032]/20">
            <button
              onClick={handlePrevPage}
              disabled={skip === 0}
              className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous Page
            </button>
            <span className="text-xs text-gray-400">
              Showing entries {skip + 1} - {skip + transactions.length}
            </span>
            <button
              onClick={handleNextPage}
              disabled={transactions.length < limit}
              className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
