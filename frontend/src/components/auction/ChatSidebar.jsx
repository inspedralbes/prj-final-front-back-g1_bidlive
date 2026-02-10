import React from 'react';

const ChatSidebar = () => {
    return (
        <aside className="lg:col-span-4 flex flex-col h-full border-l border-[#39282b] bg-[#1a0d0f] text-white">
            {/* Tabs */}
            <div className="flex border-b border-[#39282b]">
                <button className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary">Live Chat</button>
                <button className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-[#ba9ca1] hover:text-white transition-colors">Bid History</button>
            </div>

            {/* Scrollable Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* System Message */}
                <div className="flex flex-col items-center py-2">
                    <div className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-[#ba9ca1]">Auction started 15m ago</div>
                </div>

                {/* Chat Messages */}
                <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 shrink-0 flex items-center justify-center text-[10px] font-bold">JD</div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-blue-400">Jordan_D</span>
                        <p className="text-sm text-white/90">That dial is absolutely incredible.</p>
                    </div>
                </div>

                {/* High-priority Bid Message */}
                <div className="bg-primary/10 border-l-4 border-primary p-3 rounded-r-lg">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-primary">NEW BID</span>
                        <span class="text-[10px] text-white/40">2m ago</span>
                    </div>
                    <p className="text-sm font-medium"><span className="text-white font-bold">WatchKing99</span> bid <span className="text-primary font-bold">€1,450</span></p>
                </div>

                <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-500 shrink-0 flex items-center justify-center text-[10px] font-bold">SK</div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-purple-400">Sarah_K</span>
                        <p class="text-sm text-white/90">Does it include the original bracelet?</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-500 shrink-0 flex items-center justify-center text-[10px] font-bold">AM</div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-orange-400">Alex_M</span>
                        <p class="text-sm text-white/90">Waiting for the last 10 seconds!</p>
                    </div>
                </div>

                <div className="flex gap-3 opacity-60">
                    <div className="h-8 w-8 rounded-full bg-gray-600 shrink-0 flex items-center justify-center text-[10px] font-bold">M</div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400">Moderator</span>
                        <p className="text-sm italic">Please keep discussions relevant to the current item.</p>
                    </div>
                </div>
            </div>

            {/* Sticky Bid Controls */}
            <div className="p-4 bg-[#221013] border-t border-[#39282b] space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/40 text-lg">chat_bubble</span>
                        <input
                            type="text"
                            placeholder="Send a message..."
                            className="w-full bg-[#39282b] border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/50 text-white placeholder:text-white/30"
                        />
                    </div>
                    <button className="bg-[#39282b] w-10 h-10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-[#4a3539]">
                        <span className="material-symbols-outlined">emoji_emotions</span>
                    </button>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Next minimum bid: €1,460</span>
                        <span className="text-[11px] text-primary font-bold">TOP BIDDER</span>
                    </div>
                    <button className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 transform active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5">
                        <span className="text-xl tracking-tight">BID +€10</span>
                        <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Place bid now</span>
                    </button>
                    <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-[#39282b] rounded-lg text-xs font-bold hover:bg-[#4a3539] transition-colors border border-white/5 text-white">+€50</button>
                        <button className="flex-1 py-2 bg-[#39282b] rounded-lg text-xs font-bold hover:bg-[#4a3539] transition-colors border border-white/5 text-white">+€100</button>
                        <button className="flex-1 py-2 bg-[#39282b] rounded-lg text-xs font-bold hover:bg-[#4a3539] transition-colors border border-white/5 text-white">Custom</button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default ChatSidebar;
