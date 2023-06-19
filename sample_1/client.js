const msgList = [];

const users = [
  { id: 1, nickname: "bob" },
  { id: 2, nickname: "joe" },
];
const rooms = [
  { id: 1, name: "Room 1" },
  { id: 2, name: "Room 2" },
];

const ws = new WebSocket("ws://localhost:8080");
console.log("before open", ws.readyState); // 0

ws.onerror = () => {
  console.log("onerror", ws); // error
};

const user = {
  userId: users[0].id,
  userName: users[0].nickname,
  roomId: rooms[0].id,
  roomName: rooms[0].name,
  event: "login",
};

ws.onopen = () => {
  console.log("onopen", ws.readyState); // 1
  ws.send(JSON.stringify(user));
};

ws.onmessage = (message) => {
  const data = JSON.parse(message.data);
  console.log("The client recieves the message", data); // 2

  if (data.event === "login") {
    msgList.push({
      content: `Welcome to ${data.userName} to room ${data.roomName}`,
    });
  } else if (data.event === "logout") {
    msgList.push({
      content: `${data.userName} Leave the room`,
    });
  } else {
    msgList.push({
      content: `${data.userName} ${data.content}`,
    });
  }
};

ws.onclose = () => {
  console.log("onclose", ws.readyState); // 3
};
