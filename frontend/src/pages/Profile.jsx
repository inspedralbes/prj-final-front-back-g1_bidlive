import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import FavoriteButton from '../components/common/FavoriteButton';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXT_LABEL = 'JPG, PNG, WebP or GIF';

const getReputationStars = (sales) => {
    if (!sales || sales === 0) return { stars: 0, label: "New Seller" };
    if (sales <= 5) return { stars: 1, label: "Beginner" };
    if (sales <= 15) return { stars: 2, label: "Regular" };
    if (sales <= 30) return { stars: 3, label: "Reliable" };
    if (sales <= 50) return { stars: 4, label: "Outstanding" };
    return { stars: 5, label: "Top Seller" };
};

const Profile = () => {
    const { user, updateUser } = useAuth();

    const [myAuctions, setMyAuctions] = useState([]);
    const [myFavorites, setMyFavorites] = useState([]);
    const [myPayments, setMyPayments] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [activeTab, setActiveTab] = useState('pujas');
    const [selectedPaymentAuction, setSelectedPaymentAuction] = useState(null); // Auction being paid
    const [paying, setPaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const avatarInputRef = React.useRef(null);
    const [rechargeAmount, setRechargeAmount] = useState(50);
    const [recharging, setRecharging] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        username: user?.username || '',
        billing_address: user?.billing_address || '',
        payment_method: user?.payment_method || 'credit_card'
    });
    const [saving, setSaving] = useState(false);

    // --- Edit panel state ---
    const [editOpen, setEditOpen] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [editBio, setEditBio] = useState('');
    const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
    const [saveError, setSaveError] = useState('');
    const [profile, setProfile] = useState(null);

    const fetchUserAuctions = async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const [profileRes, auctionsRes, favoritesRes, paymentsRes] = await Promise.all([
                fetch(`${API}/auth/profile/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API}/auction/pujas/user/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API}/auction/favorites/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API}/auction/payments/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
            ]);
            if (profileRes.ok) {
                const p = await profileRes.json();
                setProfile(p);
                setEditUsername(p.username || '');
                setEditBio(p.bio || '');
                if (p.avatar_url) setAvatarPreview(`${API}${p.avatar_url}`);
            }
            if (auctionsRes.ok) setMyAuctions(await auctionsRes.json());
            if (favoritesRes.ok) setMyFavorites(await favoritesRes.json());
            if (paymentsRes.ok) setMyPayments(await paymentsRes.json());
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        const fetchWalletBalance = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auth/wallet/balance`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setWalletBalance(data.wallet);
                }
            } catch (error) {
                console.error("Error fetching wallet balance:", error);
            }
        };
        fetchUserAuctions();
        fetchWalletBalance();

        // Handle stripe redirect params
        const handlePaymentRedirect = async () => {
            const query = new URLSearchParams(window.location.search);
            const success = query.get("success") || query.get("payment") === "success";
            const sessionId = query.get("session_id");

            if (success) {
                if (sessionId) {
                    try {
                        const token = localStorage.getItem('token');
                        const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auth/payment/confirm-session/${sessionId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (resp.ok) {
                            alert("¡Saldo recargado con éxito!");
                            fetchWalletBalance();
                            fetchUserAuctions();
                        }
                    } catch (err) {
                        console.error("Error confirming session:", err);
                    }
                } else {
                    alert("¡Pago realizado con éxito!");
                    fetchWalletBalance();
                    fetchUserAuctions();
                }
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            if (query.get("canceled") || query.get("payment") === "cancel") {
                alert("Operación cancelada.");
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        };

        fetchUserAuctions();
        fetchWalletBalance();
        handlePaymentRedirect();
    }, [user]);

    const handleRecharge = async () => {
        if (rechargeAmount < 10 || rechargeAmount > 1000) {
            alert("Please enter an amount between $10 and $1000");
            return;
        }

        setRecharging(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auth/wallet/recharge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: rechargeAmount })
            });

            if (response.ok) {
                const { url } = await response.json();
                window.location.href = url; // Redirect to Stripe
            } else {
                const errorData = await response.json();
                alert("Error: " + (errorData.message || "Failed to create Stripe session"));
            }
        } catch (error) {
            console.error("Recharge error:", error);
            alert("Connection error: Make sure the backend is running and Stripe key is valid.");
        } finally {
            setRecharging(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auth/profile/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: formData.username,
                    avatar_url: user?.avatar_url || '',
                    billing_address: formData.billing_address,
                    payment_method: formData.payment_method,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.reload();
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show instant local preview
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);

        setAvatarUploading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const fd = new FormData();
            fd.append('avatar', file);

            const res = await fetch(`${baseUrl}/auth/profile/${user.id}/avatar`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: fd,
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error(`[avatar] HTTP ${res.status}:`, errText);
                throw new Error(`HTTP ${res.status}: ${errText}`);
            }
            const data = await res.json();

            // Build the public URL using the gateway base (same origin the browser uses)
            const avatarUrl = `${baseUrl}/auth/uploads/avatars/${data.filename}`;

            // Update context + localStorage so it persists on next page load
            updateUser({ avatar_url: avatarUrl });
            // Show the server URL — we know it's correct because we built it ourselves
            setAvatarPreview(avatarUrl);
        } catch (err) {
            console.error('Avatar upload error:', err);
            alert(`Error al subir la imagen:\n${err.message}`);
            setAvatarPreview(null);
        } finally {
            setAvatarUploading(false);
        }
    };

    const initial = user?.username?.charAt(0).toUpperCase() || '?';

    return (
        <div className="min-h-screen bg-[#08080f] text-white font-sans relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

            <Header />

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Modern Header Profile */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 mb-12 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl opacity-50" />

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-amber-500 via-orange-400 to-indigo-500 p-1.5 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                                <div className="w-full h-full rounded-full bg-[#08080f] flex items-center justify-center overflow-hidden">
                                    {avatarPreview || user?.avatar_url ? (
                                        <img
                                            src={avatarPreview || user.avatar_url}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <span
                                        className="text-6xl font-black bg-gradient-to-tr from-amber-400 to-orange-500 bg-clip-text text-transparent"
                                        style={{ display: (avatarPreview || user?.avatar_url) ? 'none' : 'flex' }}
                                    >
                                        {initial}
                                    </span>
                                </div>
                            </div>
                            {/* Hidden file input */}
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />

                            {/* Upload button */}
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={avatarUploading}
                                title="Change profile picture"
                                className="absolute bottom-2 right-2 p-3 backdrop-blur-md rounded-full text-white shadow-lg border transition-all transform hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{
                                    background: avatarUploading ? 'rgba(245,158,11,0.4)' : 'rgba(245,158,11,0.85)',
                                    borderColor: 'rgba(245,158,11,0.5)',
                                }}
                            >
                                {avatarUploading ? (
                                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="flex-1 text-center md:text-left pt-4">
                            <h1 className="text-5xl font-black text-white tracking-tight flex justify-center md:justify-start items-center gap-3">
                                {user?.username}
                                <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </h1>
                            <p className="text-gray-400 mt-2 text-lg mb-6">{user?.email}</p>

                            {/* WALLET SECTION */}
                            <div className="max-w-md bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm mb-6 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span className="text-amber-500">💰</span> Mi Monedero
                                    </h3>
                                    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">${walletBalance}</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Añadir Fondos ($)
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="number"
                                            min="10"
                                            max="1000"
                                            value={rechargeAmount}
                                            onChange={(e) => setRechargeAmount(Number(e.target.value))}
                                            className="w-1/2 p-3 bg-[#08080f] border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500 transition-colors"
                                            placeholder="Ej: 50"
                                        />
                                        <button
                                            onClick={handleRecharge}
                                            disabled={recharging}
                                            className="w-1/2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">add_card</span>
                                            {recharging ? 'Procesando...' : 'Recargar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* END WALLET SECTION */}

                            {(user?.billing_address || user?.payment_method) && !isEditing && (
                                <div className="flex flex-col gap-1 mt-4 text-sm text-gray-300">
                                    {user?.billing_address && <p>🏠 <span className="text-white font-medium">{user.billing_address}</span></p>}
                                    {user?.payment_method && <p>💳 <span className="text-white font-medium capitalize">{user.payment_method.replace('_', ' ')}</span></p>}
                                </div>
                            )}

                            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 font-black text-xl">
                                        {myAuctions.length}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Activas</span>
                                        <span className="text-white font-medium">Subastas</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 font-black text-xl">
                                        <div className="flex flex-col items-center">
                                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                star
                                            </span>
                                            <span className="text-[10px] leading-none">{getReputationStars(profile?.total_sales).stars}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Reputación</span>
                                        <span className="text-white font-medium">{getReputationStars(profile?.total_sales).label}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-green-400 font-black text-xl flex-col">
                                        <span className="text-[10px] text-gray-500 font-normal leading-none mb-0.5">Ventas</span>
                                        <span className="leading-none">{profile?.total_sales || 0}</span>
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Saldo</span>
                                        <span className="text-white font-medium">{profile?.wallet_balance || 0}€</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-6 md:mt-0 pt-4">
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg hover:shadow-amber-500/25">
                                    Editar Perfil
                                </button>
                            ) : (
                                <div className="flex gap-2 w-full">
                                    <button onClick={handleSaveProfile} disabled={saving} className="flex-1 px-4 py-3 bg-green-500 text-white font-black rounded-xl hover:bg-green-400 transition-all shadow-lg">
                                        {saving ? 'Guardando...' : 'Guardar'}
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="flex-1 px-4 py-3 bg-gray-600 text-white font-black rounded-xl hover:bg-gray-500 transition-all shadow-lg">
                                        Cancelar
                                    </button>
                                </div>
                            )}
                            <Link to="/create-puja" className="flex-1 md:flex-none px-8 py-3 bg-white/10 text-white border border-white/10 font-bold rounded-xl hover:bg-white/20 transition-all text-center">
                                Crear Subasta
                            </Link>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 animate-fade-in">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm font-bold mb-2">Nombre de usuario (Nick)</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full bg-[#08080f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                                </div>
                                <div>
                                    <p className="block text-gray-400 text-sm font-bold mb-2">Foto de Perfil</p>
                                    <p className="text-xs text-gray-500">Haz clic en el icono de subida de la foto de perfil para cambiarla.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm font-bold mb-2">Dirección de facturación</label>
                                    <input type="text" name="billing_address" value={formData.billing_address} onChange={handleInputChange} placeholder="Calle Principal 123..." className="w-full bg-[#08080f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm font-bold mb-2">Método de pago favorito</label>
                                    <select name="payment_method" value={formData.payment_method} onChange={handleInputChange} className="w-full bg-[#08080f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                                        <option value="credit_card">Tarjeta de Crédito</option>
                                        <option value="paypal">PayPal</option>
                                        <option value="crypto">Criptomonedas</option>
                                        <option value="bank_transfer">Transferencia Bancaria</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="space-y-6 mt-12">
                    <div className="flex items-center gap-6 border-b border-white/10 mb-8">
                        <button 
                            onClick={() => setActiveTab('pujas')}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'pujas' ? 'text-amber-500' : 'text-gray-500 hover:text-white'}`}
                        >
                            Subastas creadas
                            {activeTab === 'pujas' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
                        </button>
                        <button 
                            onClick={() => setActiveTab('favorites')}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'favorites' ? 'text-amber-500' : 'text-gray-500 hover:text-white'}`}
                        >
                            Mis Favoritos
                            {activeTab === 'favorites' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
                        </button>
                        <button 
                            onClick={() => setActiveTab('payments')}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'payments' ? 'text-amber-500' : 'text-gray-500 hover:text-white'}`}
                        >
                            Mis Compras
                            {activeTab === 'payments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'pujas' && (
                                myAuctions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                                        {myAuctions.map(auction => (
                                            <Link to={`/auction/photo/${auction.id}`} key={auction.id} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all shadow-xl backdrop-blur-sm flex flex-col">
                                                <div className="h-48 relative overflow-hidden bg-[#0a0a14]">
                                                    {auction.image_url ? (
                                                        <img src={auction.image_url} alt={auction.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🔨</div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080f] via-transparent to-transparent opacity-80" />
                                                    <div className="absolute top-4 right-4">
                                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${auction.status === 'live' ? 'bg-red-500/80 text-white border border-red-500/50' :
                                                            auction.status === 'upcoming' ? 'bg-amber-500/80 text-black border border-amber-500/50' :
                                                                'bg-white/20 text-white border border-white/10'
                                                            }`}>
                                                            {auction.status === 'live' ? 'En Vivo' : auction.status === 'upcoming' ? 'Próximamente' : 'Cerrada'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-6 flex-1 flex flex-col">
                                                    <h3 className="font-bold text-xl text-white mb-2 line-clamp-1 group-hover:text-amber-400 transition-colors">{auction.title}</h3>
                                                    <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-1">{auction.description}</p>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Puja Actual</p>
                                                            <p className="font-black text-2xl text-white tracking-tight">${auction.current_price?.toLocaleString() || auction.starting_price?.toLocaleString()}</p>
                                                        </div>
                                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white/5 border border-dashed border-white/20 rounded-3xl p-16 text-center backdrop-blur-sm animate-fade-in">
                                        <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center text-4xl border border-white/10">🌟</div>
                                        <h3 className="text-2xl font-bold text-white mb-3">Tu escaparate está vacío</h3>
                                        <p className="text-gray-400 max-w-md mx-auto mb-8 text-lg">Aún no has terminado ninguna subasta.</p>
                                        <Link to="/create-puja" className="inline-block px-8 py-4 bg-amber-500 text-black rounded-xl font-black hover:bg-amber-400 transition-all">Crear subasta</Link>
                                    </div>
                                )
                            )}

                            {activeTab === 'favorites' && (
                                myFavorites.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                                        {myFavorites.map(auction => {
                                            const isLive = auction.status === 'live';
                                            const linkBase = isLive ? 'video' : 'photo';
                                            return (
                                                <div key={auction.id} className="relative group">
                                                    <FavoriteButton 
                                                        pujaId={auction.id} 
                                                        className="absolute top-4 left-4 z-20" 
                                                    />
                                                    <Link to={`/auction/${linkBase}/${auction.id}`} className="block bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all shadow-xl backdrop-blur-sm flex flex-col h-full">
                                                        <div className="h-48 relative overflow-hidden bg-[#0a0a14]">
                                                            {auction.image_url ? (
                                                                <img src={auction.image_url} alt={auction.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">hammer</div>
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-[#08080f] via-transparent to-transparent opacity-80" />
                                                        </div>
                                                        <div className="p-6 flex-1 flex flex-col">
                                                            <h3 className="font-bold text-xl text-white mb-2 line-clamp-1 group-hover:text-amber-400 transition-colors">{auction.title}</h3>
                                                            <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-1">{auction.description}</p>
                                                            <div className="flex justify-between items-end">
                                                                <div>
                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Precio actual</p>
                                                                    <p className="font-black text-2xl text-white tracking-tight">${auction.current_price?.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-white/5 border border-dashed border-white/20 rounded-3xl p-16 text-center backdrop-blur-sm animate-fade-in">
                                        <div className="w-20 h-20 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center text-3xl border border-white/10">❤️</div>
                                        <h3 className="text-xl font-bold text-white mb-2">Aún no tienes favoritos</h3>
                                        <p className="text-gray-400 max-w-sm mx-auto mb-6">Guarda las subastas que te interesen.</p>
                                        <Link to="/explore" className="inline-block px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all">Explorar subastas</Link>
                                    </div>
                                )
                            )}

                            {activeTab === 'payments' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                                    {myPayments.length > 0 ? (
                                        myPayments.map(p => (
                                            <div key={p.id} className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-300">
                                                <div className="aspect-[16/10] overflow-hidden relative bg-[#0a0a14]">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    ) : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🔨</div>}
                                                    <div className="absolute top-3 right-3">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg ${p.payment_status === 'paid' ? 'bg-emerald-500/80 text-white' : 'bg-amber-500/80 text-white'}`}>
                                                            {p.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-5">
                                                    <h3 className="text-white font-bold text-lg mb-1 truncate">{p.title}</h3>
                                                    <p className="text-gray-500 text-xs mb-4">Vendedor: {p.seller_username}</p>
                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Precio Final</p>
                                                            <p className="text-xl font-black text-white">${p.current_price?.toLocaleString()}</p>
                                                        </div>
                                                        {p.payment_status === 'pending' ? (
                                                            <button 
                                                                onClick={() => setSelectedPaymentAuction(p)}
                                                                className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">payments</span>
                                                                Pagar
                                                            </button>
                                                        ) : (
                                                            <div className="text-emerald-400 flex items-center gap-1.5 font-bold text-sm">
                                                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                                                Completado
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white/5 rounded-3xl border border-dashed border-white/10 animate-fade-in">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-3xl">🛍️</div>
                                            <h3 className="text-white font-bold text-xl mb-2">No tienes compras</h3>
                                            <p className="text-gray-500 max-w-xs mx-auto text-sm">Aún no has ganado ninguna subasta.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Payment Selection Modal */}
            {selectedPaymentAuction && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#121218] border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl animate-scale-in text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-amber-500 text-3xl">payments</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Finalizar Pago</h3>
                        <p className="text-gray-500 text-sm mb-6">{selectedPaymentAuction.title}</p>
                        <div className="text-3xl font-black text-white mb-8">${selectedPaymentAuction.current_price?.toLocaleString()}</div>
                        
                        <div className="flex flex-col gap-4">
                            <button 
                                disabled={paying}
                                onClick={async () => {
                                    setPaying(true);
                                    try {
                                        const resp = await fetch(`${API}/auction/pujas/${selectedPaymentAuction.id}/pay`, {
                                            method: 'POST',
                                            headers: { 
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${localStorage.getItem('token')}` 
                                            },
                                            body: JSON.stringify({ method: 'wallet' })
                                        });
                                        const data = await resp.json();
                                        if (resp.ok) {
                                            setSelectedPaymentAuction(null);
                                            fetchUserAuctions();
                                            alert('¡Pago realizado con éxito!');
                                        } else {
                                            alert(data.message || 'Error al pagar');
                                        }
                                    } catch (err) { console.error(err); }
                                    finally { setPaying(false); }
                                }}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all w-full text-left group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all">
                                    <span className="material-symbols-outlined">account_balance_wallet</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-sm">Mi Billetera</p>
                                    <p className="text-gray-500 text-[10px]">Saldo disponible: ${walletBalance}</p>
                                </div>
                            </button>

                            <button 
                                disabled={paying}
                                onClick={async () => {
                                    setPaying(true);
                                    try {
                                        const resp = await fetch(`${API}/auction/pujas/${selectedPaymentAuction.id}/pay`, {
                                            method: 'POST',
                                            headers: { 
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${localStorage.getItem('token')}` 
                                            },
                                            body: JSON.stringify({ method: 'stripe' })
                                        });
                                        const data = await resp.json();
                                        if (resp.ok && data.url) {
                                            window.location.href = data.url;
                                        }
                                    } catch (err) { console.error(err); }
                                    finally { setPaying(false); }
                                }}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all w-full text-left group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined">credit_card</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-sm">Tarjeta bancaria</p>
                                    <p className="text-gray-500 text-[10px]">Stripe Secure Payment</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setSelectedPaymentAuction(null)}
                                disabled={paying}
                                className="mt-4 text-gray-500 text-sm font-bold hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
