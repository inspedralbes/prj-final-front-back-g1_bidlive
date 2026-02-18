import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';

const CreatePuja = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startingPrice: '',
        imageFile: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        if (e.target.name === 'imageFile') {
            setFormData({ ...formData, imageFile: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!user || !user.id) {
            setError('You must be logged in to create an auction.');
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('startingPrice', formData.startingPrice);
            data.append('sellerId', user.id);
            if (formData.imageFile) {
                data.append('image', formData.imageFile);
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auction/pujas`, {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'multipart/form-data', // Do NOT set this manually, let fetch handle the boundary
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: data
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Server error response:', text);
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    throw new Error(`Server Error: ${text.substring(0, 100)}...`);
                }
                throw new Error(data.message || 'Failed to create puja');
            }

            navigate('/profile');
        } catch (err) {
            console.error(err);
            setError(err.message);
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

                    {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">{error}</div>}

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
                            ></textarea>
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
                            <label className="block text-sm font-medium mb-2">Image</label>
                            <input
                                type="file"
                                name="imageFile"
                                onChange={handleChange}
                                accept="image/*"
                                className="w-full bg-[#39282b]/50 border border-[#543b3f] rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Launch Puja'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreatePuja;
