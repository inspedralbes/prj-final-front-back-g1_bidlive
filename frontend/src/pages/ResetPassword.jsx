import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPass, setShowPass] = useState(false);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
                <div className="rounded-2xl p-8 text-center max-w-md w-full" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-black text-white mb-2">Enlace inválido</h2>
                    <p className="text-gray-500 text-sm mb-6">Este enlace de recuperación es inválido o ha expirado.</p>
                    <Link to="/forgot-password" className="btn-primary px-6 py-3 inline-block">
                        Solicitar nuevo enlace
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== confirm) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Error al restablecer la contraseña');
            } else {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch {
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4"
            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            {/* Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />

            <div className="w-full max-w-md animate-fade-in relative z-10">
                <Link to="/login" className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#08080f" /></svg>
                    </div>
                    <span className="text-white font-bold text-lg">Bid<span className="text-amber-400">Live</span></span>
                </Link>

                <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    {!success ? (
                        <>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                            </div>
                            <h1 className="text-2xl font-black text-white mb-2">Nueva contraseña</h1>
                            <p className="text-gray-500 text-sm mb-6">Elige una contraseña segura para tu cuenta de BidLive.</p>

                            {error && (
                                <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="input-label">Nueva contraseña</label>
                                    <div className="relative">
                                        <input
                                            className="input-field pr-12"
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="Mínimo 6 caracteres"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            style={{ fontSize: '16px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            tabIndex={-1}
                                        >
                                            <span className="material-symbols-outlined text-base">
                                                {showPass ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">Confirmar contraseña</label>
                                    <input
                                        className="input-field"
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Repite la contraseña"
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        required
                                        style={{ fontSize: '16px' }}
                                    />
                                    {confirm && confirm !== password && (
                                        <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
                                    )}
                                    {confirm && confirm === password && (
                                        <p className="text-green-400 text-xs mt-1">✓ Las contraseñas coinciden</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                                    disabled={loading || !password || password !== confirm}
                                >
                                    {loading ? (
                                        <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Actualizando...</>
                                    ) : '🔑 Establecer nueva contraseña'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <h2 className="text-xl font-black text-white mb-2">¡Contraseña actualizada!</h2>
                            <p className="text-gray-500 text-sm mb-4">Tu contraseña ha sido restablecida correctamente. Redirigiendo al inicio de sesión...</p>
                            <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium">
                            ← Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
