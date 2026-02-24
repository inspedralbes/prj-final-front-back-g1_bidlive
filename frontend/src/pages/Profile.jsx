import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';

import { Link } from 'react-router-dom';

const Profile = () => {
    const { user } = useAuth();

    const [myAuctions, setMyAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        username: user?.username || '',
        avatar_url: user?.avatar_url || '',
        billing_address: user?.billing_address || '',
        payment_method: user?.payment_method || 'credit_card'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUserAuctions = async () => {
            if (!user) return;
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auction/pujas/user/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setMyAuctions(data);
                }
            } catch (error) {
                console.error("Error fetching user auctions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAuctions();
    }, [user]);

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
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                // Update local storage and context state if needed (we'll just use window.location.reload() for now, or update local storage manually)
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
                                    {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-6xl font-black bg-gradient-to-tr from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                            {initial}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 p-3 bg-white/10 backdrop-blur-md rounded-full text-white shadow-lg border border-white/20 hover:bg-white/20 transition-all transform hover:scale-110">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 text-center md:text-left pt-4">
                            <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                                Miembro Pro
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tight flex justify-center md:justify-start items-center gap-3">
                                {user?.username}
                                <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </h1>
                            <p className="text-gray-400 mt-2 text-lg">{user?.email}</p>

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
                                        0
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total</span>
                                        <span className="text-white font-medium">Pujas Realizadas</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-green-400 font-black text-xl">
                                        $0
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Saldo</span>
                                        <span className="text-white font-medium">Actual</span>
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
                                    <label className="block text-gray-400 text-sm font-bold mb-2">Enlace URL para la Foto de Perfil</label>
                                    <input type="text" name="avatar_url" value={formData.avatar_url} onChange={handleInputChange} placeholder="https://..." className="w-full bg-[#08080f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" />
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
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h2 className="text-3xl font-black text-white flex items-center gap-3">
                            <span className="text-amber-500">⚡</span> Mis Subastas
                        </h2>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-bold border border-white/5">Activas</button>
                            <button className="px-4 py-2 rounded-lg text-gray-400 text-sm font-bold hover:text-white transition-colors">Pasadas</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                        </div>
                    ) : myAuctions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                                <p className="font-black text-2xl text-white tracking-tight">${auction.current_price || auction.starting_price}</p>
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
                        <div className="bg-white/5 border border-dashed border-white/20 rounded-3xl p-16 text-center backdrop-blur-sm">
                            <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center text-4xl border border-white/10">
                                🌟
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Tu escaparate está vacío</h3>
                            <p className="text-gray-400 max-w-md mx-auto mb-8 text-lg">Aún no has publicado ningún artículo para subastar. Empieza a vender tus piezas exclusivas con la comunidad.</p>
                            <Link to="/create-puja" className="inline-block px-8 py-4 bg-amber-500 text-black rounded-xl font-black hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all">
                                Crear tu primera subasta
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Profile;
