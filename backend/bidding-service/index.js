const WebSocket = require('ws');
const port = process.env.PORT || 3002;

const wss = new WebSocket.Server({ port });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Received:', message);
    });

    ws.send('BS Connection Info: Connected to Bidding Service');
});

console.log(`Bidding Service started on port ${port}`);
