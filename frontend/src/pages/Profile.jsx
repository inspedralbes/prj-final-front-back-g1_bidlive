import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

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
    const token = localStorage.getItem('token');

    // --- Profile data state ---
    const [profile, setProfile] = useState(null);
    const [myAuctions, setMyAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Edit panel state ---
    const [editOpen, setEditOpen] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [editBio, setEditBio] = useState('');
    const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
    const [saveError, setSaveError] = useState('');

    // --- Avatar upload state ---
    const avatarInputRef = useRef(null);
    const [avatarStatus, setAvatarStatus] = useState('idle'); // idle | uploading | success | error
    const [avatarError, setAvatarError] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [profileRes, auctionsRes] = await Promise.all([
                    fetch(`${API}/auth/profile/${user.id}`),
                    fetch(`${API}/auction/pujas/user/${user.id}`),
                ]);
                if (profileRes.ok) {
                    const p = await profileRes.json();
                    setProfile(p);
                    setEditUsername(p.username || '');
                    setEditBio(p.bio || '');
                    if (p.avatar_url) setAvatarPreview(`${API}${p.avatar_url}`);
                }
                if (auctionsRes.ok) setMyAuctions(await auctionsRes.json());
            } catch (err) {
                console.error('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // ---- Save profile text data ----
    const handleSaveProfile = async () => {
        if (!editUsername.trim()) {
            setSaveError('Username is required.');
            setSaveStatus('error');
            return;
        }
        setSaveStatus('saving');
        setSaveError('');
        try {
            const res = await fetch(`${API}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ username: editUsername.trim(), bio: editBio }),
            });
            const data = await res.json();
            if (!res.ok) {
                setSaveError(data.message || 'Could not save changes.');
                setSaveStatus('error');
                return;
            }
            // Update context & local state
            updateUser({ username: data.user.username, bio: data.user.bio });
            setProfile(prev => ({ ...prev, username: data.user.username, bio: data.user.bio }));
            setSaveStatus('saved');
            setTimeout(() => { setSaveStatus('idle'); setEditOpen(false); }, 1500);
        } catch {
            setSaveError('Network error. Please try again.');
            setSaveStatus('error');
        }
    };

    // ---- Avatar upload ----
    const handleAvatarFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            setAvatarError(`Invalid file format. Please use ${ALLOWED_EXT_LABEL}.`);
            setAvatarStatus('error');
            e.target.value = '';
            return;
        }

        setAvatarError('');
        setAvatarStatus('uploading');

        // Optimistic preview
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);

        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const res = await fetch(`${API}/auth/profile/avatar`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) {
                setAvatarError(data.message || 'Upload failed.');
                setAvatarStatus('error');
                setAvatarPreview(profile?.avatar_url ? `${API}${profile.avatar_url}` : null);
                return;
            }
            updateUser({ avatar_url: data.avatar_url });
            setProfile(prev => ({ ...prev, avatar_url: data.avatar_url }));
            setAvatarStatus('success');
            setTimeout(() => setAvatarStatus('idle'), 2000);
        } catch {
            setAvatarError('Network error during upload.');
            setAvatarStatus('error');
            setAvatarPreview(profile?.avatar_url ? `${API}${profile.avatar_url}` : null);
        } finally {
            e.target.value = '';
        }
    };

    const displayName = profile?.username || user?.username || 'User';
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display">
            <Header />
            <main className="max-w-6xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* ─── Left: User card ─── */}
                        <div className="lg:col-span-1">
                            <div className="bg-zinc-900 dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark p-8 shadow-lg text-center sticky top-24 space-y-5">

                                {/* Avatar */}
                                <div className="relative w-32 h-32 mx-auto">
                                    <div
                                        className="w-32 h-32 rounded-full border-4 border-white dark:border-border-dark shadow-xl overflow-hidden cursor-pointer group relative"
                                        onClick={() => avatarInputRef.current?.click()}
                                        title="Click to change photo"
                                    >
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Profile avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-4xl font-black text-white">
                                                {initials}
                                            </div>
                                        )}
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                                            <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                                        </div>
                                    </div>

                                    {/* Upload status indicator */}
                                    {avatarStatus === 'uploading' && (
                                        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                                        </div>
                                    )}
                                    {avatarStatus === 'success' && (
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow">
                                            <span className="material-symbols-outlined text-white text-base">check</span>
                                        </div>
                                    )}
                                    {avatarStatus === 'error' && (
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow">
                                            <span className="material-symbols-outlined text-white text-base">close</span>
                                        </div>
                                    )}

                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="hidden"
                                        onChange={handleAvatarFileChange}
                                    />
                                </div>

                                {/* Avatar error */}
                                {avatarStatus === 'error' && avatarError && (
                                    <p className="text-xs text-red-500 font-medium">{avatarError}</p>
                                )}

                                <h1 className="text-2xl font-black">{displayName}</h1>

                                {/* Reputation */}
                                {profile && (
                                    <div className="flex items-center justify-center gap-1 mt-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`material-symbols-outlined text-sm ${i < getReputationStars(profile.total_sales || 0).stars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                star
                                            </span>
                                        ))}
                                        <span className="text-xs font-bold text-slate-500 ml-1 flex items-center">
                                            {getReputationStars(profile.total_sales || 0).label}
                                            <span className="text-[10px] ml-1 opacity-70">({profile.total_sales || 0} sales)</span>
                                        </span>
                                    </div>
                                )}

                                {profile?.bio && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{profile.bio}</p>
                                )}
                                <p className="text-slate-500 text-sm">{user?.email}</p>

                                <button
                                    onClick={() => { setEditOpen(o => !o); setSaveStatus('idle'); setSaveError(''); }}
                                    className="w-full py-2.5 border border-slate-200 dark:border-white/10 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-base">{editOpen ? 'close' : 'edit'}</span>
                                    {editOpen ? 'Cancel' : 'Edit Profile'}
                                </button>

                                {/* Member since */}
                                {profile?.created_at && (
                                    <p className="text-xs text-slate-400">
                                        Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </p>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-border-dark">
                                    <div>
                                        <h3 className="text-2xl font-black text-primary">{myAuctions.length}</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Auctions</p>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-400">0</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bids</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ─── Right: Edit panel + Auctions ─── */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Edit Panel */}
                            {editOpen && (
                                <div className="bg-zinc-900 dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark p-8 shadow-lg animate-fade-in">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">manage_accounts</span>
                                        Edit Profile
                                    </h2>
                                    <div className="space-y-5">
                                        {/* Username */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                                                Username <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={editUsername}
                                                onChange={e => { setEditUsername(e.target.value); setSaveStatus('idle'); setSaveError(''); }}
                                                maxLength={50}
                                                placeholder="Your display name"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-white/5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition text-sm"
                                            />
                                        </div>

                                        {/* Bio */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                                                Bio
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={editBio}
                                                onChange={e => setEditBio(e.target.value)}
                                                maxLength={300}
                                                placeholder="Tell the community a bit about yourself…"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-white/5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition text-sm resize-none"
                                            />
                                            <p className="text-right text-xs text-slate-400 mt-1">{editBio.length}/300</p>
                                        </div>

                                        {/* Error feedback */}
                                        {saveStatus === 'error' && saveError && (
                                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded-xl">
                                                <span className="material-symbols-outlined text-base">error</span>
                                                {saveError}
                                            </div>
                                        )}
                                        {saveStatus === 'saved' && (
                                            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 rounded-xl">
                                                <span className="material-symbols-outlined text-base">check_circle</span>
                                                Profile updated successfully!
                                            </div>
                                        )}

                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                                            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            {saveStatus === 'saving' ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                    Saving…
                                                </>
                                            ) : saveStatus === 'saved' ? (
                                                <>
                                                    <span className="material-symbols-outlined text-base">check</span>
                                                    Saved
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-base">save</span>
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* My Auctions */}
                            <div>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">gavel</span>
                                    My Auctions
                                </h2>
                                {myAuctions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {myAuctions.map(auction => (
                                            <Link
                                                to={`/auction/photo/${auction.id}`}
                                                key={auction.id}
                                                className="bg-zinc-900 dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden hover:shadow-lg transition-all group flex flex-col"
                                            >
                                                <div className="h-40 bg-slate-200 relative overflow-hidden">
                                                    {auction.image_url && (
                                                        <img
                                                            src={auction.image_url}
                                                            alt={auction.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    )}
                                                    <div className="absolute top-2 right-2">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${auction.status === 'live' ? 'bg-primary text-white' :
                                                            auction.status === 'upcoming' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'
                                                            }`}>
                                                            {auction.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-4 flex-1 flex flex-col">
                                                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{auction.title}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{auction.description}</p>
                                                    <div className="flex justify-between items-end border-t border-slate-100 dark:border-border-dark pt-3">
                                                        <div>
                                                            <p className="text-xs text-slate-500 font-bold uppercase">Price</p>
                                                            <p className="font-black text-lg">${auction.current_price || auction.starting_price}</p>
                                                        </div>
                                                        <span className="text-xs font-bold text-primary hover:underline">View Details →</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-zinc-900 dark:bg-surface-dark rounded-xl border-2 border-dashed border-slate-200 dark:border-border-dark p-12 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">storefront</span>
                                        <p className="text-slate-500 font-medium mb-4">You haven't created any auctions yet.</p>
                                        <Link
                                            to="/create-puja"
                                            className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
                                        >
                                            Create Your First Auction
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;
