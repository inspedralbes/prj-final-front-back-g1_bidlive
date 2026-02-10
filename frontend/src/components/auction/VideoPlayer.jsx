import React from 'react';

const VideoPlayer = () => {
    return (
        <div className="relative w-full aspect-video bg-black group">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDEQEUWajgGhDVyR4kjPBRQqb-Wuf2_8KFPzzt2Q0AVzCNS5pRpbLeNTiNdQZwXmiNWs2ElKy_yFdw8aciwZOLzQQH1lRh1H372T27wJqT9LoyvRMIYPLDg9o0CZI0E5rgc9ABeYP7QRyIEAT4oCcY5AZ2W22yc6XJ6Zqf8uJgzl0TPH8FoxXmWWyKc2eKZf9LEGWiLvcXLvyDcvEyKcX-_plgmJ2uLQUeeMty6i4K_wEc4aeymCnfe0JNNqxnou_WcBWatnB0pTu09')" }}
            >
                {/* Overlay Controls */}
                <div className="absolute top-4 left-4 flex gap-2">
                    <div className="flex items-center gap-1.5 bg-primary px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-white">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        LIVE
                    </div>
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 text-white">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        1,248
                    </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex shrink-0 items-center justify-center rounded-full size-20 bg-black/40 backdrop-blur-sm text-white border border-white/20 hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-4xl leading-none">play_arrow</span>
                    </button>
                </div>

                <div className="absolute bottom-4 right-4 flex gap-2">
                    <button className="bg-black/60 backdrop-blur-md p-2 rounded-lg hover:bg-black/80 text-white">
                        <span className="material-symbols-outlined text-sm">volume_up</span>
                    </button>
                    <button className="bg-black/60 backdrop-blur-md p-2 rounded-lg hover:bg-black/80 text-white">
                        <span className="material-symbols-outlined text-sm">fullscreen</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
