import {
  createAuthRequestMessage,
  createAuthVerifyMessage,
  parseRPCResponse,
  RPCMethod,
} from '@erc7824/nitrolite';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageHandlers = new Set();
    this.isAuthenticated = false;
    this.isAuthenticating = false;
    this.signer = null;
  }

  connect(url = 'wss://clearnet-sandbox.yellow.com/ws') {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        console.log('Attempting to connect to WebSocket:', url);
        this.ws = new WebSocket(url);

        const connectionTimeout = setTimeout(() => {
          console.error('WebSocket connection timeout');
          this.ws.close();
          reject(new Error('Connection timeout'));
        }, 5000);

        this.ws.onopen = (event) => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket connected to Yellow Network');
          this.reconnectAttempts = 0;
          resolve(event);
        };

        this.ws.onmessage = (event) => this.handleMessage(event);

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('WebSocket error:', error);
          this.isAuthenticated = false;
          this.isAuthenticating = false;
          reject(error);
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket connection closed:', event);
          this.isAuthenticated = false;
          this.isAuthenticating = false;
          this.handleReconnect();
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  async handleMessage(event) {
    try {
      const message = parseRPCResponse(event.data);
      console.log('WebSocket message received:', message);

      switch (message.method) {
        case RPCMethod.AuthChallenge:
          if (this.isAuthenticating && this.signer) {
            console.log('Received auth challenge, signing...');
            const challenge = message.params.challenge;
            const authVerifyMsg = await createAuthVerifyMessage(this.signer, challenge);
            this.send(authVerifyMsg);
          }
          break;
        case RPCMethod.AuthVerify:
          if (message.params.success) {
            console.log('Authentication successful');
            this.isAuthenticated = true;
            this.isAuthenticating = false;
            // Store the JWT for future reconnections
            if (message.params.jwt) {
              window.localStorage.setItem('clearnode_jwt', message.params.jwt);
            }
          } else {
            console.error('Authentication failed:', message.params.error);
            this.isAuthenticating = false;
          }
          break;
        case RPCMethod.Error:
          console.error('Received error from server:', message.params.error);
          this.isAuthenticating = false;
          break;
        default:
          // Handle other messages by notifying handlers
          this.messageHandlers.forEach(handler => {
            try {
              handler(message);
            } catch (error) {
              console.error('Error in message handler:', error);
            }
          });
      }
    } catch (error) {
      console.error('Error parsing or handling WebSocket message:', error);
    }
  }

  async authenticate(signer) {
    if (!signer) {
      console.error('Signer is required for authentication');
      return;
    }
    this.signer = signer;
    this.isAuthenticating = true;
    this.isAuthenticated = false;

    try {
      const signerAddress = await signer.getAddress();
      const authRequestMsg = await createAuthRequestMessage(signerAddress);
      this.send(authRequestMsg);
      console.log('Authentication request sent');
    } catch (error) {
      console.error('Error creating auth request message:', error);
      this.isAuthenticating = false;
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        this.connect().then(() => {
          // If we have a signer, re-authenticate
          if (this.signer) {
            this.authenticate(this.signer);
          }
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      console.log('Sending WebSocket message:', message);
      this.ws.send(message);
      return true;
    } else {
      console.error('WebSocket not connected, cannot send message');
      return false;
    }
  }

  addMessageHandler(handler) {
    if (typeof handler === 'function') {
      this.messageHandlers.add(handler);
    }
  }

  removeMessageHandler(handler) {
    this.messageHandlers.delete(handler);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
    this.isAuthenticated = false;
    this.isAuthenticating = false;
    this.signer = null;
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();