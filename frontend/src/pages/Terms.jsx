import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Terms = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display flex flex-col">
            <Header />
            <main className="flex-grow max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

                <div className="space-y-6 text-slate-700 dark:text-slate-300">
                    <section>
                        <h2 className="text-xl font-bold mb-3 text-primary">1. Acceptance of Terms</h2>
                        <p>By accessing and using BidLive ("the Platform"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-primary">2. User Eligibility</h2>
                        <p>You must be at least 18 years old and capable of forming a binding contract to use our services. By using BidLive, you represent and warrant that you meet these requirements.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-primary">3. Auction Rules</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>All bids are binding contracts. By placing a bid, you commit to purchasing the item if you are the winning bidder.</li>
                            <li>The highest bidder at the close of the auction is the buyer, subject to any reserve price being met.</li>
                            <li>Bid manipulation, shill bidding, and other fraudulent activities are strictly prohibited.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-primary">4. Seller Responsibilities</h2>
                        <p>Sellers must provide accurate and complete descriptions of items. Sellers warrant that they have the legal right to sell listed items and that items are free from liens or encumbrances.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-primary">5. Fees and Payments</h2>
                        <p>BidLive charges a platform fee for successful auctions. Buyers must pay for items within the timeframe specified in the auction listing. Failure to pay may result in account suspension.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-primary">6. Limitation of Liability</h2>
                        <p>BidLive is a venue for connecting buyers and sellers. We are not a party to the transaction and are not liable for the quality, safety, or legality of items advertised, or the truth or accuracy of listings.</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Terms;
