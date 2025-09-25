import { createAuthVerifyMessageWithJWT, parseRPCResponse, RPCMethod } from '@erc7824/nitrolite';
import { ethers } from 'ethers';

// After WebSocket connection is established
ws.onopen = async () => {
  console.log('WebSocket connection established');
  
  // Create and send auth_verify with JWT for reconnection
  // Get the stored JWT token
  const jwtToken = window.localStorage.getItem('clearnode_jwt');

  const authRequestMsg = await createAuthVerifyMessageWithJWT(
    jwtToken, // JWT token for reconnection
  );
  
  ws.send(authRequestMsg);
};

// Handle incoming messages
ws.onmessage = async (event) => {
  try {
    const message = parseRPCResponse(event.data);
    
      // Handle auth_success or auth_failure
    switch (message.method) {
      case RPCMethod.AuthVerify:
        if (message.params.success) {
          console.log('Authentication successful');
          // Now you can start using the channel
        }
        break;
      case RPCMethod.Error:
        console.error('Authentication failed:', message.params.error);
        break;
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
};