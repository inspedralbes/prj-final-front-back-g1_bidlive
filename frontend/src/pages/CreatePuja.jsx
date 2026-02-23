import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";

const CreatePuja = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startingPrice: "",
    imageFile: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    if (e.target.name === 'imageFile') {
      setFormData({ ...formData, imageFile: e.target.files[0] });
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

      // Important: startingPrice ha de ser número
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('startingPrice', Number(formData.startingPrice));
      formDataToSend.append('sellerId', user.id);
      formDataToSend.append('status', 'live');

      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }

      const response = await fetch(`${baseUrl}/auction/pujas`, {
        method: "POST",
        body: formDataToSend,
      });

      // Llegim el body 1 sola vegada
      const raw = await response.text();

      if (!response.ok) {
        throw new Error(raw || "Failed to create puja");
      }

      // Intentem parsejar JSON si es pot
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { raw };
      }

      // Acceptem diferents formats possibles
      const pujaId =
        data?.id ??
        data?.pujaId ??
        data?.auctionId ??
        data?._id ??
        data?.insertId ??
        data?.puja?.id ??
        data?.puja?._id ??
        null;

      if (!pujaId) {
        // debug útil
        console.log("Create puja response status:", response.status);
        console.log("Create puja raw response:", raw);
        console.log("Create puja parsed data:", data);
        throw new Error("Puja created but no id returned from backend.");
      }

      // ✅ Redirecció al panell del venedor en live
      navigate(`/seller/live/video/${pujaId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display pb-20 text-white">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-[#271b1d]/40 p-8 rounded-xl border border-[#39282b]">
          <h1 className="text-3xl font-bold mb-6 text-center">Create New Puja</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-[#39282b]/50 border border-[#543b3f] rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                placeholder="e.g. Vintage Rolex Watch"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full bg-[#39282b]/50 border border-[#543b3f] rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                placeholder="Describe your item..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Starting Price ($)</label>
              <input
                type="number"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full bg-[#39282b]/50 border border-[#543b3f] rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Image Upload</label>
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                onChange={handleChange}
                className="w-full bg-[#39282b]/50 border border-[#543b3f] rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Launch Puja"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreatePuja;
