import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import FilterBar from '../components/explore/FilterBar';
import ResultsGrid from '../components/explore/ResultsGrid';

const Search = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display">
            <Header />
            <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-8">
                <h1 className="text-3xl font-black mb-2">Explore Auctions</h1>
                <p className="text-slate-500 mb-8">Discover rare items and join live bidding wars happening now.</p>

                <FilterBar />
                <ResultsGrid />
            </main>
            <Footer />
        </div>
    );
};

export default Search;
