import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Logo = () => (
    <Link to="/" className="flex items-center gap-2 select-none group">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="#08080f" strokeWidth="2" strokeLinejoin="round" fill="#08080f" />
                <path d="M12 2v20M2 7l10 5 10-5" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">
            Bid<span className="text-amber-500">Live</span>
        </span>
    </Link>
);

const NavLink = ({ to, children, active }) => (
    <Link
        to={to}
        className={`text-sm font-medium transition-colors px-1 py-0.5 ${active
            ? 'text-amber-400'
            : 'text-gray-400 hover:text-white'
            }`}
    >
        {children}
    </Link>
);

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const [isRecharging, setIsRecharging] = useState(false);
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [rechargeError, setRechargeError] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const handleRechargeSubmit = async (e) => {
        e.preventDefault();
        setRechargeError('');
        const amount = parseFloat(rechargeAmount);

        if (!amount || isNaN(amount) || amount <= 0) {
            setRechargeError('Introduce un importe válido');
            return;
        }

        setIsProcessingPayment(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auth/payment/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                setRechargeError(data.error || data.message || "Error al crear sesión");
            }
        } catch (err) {
            console.error("Payment error:", err);
            setRechargeError("Error de conexión");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setUserMenuOpen(false);
    };

    // Close user menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <header
            className="sticky top-0 z-50 w-full"
            style={{
                background: 'rgba(8,8,15,0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* Left */}
                <Logo />

                {/* Nav links — desktop */}
                <nav className="hidden md:flex items-center gap-6">
                    <NavLink to="/" active={isActive('/')}>Home</NavLink>
                    <NavLink to="/explore" active={isActive('/explore')}>Explore</NavLink>
                    {user && <NavLink to="/seller" active={isActive('/seller')}>Dashboard</NavLink>}
                </nav>

                {/* Right */}
                <div className="flex items-center gap-3">
                    {!user ? (
                        <>
                            <Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm py-2 px-4">
                                Sign in
                            </Link>
                            <Link to="/register" className="btn-primary text-sm py-2 px-4">
                                Get started
                            </Link>
                        </>
                    ) : (
                        <>
                            {/* Create auction button */}
                            <Link
                                to="/create-puja"
                                className="hidden sm:inline-flex btn-primary text-sm py-2 px-4 gap-1.5"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                New auction
                            </Link>

                            {/* User avatar dropdown */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(v => !v)}
                                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-amber-400 border border-amber-500/30 hover:border-amber-500/60 transition-colors cursor-pointer select-none overflow-hidden"
                                    style={{ background: 'rgba(245,158,11,0.12)' }}
                                >
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt="User Avatar"
                                            className="w-full h-full object-cover rounded-full"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'inline';
                                            }}
                                        />
                                    ) : null}
                                    <span style={{ display: user.avatar_url ? 'none' : 'inline' }}>
                                        {(user.username || user.email || 'U')[0].toUpperCase()}
                                    </span>
                                </button>

                                {userMenuOpen && (
                                    <div
                                        className="absolute right-0 top-12 min-w-[180px] rounded-xl overflow-hidden animate-scale-in"
                                        style={{
                                            background: '#1a1a28',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                                        }}
                                    >
                                        <div className="px-4 py-3 border-b border-white/5">
                                            <p className="text-white font-semibold text-sm truncate">
                                                {user.username || 'User'}
                                            </p>
                                            <p className="text-gray-400 text-xs truncate mt-0.5">{user.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            My Profile
                                        </Link>

                                        {!isRecharging ? (
                                            <button
                                                onClick={() => setIsRecharging(true)}
                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-amber-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                    <path d="M12 5v14M5 12h14" />
                                                </svg>
                                                Añadir Dinero
                                            </button>
                                        ) : (
                                            <div className="px-4 py-3 bg-white/5 border-y border-white/5">
                                                <form onSubmit={handleRechargeSubmit} className="space-y-2">
                                                    <div className="relative">
                                                        <input
                                                            autoFocus
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={rechargeAmount}
                                                            onChange={(e) => setRechargeAmount(e.target.value)}
                                                            className="w-full bg-[#08080f] border border-white/10 rounded-lg py-1.5 pl-7 pr-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                                            disabled={isProcessingPayment}
                                                        />
                                                        <span className="absolute left-2.5 top-1.5 text-gray-500 text-sm">€</span>
                                                    </div>
                                                    
                                                    {rechargeError && (
                                                        <p className="text-[10px] text-red-400 leading-tight">{rechargeError}</p>
                                                    )}

                                                    <div className="flex gap-2">
                                                        <button
                                                            type="submit"
                                                            disabled={isProcessingPayment}
                                                            className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#08080f] font-bold py-1.5 rounded-lg text-xs transition-colors"
                                                        >
                                                            {isProcessingPayment ? '...' : 'Añadir'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsRecharging(false);
                                                                setRechargeError('');
                                                                setRechargeAmount('');
                                                            }}
                                                            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-1.5 rounded-lg text-xs transition-colors"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                        <Link
                                            to="/seller"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/create-puja"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            New auction
                                        </Link>
                                        <div className="border-t border-white/5 mt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                        onClick={() => setMenuOpen(v => !v)}
                        aria-label="Toggle menu"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {menuOpen
                                ? <><path d="M18 6L6 18" /><path d="M6 6L18 18" /></>
                                : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>
                            }
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile nav menu */}
            {menuOpen && (
                <div
                    className="md:hidden border-t border-white/5 px-4 py-4 space-y-1"
                    style={{ background: 'rgba(8,8,15,0.97)' }}
                >
                    {[
                        { to: '/', label: 'Home' },
                        { to: '/explore', label: 'Explore' },
                        ...(user ? [
                            { to: '/profile', label: 'My profile' },
                            { to: '/seller', label: 'Dashboard' },
                            { to: '/profile', label: 'My Profile' },
                            { to: '/create-puja', label: 'New auction' },
                        ] : [
                            { to: '/login', label: 'Sign in' },
                            { to: '/register', label: 'Get started' },
                        ])
                    ].map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={() => setMenuOpen(false)}
                            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            {label}
                        </Link>
                    ))}
                    {user && (
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/5 transition-colors"
                        >
                            Sign out
                        </button>
                    )}
                </div>
            )}
        </header>
    );
}
