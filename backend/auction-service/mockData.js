const liveAuctions = [
    {
        id: 2,
        title: "Vintage Camera Collection",
        seller: "RetroFinds_US",
        category: "Collectibles",
        bid: "$450",
        viewers: "1.2k",
        img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        sellerImg: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
        id: 3,
        title: "Mechanical Watch Restoration",
        seller: "TimeKeeper",
        category: "Luxury",
        bid: "$1,200",
        viewers: "854",
        img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        sellerImg: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
        id: 4,
        title: "Retro Gaming Console Bundle",
        seller: "GamerZone",
        category: "Tech",
        bid: "$300",
        viewers: "430",
        img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        sellerImg: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    {
        id: 5,
        title: "Abstract Art Live Painting",
        seller: "ArtStudio_NY",
        category: "Art",
        bid: "$800",
        viewers: "2.1k",
        img: "https://images.unsplash.com/photo-1460661619275-dbea9969859c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        sellerImg: "https://randomuser.me/api/portraits/women/68.jpg"
    }
];

const activeListings = [
    {
        id: 101,
        name: "Limited Edition Sneakers",
        img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        bid: "$180.00",
        bids: 12,
        timeLeft: "04:21"
    },
    {
        id: 102,
        name: "Vintage Denim Jacket",
        img: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        bid: "$65.00",
        bids: 4,
        timeLeft: "12:45"
    },
    {
        id: 103,
        name: "Classic Fountain Pen",
        img: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        bid: "$210.00",
        bids: 22,
        timeLeft: "02:10"
    },
    {
        id: 104,
        name: "Professional DSLR Lens",
        img: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        bid: "$850.00",
        bids: 15,
        timeLeft: "08:33"
    },
    {
        id: 105,
        name: "High-Performance Laptop",
        img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        bid: "$920.00",
        bids: 31,
        timeLeft: "01:45"
    }
];

const auctioneers = [
    { name: 'Alex Rivers', img: 'https://randomuser.me/api/portraits/men/1.jpg', online: true },
    { name: 'Sarah J.', img: 'https://randomuser.me/api/portraits/women/2.jpg', online: false },
    { name: 'VintageVault', img: 'https://randomuser.me/api/portraits/men/3.jpg', online: true },
    { name: 'ArtCurator', img: 'https://randomuser.me/api/portraits/women/4.jpg', online: false },
    { name: 'TheCardKing', img: 'https://randomuser.me/api/portraits/men/5.jpg', online: true },
];

const upcomingDrops = [
    {
        title: "The 'Grail' Sneaker Collection Vol. 2",
        desc: "150+ Rare items from the 90s era.",
        img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        startsIn: "02d 14h 55m",
        reminders: "2.4k"
    },
    {
        title: "Tech Legends: Sealed Apple Heritage",
        desc: "Exclusive first-gen iPhone & iPods.",
        img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        startsIn: "05d 06h 12m",
        reminders: "8.1k"
    },
    {
        title: "Modernism: Digital Art & NFTs Drop",
        desc: "Featuring works from top 5 digital artists.",
        img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        startsIn: "01d 02h 30m",
        reminders: "1.2k"
    }
];

// Bids for items in liveAuctions (ids 2-5) and activeListings (ids 101-105)
const recentBids = [
    { user: "@User882", bid: "$450", item: "Vintage Camera Collection" }, // Matches id 2
    { user: "@VaultHunter", bid: "$1,200", item: "Mechanical Watch Restoration" }, // Matches id 3
    { user: "@RetroFan", bid: "$300", item: "Retro Gaming Console Bundle" }, // Matches id 4
    { user: "@ArtLover", bid: "$800", item: "Abstract Art Live Painting" }, // Matches id 5
    { user: "@SneakerHead", bid: "$180.00", item: "Limited Edition Sneakers" } // Matches id 101
];

module.exports = { liveAuctions, activeListings, auctioneers, upcomingDrops, recentBids };
