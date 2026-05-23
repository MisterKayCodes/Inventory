import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

// Helper for generating custom UUIDs for idempotency keys
const generateUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function Verification() {
  const { accessToken, activeShopId } = useAuth();

  // Inputs
  const [serialInput, setSerialInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // States
  const [verifyResult, setVerifyResult] = useState(null); // 'matched' | 'unmatched' | null
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [shakeError, setShakeError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saleSuccess, setSaleSuccess] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!serialInput.trim()) return;

    setLoading(true);
    setVerifyResult(null);
    setMatchedProduct(null);
    setSaleSuccess(null);
    setErrorMsg("");
    setShakeError(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/transactions/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            shop_id: activeShopId,
            serial: serialInput.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Verification request failed");
      }

      if (data.matched && data.product_id) {
        // Fetch product details
        const prodResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/products/${data.product_id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (prodResponse.ok) {
          const product = await prodResponse.json();
          setMatchedProduct(product);
          setVerifyResult("matched");
        } else {
          throw new Error("Product details could not be retrieved");
        }
      } else {
        setVerifyResult("unmatched");
        triggerShake();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => {
      setShakeError(false);
    }, 4000); // Duration matches user view/action
  };

  const handleConfirmSale = async () => {
    if (!matchedProduct || !activeShopId) return;

    setActionLoading(true);
    setErrorMsg("");

    const idempotencyKey = generateUUID();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/transactions/confirm-sale`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            shop_id: activeShopId,
            product_id: matchedProduct.id,
            idempotency_key: idempotencyKey,
            serial: matchedProduct.serial_number,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Sale confirmation failed");
      }

      setSaleSuccess(data);
      setVerifyResult(null);
      setMatchedProduct(null);
      setSerialInput("");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Check a Serial Number</h1>
        <p className="text-sm text-gray-400">
          Type in the serial number printed on the product box below. We'll check if it matches what's registered in your shop.
        </p>
      </div>

      {/* Scanner Form */}
      <div className="glass p-6">
        <form onSubmit={handleVerify} className="flex gap-4">
          <input
            type="text"
            placeholder="Type the serial number here (e.g. SN123456)"
            value={serialInput}
            onChange={(e) => setSerialInput(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-white/10 bg-white/5 text-white font-mono uppercase tracking-wider focus:outline-none focus:border-primary-light transition"
            required
            disabled={loading || actionLoading}
          />
          <button type="submit" className="btn px-6 font-semibold" disabled={loading || actionLoading}>
            {loading ? "Checking..." : "Check Now"}
          </button>
        </form>
      </div>

      {/* Sale Success Card */}
      {saleSuccess && (
        <div className="glass p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center fade-in space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto">
            ✓
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Sale Recorded!</h2>
            <p className="text-sm text-gray-400 mt-1">
              Sale ID: <span className="font-mono text-gray-200">{saleSuccess.transaction_id}</span>
            </p>
            <p className="text-sm text-gray-400">
              Status: <span className="font-mono text-emerald-400 uppercase tracking-widest text-xs font-bold">{saleSuccess.status}</span>
            </p>
          </div>
          <button
            onClick={() => setSaleSuccess(null)}
            className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded text-xs font-semibold"
          >
            Check Another Item
          </button>
        </div>
      )}

      {/* Shake Wrapper for Mismatches / Errors */}
      <div className={shakeError ? "shake" : ""}>
        {/* Verification Result Displays */}
        {verifyResult === "matched" && matchedProduct && (
          <div className="glass p-6 border border-emerald-500/30 bg-emerald-500/5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 fade-in shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  ✓ Serial Number Found
                </span>
                {matchedProduct.status !== "in_stock" && (
                  <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Already {matchedProduct.status}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white">{matchedProduct.brand_model}</h2>
              <div className="space-y-1 text-sm text-gray-400">
                <p>
                  Serial Number: <span className="font-mono text-gray-200 uppercase">{matchedProduct.serial_number}</span>
                </p>
                <p>
                  Registered Price:{" "}
                  <span className="font-semibold text-white">
                    {matchedProduct.price.toLocaleString("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    })}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmSale}
              disabled={matchedProduct.status !== "in_stock" || actionLoading}
              className={`btn px-6 py-3 font-bold text-sm tracking-wide shadow-lg ${
                matchedProduct.status === "in_stock"
                  ? "bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-0.5 text-white"
                  : "opacity-40 cursor-not-allowed bg-gray-600"
              }`}
            >
              {actionLoading ? "Saving..." : "Confirm Sale"}
            </button>
          </div>
        )}

        {verifyResult === "unmatched" && (
          <div className="glass p-6 border border-red-500/30 bg-red-500/5 rounded-lg flex items-center gap-4 fade-in shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xl font-bold">
              ✕
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Serial Number Not Found</h2>
              <p className="text-sm text-gray-400">
                The serial number <span className="font-mono text-white">"{serialInput}"</span> is not in your shop's stock. It may have already been sold or was never added.
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="glass p-6 border border-red-500/30 bg-red-500/5 rounded-lg flex items-center gap-4 fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xl font-bold">
              !
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Something Went Wrong</h2>
              <p className="text-sm text-gray-400">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
