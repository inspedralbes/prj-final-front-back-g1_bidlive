import React from 'react';

const UpcomingRail = () => {
    const [drops, setDrops] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch('/api/auction/drops')
            .then(res => res.json())
            .then(data => {
                setDrops(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch upcoming drops:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return null;

    return (
        <section className="pb-20">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">calendar_month</span> Upcoming Drops
                </h2>
                <div className="flex gap-2">
                    <button className="p-1 border border-gray-200 dark:border-border-dark rounded bg-white dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-border-dark">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button className="p-1 border border-gray-200 dark:border-border-dark rounded bg-white dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-border-dark">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
                {drops.map((item, index) => (
                    <div key={index} className="min-w-[320px] bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-gray-200 dark:border-border-dark group">
                        <div className="relative h-40">
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url('${item.img}')` }}
                            ></div>
                            <div className="absolute top-2 right-2">
                                <button className="bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white hover:text-primary">
                                    <span className="material-symbols-outlined text-sm">notifications_active</span>
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                <p className="text-white text-[10px] font-bold uppercase tracking-widest">Starts in: <span className="text-primary">{item.startsIn}</span></p>
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold mb-1">{item.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{item.desc}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full border border-white dark:border-surface-dark bg-gray-500"></div>
                                    <div className="w-6 h-6 rounded-full border border-white dark:border-surface-dark bg-gray-600"></div>
                                    <div className="w-6 h-6 rounded-full border border-white dark:border-surface-dark bg-gray-700 flex items-center justify-center text-[8px] font-bold text-white">+12</div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500">{item.reminders} set reminder</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default UpcomingRail;
