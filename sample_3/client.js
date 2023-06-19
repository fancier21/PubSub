// WebSocket PubSub implementation
class PubSub {
  constructor() {
    this.socket = null;
    this.subscriptions = {};
    this.messageQueue = [];
    this.isQueueing = false;
  }

  connect(url) {
    this.socket = new WebSocket(url);

    this.socket.addEventListener('open', () => {
      console.log('WebSocket connection is open.');

      // Send any messages in the queue
      this.flushMessageQueue();
    });

    this.socket.addEventListener('message', (event) => {
      console.log('DATA', event)
      const data = JSON.parse(event.data.toString());
      const { channel, payload } = data;

      if (channel in this.subscriptions) {
        this.subscriptions[channel].forEach((callback) => {
          callback(payload);
        });
      }
    });

    this.socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.socket.addEventListener('close', (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
    });
  }

  subscribe(channel, callback) {
    if (!(channel in this.subscriptions)) {
      this.subscriptions[channel] = [];
    }

    this.subscriptions[channel].push(callback);
  }

  unsubscribe(channel, callback) {
    if (channel in this.subscriptions) {
      const index = this.subscriptions[channel].indexOf(callback);
      if (index !== -1) {
        this.subscriptions[channel].splice(index, 1);
      }
    }
  }

  publish(channel, payload) {
    const message = JSON.stringify({ channel, payload });

    if (this.socket.readyState === WebSocket.CONNECTING) {
      console.log('CONNECTING');
      // If the WebSocket is still connecting, queue the message
      this.messageQueue.push(message);

      if (!this.isQueueing) {
        // Start queueing messages if not already in progress
        this.isQueueing = true;

        this.socket.addEventListener('open', () => {
          // Connection is open, flush the message queue
          this.flushMessageQueue();
        });
      }
    } else if (this.socket.readyState === WebSocket.OPEN) {
      console.log('OPEN');
      // If the WebSocket is open, send the message immediately
      this.socket.send(message);
    } else {
      console.error('WebSocket connection is not open.');
    }
  }

  flushMessageQueue() {
    console.log('Flushing message queue.');
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.socket.send(message);
    }

    this.isQueueing = false;
  }

  disconnect() {
    this.socket.close();
  }
}

// Usage example
const pubsub = new PubSub();

pubsub.connect('ws://localhost:8080'); // Replace with your WebSocket server URL

pubsub.subscribe("channel1", (data) => {
  console.log('Received data from channel1:', data);
});

pubsub.subscribe("channel2", (data) => {
  console.log('Received data from channel2:', data);
});

pubsub.publish("channel1", "Hello from channel1!");
pubsub.publish("channel2", "Hello from channel2!");
pubsub.publish("channel2", "Hello from channel2!!!");

// After you're done, remember to disconnect
// pubsub.disconnect();
