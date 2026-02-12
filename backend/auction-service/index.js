const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Auction Service is running');
});

app.listen(port, () => {
    console.log(`Auction Service listening on port ${port}`);
});
