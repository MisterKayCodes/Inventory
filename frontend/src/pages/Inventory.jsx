import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const CLOUDINARY_CLOUD = "dmn6hb4zt";
const CLOUDINARY_PRESET = "zilly_preset";

// Format a raw number string into ₦1,000,000 display
const formatNaira = (raw) => {
  const num = raw.replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("en-NG");
};

export default function Inventory() {
  const { accessToken, role, activeShopId } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);

  // Product form
  const [brandModel, setBrandModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [priceRaw, setPriceRaw] = useState(""); // raw digits only
  const [priceDisplay, setPriceDisplay] = useState(""); // formatted with commas
  const [categoryId, setCategoryId] = useState("");
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState("");

  // Photo upload
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(""); // final cloudinary URL
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Inline category creation (inside product modal)
  const [showInlineCategory, setShowInlineCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryLoading, setNewCategoryLoading] = useState(false);
  const [newCategoryError, setNewCategoryError] = useState("");

  useEffect(() => {
    if (activeShopId) fetchData();
  }, [activeShopId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/categories`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/products/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Price formatting ────────────────────────────────────────────
  const handlePriceChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    setPriceRaw(digits);
    setPriceDisplay(digits ? Number(digits).toLocaleString("en-NG") : "");
  };

  // ── Photo selection & upload to Cloudinary ──────────────────────
  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    setPhotoUrl("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setPhotoUrl(data.secure_url);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setProductError("Photo upload failed. You can still save without a photo.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Inline category creation ────────────────────────────────────
  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (val === "__create__") {
      setShowInlineCategory(true);
      setCategoryId("");
    } else {
      setCategoryId(val);
      setShowInlineCategory(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setNewCategoryLoading(true);
    setNewCategoryError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/categories/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not create product type");

      setCategories((prev) => [...prev, data]);
      setCategoryId(String(data.id));
      setNewCategoryName("");
      setShowInlineCategory(false);
    } catch (err) {
      setNewCategoryError(err.message);
    } finally {
      setNewCategoryLoading(false);
    }
  };

  // ── Add product ─────────────────────────────────────────────────
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      setProductError("Please select or create a product type.");
      return;
    }
    if (photoUploading) {
      setProductError("Please wait — your photo is still uploading.");
      return;
    }

    setProductLoading(true);
    setProductError("");

    const payload = {
      brand_model: brandModel,
      serial_number: serialNumber.trim() || null,
      price: Number(priceRaw),
      status: "in_stock",
      photo_url: photoUrl || null,
      category_id: Number(categoryId),
      shop_id: activeShopId,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not save product");

      // Reset form
      setBrandModel("");
      setSerialNumber("");
      setPriceRaw("");
      setPriceDisplay("");
      setCategoryId("");
      clearPhoto();
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      setProductError(err.message);
    } finally {
      setProductLoading(false);
    }
  };

  const openProductModal = () => {
    setProductError("");
    setShowInlineCategory(false);
    setNewCategoryName("");
    setNewCategoryError("");
    setShowProductModal(true);
  };

  // ── Filtered products ───────────────────────────────────────────
  const shopProducts = products.filter((p) => {
    const belongsToShop = p.shop_id === activeShopId;
    const matchesSearch =
      p.brand_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.serial_number &&
        p.serial_number.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategoryFilter
      ? p.category_id === Number(selectedCategoryFilter)
      : true;
    return belongsToShop && matchesSearch && matchesCategory;
  });

  const statusLabel = {
    in_stock: { text: "In Stock", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    sold: { text: "Sold", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
    reserved: { text: "Reserved", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    damaged: { text: "Damaged", cls: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">My Products</h1>
          <p className="text-sm text-gray-400">All items registered in this shop.</p>
        </div>

        {role === "owner" && (
          <button onClick={openProductModal} className="btn font-semibold text-sm">
            + Add a Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔍  Search by name or serial number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-light transition"
        />
        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary-light cursor-pointer transition"
        >
          <option value="">All Types</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading your products...</div>
      ) : shopProducts.length === 0 ? (
        <div className="glass p-12 text-center border border-dashed border-white/10 rounded-xl space-y-4">
          <div className="text-5xl">📦</div>
          <h2 className="text-xl font-semibold text-white">No products yet</h2>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            {searchQuery || selectedCategoryFilter
              ? "No products match your search. Try a different filter."
              : "You haven't added any products to this shop yet."}
          </p>
          {role === "owner" && !searchQuery && !selectedCategoryFilter && (
            <button onClick={openProductModal} className="btn mt-2">
              Add Your First Product
            </button>
          )}
          {categories.length === 0 && role === "owner" && (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 max-w-sm mx-auto">
              💡 Tip: You'll need to create a <strong>Product Type</strong> when adding your first product. You can do this right inside the form!
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopProducts.map((product) => {
            const cat = categories.find((c) => c.id === product.category_id);
            const badge = statusLabel[product.status] || statusLabel.in_stock;
            return (
              <div key={product.id} className="glass overflow-hidden flex flex-col hover-lift">
                {/* Image */}
                <div className="h-44 w-full bg-secondary/40 relative flex items-center justify-center border-b border-white/5">
                  {product.photo_url ? (
                    <img
                      src={product.photo_url}
                      alt={product.brand_model}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-4xl">📷</span>
                  )}
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${badge.cls}`}
                  >
                    {badge.text}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {cat && (
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                        {cat.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-lg mt-0.5 mb-2 truncate">{product.brand_model}</h3>
                    <p className="text-xs text-gray-400">
                      Serial No:{" "}
                      <span className="font-mono text-gray-200">
                        {product.serial_number || "—"}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5">
                    <span className="text-xl font-bold text-white">
                      {product.price.toLocaleString("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD PRODUCT MODAL ────────────────────────────────────── */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass p-6 w-full max-w-md relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl leading-none"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-1">Add a Product</h2>
            <p className="text-xs text-gray-400 mb-5">Fill in the details of the item you want to add to your shop.</p>

            {productError && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-2 rounded-lg mb-4">
                {productError}
              </p>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4">

              {/* Photo Upload */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Product Photo <span className="text-gray-600">(optional)</span></label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-36 rounded-lg border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-white/10 transition relative overflow-hidden"
                >
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="preview" className="object-cover w-full h-full absolute inset-0" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); clearPhoto(); }}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/80"
                      >
                        ✕
                      </button>
                      {photoUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold animate-pulse">Uploading...</span>
                        </div>
                      )}
                      {photoUrl && !photoUploading && (
                        <span className="absolute bottom-2 left-2 bg-emerald-500/80 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          ✓ Uploaded
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-3xl mb-1">📷</span>
                      <span className="text-xs text-gray-400">Tap to upload a photo</span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Product Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. LG 55-inch TV, Samsung A54..."
                  value={brandModel}
                  onChange={(e) => setBrandModel(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-light transition"
                  required
                  disabled={productLoading}
                />
              </div>

              {/* Serial Number */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">
                  Serial Number <span className="text-gray-600">(on the box)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SN123456789"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-white/10 bg-white/5 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-primary-light transition"
                  disabled={productLoading}
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Selling Price (₦) <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 450000"
                  value={priceDisplay}
                  onChange={handlePriceChange}
                  className="w-full p-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-light transition"
                  required
                  disabled={productLoading}
                />
                {priceRaw && (
                  <p className="text-emerald-400 font-bold text-lg mt-1.5 ml-1">
                    ₦{Number(priceRaw).toLocaleString("en-NG")}
                  </p>
                )}
              </div>

              {/* Product Type (Category) */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Product Type <span className="text-red-400">*</span></label>
                <select
                  value={categoryId}
                  onChange={handleCategorySelect}
                  className="w-full p-2.5 rounded-lg border border-white/10 bg-[#111122] text-white focus:outline-none focus:border-primary-light cursor-pointer transition"
                  disabled={productLoading}
                >
                  <option value="">— Select a product type —</option>
                  <option value="__create__">✏️ Create a new product type...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                {/* Inline category creation */}
                {showInlineCategory && (
                  <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                    <label className="text-xs text-gray-400 block">New product type name</label>
                    <input
                      type="text"
                      placeholder="e.g. Air Conditioner, Phone, TV..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full p-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-light text-sm transition"
                      disabled={newCategoryLoading}
                    />
                    {newCategoryError && (
                      <p className="text-red-400 text-xs">{newCategoryError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={newCategoryLoading || !newCategoryName.trim()}
                        className="btn text-xs py-1.5 px-4"
                      >
                        {newCategoryLoading ? "Saving..." : "Save Type"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowInlineCategory(false); setNewCategoryName(""); setNewCategoryError(""); }}
                        className="text-xs text-gray-400 hover:text-white px-3"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn w-full py-3 mt-2"
                disabled={productLoading || photoUploading}
              >
                {productLoading ? "Saving..." : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
