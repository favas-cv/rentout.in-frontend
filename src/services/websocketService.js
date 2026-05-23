import { toast } from 'react-hot-toast';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.room_id = null;
    this.callbacks = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = 3000;
  }

  connect(room_id, token) {
    this.intentionallyDisconnected = false;
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      if (this.room_id === room_id) return;
      this.disconnect();
      this.intentionallyDisconnected = false; // Reset again after disconnect
    }

    this.room_id = room_id;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    // Extract domain and port only, removing protocol and any path (e.g. /api)
    const url = new URL(import.meta.env.VITE_API_URL);
    const domain = url.host; 
    const wsUrl = `${protocol}://${domain}/ws/chat/${room_id}/?token=${token}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log(`[WS] Connected to room: ${room_id}`);
      this.reconnectAttempts = 0;
      if (this.callbacks['onConnect']) this.callbacks['onConnect']();
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (this.callbacks['onMessage']) this.callbacks['onMessage'](data);
    };

    this.socket.onclose = (e) => {
      console.log(`[WS] Disconnected from room: ${room_id}`, e.reason);
      if (this.callbacks['onDisconnect']) this.callbacks['onDisconnect']();
      
      // Only attempt to reconnect if we didn't intentionally disconnect
      if (!this.intentionallyDisconnected && this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          console.log(`[WS] Reconnecting attempt ${this.reconnectAttempts}...`);
          this.connect(room_id, token);
        }, this.reconnectTimeout);
      } else if (!this.intentionallyDisconnected) {
        toast.error("Lost connection to chat server.");
      }
    };

    this.socket.onerror = (err) => {
      console.error('[WS] Socket error:', err);
      this.socket.close();
    };
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('[WS] Socket not open. Message not sent:', data);
    }
  }

  disconnect() {
    this.intentionallyDisconnected = true;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.room_id = null;
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }
}

const instance = new WebSocketService();
export default instance;
