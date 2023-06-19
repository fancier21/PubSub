import WebSocket, { WebSocketServer } from 'ws';

// Create a WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Store connected clients
const clients = new Set();

// Handle new client connections
wss.on('connection', (ws) => {
  // Add client to the set of connected clients
  clients.add(ws);

  // Handle incoming messages
  ws.on('message', (message) => {
    console.log('MESSAGE', JSON.parse(message.toString()));
    // Broadcast the received message to all clients
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  });

  // Handle client disconnections
  ws.on('close', () => {
    // Remove client from the set of connected clients
    clients.delete(ws);
  });
});
