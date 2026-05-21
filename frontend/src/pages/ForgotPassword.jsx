import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Error al enviar el correo');
            } else {
                setSent(true);
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
                    {!sent ? (
                        <>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-black text-white mb-2">¿Olvidaste tu contraseña?</h1>
                            <p className="text-gray-500 text-sm mb-6">Introduce tu email y te enviaremos un enlace para restablecerla.</p>

                            {error && (
                                <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="input-label">Dirección de email</label>
                                    <input
                                        className="input-field"
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        style={{ fontSize: '16px' }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Enviando...</>
                                    ) : 'Enviar enlace de recuperación'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <h2 className="text-xl font-black text-white mb-2">¡Revisa tu bandeja!</h2>
                            <p className="text-gray-500 text-sm">Si existe una cuenta para <strong className="text-white">{email}</strong>, recibirás un enlace de recuperación en breve.</p>
                            <p className="text-gray-600 text-xs mt-3">¿No lo ves? Comprueba la carpeta de spam.</p>
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
