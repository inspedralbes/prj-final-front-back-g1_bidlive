const express = require('express');
const cors = require('cors');
const { liveAuctions, activeListings, auctioneers, upcomingDrops, recentBids } = require('./mockData');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Auction Service is running');
});

app.get('/live', (req, res) => {
    res.json(liveAuctions);
});

app.get('/active', (req, res) => {
    res.json(activeListings);
});

app.get('/auctioneers', (req, res) => {
    res.json(auctioneers);
});

app.get('/drops', (req, res) => {
    res.json(upcomingDrops);
});

app.get('/bids/recent', (req, res) => {
    res.json(recentBids);
});

app.listen(port, () => {
    console.log(`Auction Service listening on port ${port}`);
});
