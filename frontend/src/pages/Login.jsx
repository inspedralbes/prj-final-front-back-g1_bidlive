import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GoogleLogin } from '@react-oauth/google';

const GlowOrb = ({ className }) => (
    <div className={`absolute rounded-full pointer-events-none blur-3xl opacity-30 ${className}`} />
);

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex"
            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
        >
            {/* Left — branding */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1028 100%)' }}
            >
                <GlowOrb className="w-96 h-96 -top-20 -left-20 bg-amber-500" />
                <GlowOrb className="w-72 h-72 bottom-10 right-0 bg-purple-600" />

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 z-10">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#08080f" />
                            <path d="M12 2v20M2 7l10 5 10-5" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-white font-bold text-xl">Bid<span className="text-amber-400">Live</span></span>
                </Link>

                {/* Central tagline */}
                <div className="z-10 space-y-6">
                    <div className="badge-live w-fit">
                        <span className="live-dot" />
                        {t('login.liveBadge')}
                    </div>
                    <h1 className="text-5xl font-black leading-tight text-white">
                        {t('login.title1')}<br />
                        <span className="text-amber-400">{t('login.title2')}</span>{t('login.title3')}<br />
                        {t('login.title4')}
                    </h1>
                    <p className="text-gray-400 text-lg max-w-sm leading-relaxed">
                        {t('login.subtitle')}
                    </p>
                </div>

                {/* Stats */}
                <div className="z-10 flex gap-8">
                    {[['12K+', t('login.stat1')], ['500+', t('login.stat2')], ['98%', t('login.stat3')]].map(([val, label]) => (
                        <div key={label}>
                            <p className="text-amber-400 text-2xl font-black">{val}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right — form */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
                {/* Mobile Logo */}
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
                        <h2 className="text-3xl font-black text-white">{t('login.welcome')}</h2>
                        <p className="text-gray-400 mt-2">{t('login.welcomeSub')}</p>
                    </div>

                    {error && (
                        <div className="mb-5 p-4 rounded-xl text-sm text-red-400 border border-red-500/20"
                            style={{ background: 'rgba(239,68,68,0.07)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="input-label">{t('login.email')}</label>
                            <input
                                className="input-field"
                                type="email"
                                placeholder={t('login.emailPlaceholder')}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="input-label" style={{ marginBottom: 0 }}>{t('login.pass')}</label>
                                <Link to="/forgot-password" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                                    {t('login.forgotPass')}
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    className="input-field pr-12"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder={t('login.passPlaceholder')}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPass ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-base mt-2"
                        >
                            {loading ? (
                                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                            ) : t('login.btnSign')}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#08080f] text-gray-400">{t('login.or')}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <GoogleLogin
                                onSuccess={async credentialResponse => {
                                    try {
                                        setLoading(true);
                                        await googleLogin(credentialResponse.credential);
                                        navigate('/');
                                    } catch (err) {
                                        setError(err.message || 'Google login failed');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                onError={() => {
                                    setError('Google login failed');
                                }}
                                theme="filled_black"
                                shape="pill"
                            />
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            {t('login.noAccount')}{' '}
                            <Link to="/register" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
                                {t('login.createOne')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
