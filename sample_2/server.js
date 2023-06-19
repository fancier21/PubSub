import {WebSocketServer} from 'ws';

const wss = new WebSocketServer({ port: 8080 });

// Store connected clients and chat rooms
const clients = new Set();
const chatRooms = new Map();

wss.on('connection', (ws) => {
  // Add client to the set of connected clients
  clients.add(ws);
  console.log("Clients", clients.size);

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    // console.log('Message', parsedMessage);

    // Handle different message types
    switch (parsedMessage.type) {
      case 'join':
        handleJoin(ws, parsedMessage.room);
        break;
      case 'chat':
        handleChatMessage(ws, parsedMessage.room, parsedMessage.payload);
        break;
      // Add more message type handlers as needed
    }
  });

  ws.on('close', () => {
    // Remove client from the set of connected clients
    clients.delete(ws);

    // Remove client from all chat rooms
    chatRooms.forEach((clientsInRoom, room) => {
      if (clientsInRoom.has(ws)) {
        clientsInRoom.delete(ws);
        if (clientsInRoom.size === 0) {
          chatRooms.delete(room);
        }
      }
    });
  });
});

function handleJoin(ws, room) {
  console.log("JOIN");
  // Create the chat room if it doesn't exist
  if (!chatRooms.has(room)) {
    chatRooms.set(room, new Set());
  }

  // Add client to the chat room
  chatRooms.get(room).add(ws);
}

function handleChatMessage(ws, room, message) {
  console.log("MESSAGE");
  // Check if the chat room exists
  if (chatRooms.has(room)) {
    const clientsInRoom = chatRooms.get(room);

    // Broadcast the message to all clients in the room
    clientsInRoom.forEach((client) => {
      if (client !== ws) {
        // Send the message to each client with acknowledgment
        sendMessageWithAcknowledgment(client, {
          type: 'chat',
          room: room,
          payload: message
        });
      }
    });

    // Send acknowledgment to the sender
    sendMessageWithAcknowledgment(ws, { type: 'ack' });
  }
}

function sendMessageWithAcknowledgment(client, message) {
  const messageId = generateUniqueId();
  const messageWithId = {
    id: messageId,
    ...message
  };

  client.send(JSON.stringify(messageWithId), (error) => {
    console.log('sendMessageWithId')
    if (error) {
      console.error(`Error sending message: ${error.message}`);
    } else {
      // Message sent successfully, handle acknowledgment
      client.once('message', (ackMessage) => {
        const parsedAckMessage = JSON.parse(ackMessage);
        console.log('ACK message', parsedAckMessage);
        if (parsedAckMessage.type === 'ack' && parsedAckMessage.id === messageId) {
          // Message acknowledged by the client
          console.log(`Message acknowledged by client: ${client}`);
        }
      });
    }
  });
}

function generateUniqueId() {
  // Implement your own unique ID generation logic here
  // This can be a simple counter, a UUID generator, or any other mechanism
  return Math.random().toString(36).substr(2, 9);
}

