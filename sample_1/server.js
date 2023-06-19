import Websocket, { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ port: 8080 });

const group = {}

wss.on('connection', (socketClient) => {
  socketClient.on('error', console.error)

  socketClient.on('message', (message) => {
    const data = JSON.parse(message.toString());
    console.log('The sever recieves message: ', data);

    if (typeof socketClient.roomId === 'undefined' && data.roomId) {
      socketClient.roomId = data.roomId;
      if (typeof group[socketClient.roomId] === 'undefined') {
        group[socketClient.roomId] = 1
      } else {
        group[socketClient.roomId]++
      }
    }

    console.log('Group: ', group)
    data.num = group[socketClient.roomId];

    wss.clients.forEach((client) => {
      if (client.readyState === Websocket.OPEN && client.roomId === socketClient.roomId) {
        client.send(JSON.stringify(data));
      }
    });
  })

  socketClient.on('close', () => {
    group[socketClient.roomId]--;

    console.log('connection closed')
    wss.clients.forEach((client) => {
      if (client.readyState === Websocket.OPEN && client.roomId === socketClient.roomId) {
        client.send(JSON.stringify({
          event: 'logout',
          num: group[socketClient.roomId]
        }));
      }
    });
    console.log('Group: ', group)
  })
})
