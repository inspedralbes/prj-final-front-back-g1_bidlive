import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GlowOrb = ({ className }) => (
    <div className={`absolute rounded-full pointer-events-none blur-3xl opacity-30 ${className}`} />
);

export default function Register() {
    const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            await register(form.username, form.email, form.password);
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const strength = (() => {
        const p = form.password;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();

    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

    return (
        <div
            className="min-h-screen flex"
            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
        >
            {/* Left branding */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1028 100%)' }}
            >
                <GlowOrb className="w-80 h-80 -top-16 -right-10 bg-amber-500" />
                <GlowOrb className="w-64 h-64 bottom-0 left-0 bg-indigo-600" />

                <Link to="/" className="flex items-center gap-2.5 z-10">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#08080f" />
                            <path d="M12 2v20M2 7l10 5 10-5" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-white font-bold text-xl">Bid<span className="text-amber-400">Live</span></span>
                </Link>

                <div className="z-10 space-y-6">
                    <h1 className="text-5xl font-black leading-tight text-white">
                        Join the world's<br />
                        <span className="text-amber-400">fastest growing</span><br />
                        auction platform.
                    </h1>
                    <p className="text-gray-400 text-lg max-w-sm leading-relaxed">
                        Buy, sell and bid on unique items — all in real-time. Create your account in seconds.
                    </p>
                </div>

                <div className="z-10 flex gap-8">
                    {[['Free', 'Account creation'], ['Real-time', 'Bidding experience'], ['Secure', 'Transactions']].map(([val, label]) => (
                        <div key={label}>
                            <p className="text-amber-400 text-2xl font-black">{val}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right form */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
                <Link to="/" className="flex lg:hidden items-center gap-2 mb-10">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#08080f" />
                        </svg>
                    </div>
                    <span className="text-white font-bold text-lg">Bid<span className="text-amber-400">Live</span></span>
                </Link>

                <div className="w-full max-w-md animate-fade-in">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-white">Create your account</h2>
                        <p className="text-gray-400 mt-2">Start bidding in seconds.</p>
                    </div>

                    {error && (
                        <div className="mb-5 p-4 rounded-xl text-sm text-red-400 border border-red-500/20"
                            style={{ background: 'rgba(239,68,68,0.07)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="input-label">Username</label>
                            <input className="input-field" type="text" placeholder="coolbidder99" value={form.username}
                                onChange={set('username')} required minLength={3} />
                        </div>

                        <div>
                            <label className="input-label">Email address</label>
                            <input className="input-field" type="email" placeholder="you@example.com" value={form.email}
                                onChange={set('email')} required autoComplete="email" />
                        </div>

                        <div>
                            <label className="input-label">Password</label>
                            <div className="relative">
                                <input className="input-field pr-12" type={showPass ? 'text' : 'password'}
                                    placeholder="Min. 6 characters" value={form.password}
                                    onChange={set('password')} required minLength={6} autoComplete="new-password" />
                                <button type="button" onClick={() => setShowPass(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors" tabIndex={-1}>
                                    {showPass
                                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    }
                                </button>
                            </div>
                            {form.password && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex gap-1 flex-1">
                                        {[0, 1, 2, 3].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength - 1] : 'bg-white/10'}`} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-500">{strengthLabels[strength - 1] || ''}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="input-label">Confirm password</label>
                            <input className="input-field" type={showPass ? 'text' : 'password'}
                                placeholder="Repeat your password" value={form.confirm}
                                onChange={set('confirm')} required autoComplete="new-password" />
                            {form.confirm && form.confirm !== form.password && (
                                <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                            )}
                        </div>

                        <button type="submit" disabled={loading || (form.confirm && form.confirm !== form.password)}
                            className="btn-primary w-full py-3 text-base mt-2">
                            {loading ? (
                                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                            ) : 'Create account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
