import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';

const API_BASE = ''; // com que ja fas /api/... al mateix host, ho deixem buit

const CreateAuction = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Collectibles');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [duration, setDuration] = useState('1 Hour');
  const [mode, setMode] = useState('video'); // "video" o "photo"

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const launchAuction = async () => {
    setError('');
    setLoading(true);

    try {
      const payload = {
        title,
        category,
        description,
        startingPrice: Number(startingPrice || 0),
        reservePrice: reservePrice ? Number(reservePrice) : null,
        duration,
        mode, // important: video o photo
      };

      const res = await fetch(`${API_BASE}/api/auction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // important: si és 500 sovint no hi ha JSON → agafem text
        const text = await res.text();
        throw new Error(text || `Error creant subhasta (${res.status})`);
      }

      // assumeixo que el backend retorna { id: "AUC123" } o { id: 123 }
      const data = await res.json();
      const id = data?.id ?? data?.auctionId;

      if (!id) throw new Error('El backend no ha retornat cap id de subhasta.');

      // Navegació a la vista del venedor (sense sortir del live)
      if (mode === 'video') {
        navigate(`/seller/auction/video/${id}`, { replace: true });
      } else {
        navigate(`/seller/auction/photo/${id}`, { replace: true });
      }
    } catch (e) {
      setError(e.message || 'Error desconegut');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display">
      <Header />
      <main className="max-w-[800px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-black mb-2">Create New Auction</h1>
        <p className="text-slate-500 mb-8">Fill in the details to list your item for live bidding.</p>

        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark p-8 shadow-lg">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {error && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white">Item Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary"
                  placeholder="e.g. 1969 Ford Mustang"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary"
                >
                  <option>Collectibles</option>
                  <option>Watches</option>
                  <option>Sneakers</option>
                  <option>Art</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-white">Live Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary"
              >
                <option value="video">Live amb càmera (video)</option>
                <option value="photo">Live sense càmera (fotos)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-white">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 h-32 focus:ring-primary focus:border-primary"
                placeholder="Describe condition, provenance, and key features..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white">Starting Price ($)</label>
                <input
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  type="number"
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white">Reserve Price ($)</label>
                <input
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                  type="number"
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary"
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary"
                >
                  <option>1 Hour</option>
                  <option>24 Hours</option>
                  <option>3 Days</option>
                  <option>7 Days</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-border-dark flex items-center justify-end gap-4">
              <button
                type="button"
                disabled={loading}
                className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={launchAuction}
                disabled={loading}
                className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Launching…' : 'Launch Auction'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateAuction;
