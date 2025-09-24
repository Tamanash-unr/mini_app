import { useCallback } from 'react';
import { createTransferMessage, createECDSAMessageSigner } from '@erc7824/nitrolite';
import { webSocketService } from '../lib/websocketSimple';

/**
 * Custom hook for handling P2P transfers
 * Based on the reference implementation pattern
 */
export const useTransfer = (sessionKey, isAuthenticated) => {
  const handleTransfer = useCallback(
    async (recipient, amount, asset = 'usdc') => {
      console.log('🚀 Initiating transfer:', { recipient, amount, asset });
      
      if (!isAuthenticated || !sessionKey) {
        const error = 'Please authenticate first';
        console.error('❌ Transfer failed:', error);
        return { success: false, error };
      }

      try {
        // Create session signer using the session key's private key
        const sessionSigner = createECDSAMessageSigner(sessionKey.privateKey);

        // Create the transfer message
        const transferPayload = await createTransferMessage(sessionSigner, {
          destination: recipient,
          allocations: [
            {
              asset: asset.toLowerCase(),
              amount: amount,
            }
          ],
        });

        console.log('📤 Sending transfer request...');
        webSocketService.send(transferPayload);
        
        return { success: true };
      } catch (error) {
        console.error('❌ Failed to create transfer:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to create transfer';
        return { success: false, error: errorMsg };
      }
    },
    [sessionKey, isAuthenticated]
  );

  const handleSponsorPost = useCallback(
    async (authorAddress, amount = '1') => {
      console.log('💝 Sponsoring author:', authorAddress, 'with', amount, 'USDC');
      return await handleTransfer(authorAddress, amount, 'usdc');
    },
    [handleTransfer]
  );

  return { 
    handleTransfer, 
    handleSponsorPost 
  };
};

export default useTransfer;
