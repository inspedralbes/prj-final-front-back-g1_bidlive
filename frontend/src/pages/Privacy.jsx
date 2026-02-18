import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Privacy = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display flex flex-col">
            <Header />
            <main className="flex-grow max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

                <div className="space-y-6 text-slate-700 dark:text-slate-300">
                    <section>
                        <h2 className="text-xl font-bold mb-3 text-primary">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, including but not limited to your name, email address, shipping address, and payment information when you register, bid, or sell on the Platform.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-primary">2. How We Use Your Information</h2>
                        <p>We use the information we collect to operate, maintain, and improve our services, to process transactions, to communicate with you, and to prevent fraud and abuse.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-primary">3. Information Sharing</h2>
                        <p>We do not sell your personal information. We may share your information with third-party service providers who help us operate our business, such as payment processors and shipping partners.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-primary">4. Data Security</h2>
                        <p>We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-primary">5. Cookies and Tracking</h2>
                        <p>We use cookies and similar tracking technologies to track activity on our service and hold certain information to enhance your experience.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-primary">6. Your Rights</h2>
                        <p>You have the right to access, update, or delete your personal information. You may verify and update your information in your account settings or contact us for assistance.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-primary">7. Changes to This Policy</h2>
                        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Privacy;
