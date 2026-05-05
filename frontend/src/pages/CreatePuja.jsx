import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import { useCategories } from "../hooks/useCategories";
import { useLanguage } from "../context/LanguageContext";

export default function CreatePuja() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categories, loading: catsLoading } = useCategories();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startingPrice: "",
    imageFile: null,
  });
  const [categoryId, setCategoryId] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set default category once loaded
  React.useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(String(categories[0].id));
    }
  }, [categories, categoryId]);

  const handleChange = (e) => {
    if (e.target.name === "imageFile") {
      const file = e.target.files[0];
      setFormData({ ...formData, imageFile: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!user?.id) throw new Error("No user logged in (missing user.id).");

      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

      const fd = new FormData();
      fd.append("title", formData.title.trim());
      fd.append("description", formData.description.trim());
      fd.append("startingPrice", Number(formData.startingPrice));
      fd.append("sellerId", user.id);
      fd.append("status", "live");
      if (categoryId) fd.append("categoryId", categoryId);
      if (formData.imageFile) fd.append("image", formData.imageFile);

      const response = await fetch(`${baseUrl}/auction/pujas`, {
        method: "POST",
        body: fd,
      });

      const raw = await response.text();
      if (!response.ok) throw new Error(raw || "Failed to create auction");

      let data = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch { data = { raw }; }

      const pujaId =
        data?.id ?? data?.pujaId ?? data?.auctionId ?? data?._id ??
        data?.insertId ?? data?.puja?.id ?? data?.puja?._id ?? null;

      if (!pujaId) throw new Error("Auction created but no ID returned.");

      navigate(`/seller/live/video/${pujaId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">{t('create.title')}</h1>
          <p className="text-gray-500 mt-1">{t('create.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm text-red-400 border border-red-500/20"
            style={{ background: 'rgba(239,68,68,0.07)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image upload */}
          <div>
            <label className="input-label">{t('create.photo')}</label>
            <label
              className="flex flex-col items-center justify-center w-full h-48 rounded-2xl cursor-pointer transition-all"
              style={{
                background: preview ? 'transparent' : 'rgba(255,255,255,0.03)',
                border: '2px dashed rgba(255,255,255,0.1)',
                overflow: 'hidden',
                position: 'relative',
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-400">{t('create.uploadText')}</p>
                    <p className="text-xs text-gray-600 mt-1">{t('create.uploadSub')}</p>
                  </div>
                </div>
              )}
              <input type="file" name="imageFile" accept="image/*" onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer" />
            </label>
            {preview && (
              <button type="button" onClick={() => { setPreview(null); setFormData(prev => ({ ...prev, imageFile: null })); }}
                className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                {t('create.removeImg')}
              </button>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="input-label">{t('create.itemTitle')}</label>
            <input
              className="input-field"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder={t('create.titlePlaceholder')}
            />
          </div>

          {/* Description */}
          <div>
            <label className="input-label">{t('create.desc')}</label>
            <textarea
              className="input-field"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder={t('create.descPlaceholder')}
            />
          </div>

          {/* Category — custom pill picker */}
          <div>
            <label className="input-label">{t('create.category')}</label>
            {catsLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="skeleton h-14 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                {categories.map(cat => {
                  const isActive = categoryId === String(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(String(cat.id))}
                      className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl transition-all duration-150 cursor-pointer"
                      style={{
                        background: isActive
                          ? 'rgba(245,158,11,0.15)'
                          : 'rgba(255,255,255,0.04)',
                        border: isActive
                          ? '1.5px solid rgba(245,158,11,0.7)'
                          : '1.5px solid rgba(255,255,255,0.07)',
                        boxShadow: isActive ? '0 0 12px rgba(245,158,11,0.15)' : 'none',
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: '20px',
                          color: isActive ? '#f59e0b' : '#6b7280',
                          transition: 'color 0.15s',
                        }}
                      >
                        {cat.icon}
                      </span>
                      <span
                        className="text-xs font-semibold text-center leading-tight"
                        style={{ color: isActive ? '#f59e0b' : '#9ca3af' }}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Starting price */}
          <div>
            <label className="input-label">{t('create.price')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                className="input-field pl-8"
                type="number"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base gap-2"
            >
              {loading ? (
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" /></svg>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  {t('create.launchBtn')}
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-600 mt-3">
              {t('create.launchSub')}
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
