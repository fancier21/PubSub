const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => {
  // Join a chat room upon connecting
  joinChatRoom("room1");
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);

  // Handle different message types
  switch (message.type) {
    case "chat":
      handleChatMessage(message.room, message.payload);
      break;
    case "ack":
      handleAcknowledgment(message);
      break;
    // Add more message type handlers as needed
  }
};

function joinChatRoom(room) {
  const joinMessage = {
    type: "join",
    room: room,
  };

  sendMessageWithAcknowledgment(joinMessage);
}

function sendChatMessage(room, message) {
  const chatMessage = {
    type: "chat",
    room: room,
    payload: message,
  };

  sendMessageWithAcknowledgment(chatMessage);
}

function sendMessageWithAcknowledgment(message) {
  console.log("Sending message from the client");
  const messageId = generateUniqueId();
  const messageWithId = {
    id: messageId,
    ...message,
  };

  socket.send(JSON.stringify(messageWithId));

  socket.addEventListener("message", (event) => {
    console.log("Event received: " + event.data);
  });

  // // Handle acknowledgment from the server
  // socket.once('message', (ackMessage) => {
  //   const parsedAckMessage = JSON.parse(ackMessage);
  //   if (parsedAckMessage.type === 'ack' && parsedAckMessage.id === messageId) {
  //     // Message acknowledged by the server
  //     console.log('Message acknowledged by the server.');
  //   }
  // });
}

function handleChatMessage(room, message) {
  // Handle received chat messages
  console.log(`Received chat message in room ${room}: ${message}`);
}

function handleAcknowledgment(ackMessage) {
  // Handle received acknowledgments
  console.log(`Received acknowledgment for message ${ackMessage.id}`);
}

function generateUniqueId() {
  // Implement your own unique ID generation logic here
  // This can be a simple counter, a UUID generator, or any other mechanism
  return Math.random().toString(36).substr(2, 9);
}
