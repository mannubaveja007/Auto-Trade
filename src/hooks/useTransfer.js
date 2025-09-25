import { useCallback } from 'react';
import { createTransferMessage, createECDSAMessageSigner } from '@erc7824/nitrolite';
import { webSocketService } from '../lib/websocket';

export const useTransfer = (sessionKey, isAuthenticated) => {
    const handleTransfer = useCallback(
        async (recipient, amount, asset = 'usdc') => {
            if (!isAuthenticated || !sessionKey) {
                return { success: false, error: 'Please authenticate first' };
            }

            try {
                const sessionSigner = createECDSAMessageSigner(sessionKey.privateKey);

                const transferPayload = await createTransferMessage(sessionSigner, {
                    destination: recipient,
                    allocations: [
                        {
                            asset: asset.toLowerCase(),
                            amount: amount,
                        }
                    ],
                });

                console.log('Sending transfer request...');
                webSocketService.send(transferPayload);

                return { success: true };
            } catch (error) {
                console.error('Failed to create transfer:', error);
                const errorMsg = error instanceof Error ? error.message : 'Failed to create transfer';
                return { success: false, error: errorMsg };
            }
        },
        [sessionKey, isAuthenticated]
    );

    return { handleTransfer };
};