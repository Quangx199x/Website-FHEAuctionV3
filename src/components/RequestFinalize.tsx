// src/components/RequestFinalize.tsx
import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useAuction } from '../hooks/useAuction'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AUCTION_ABI } from '../contracts/auctionABI'
import { AUCTION_CONTRACT_ADDRESS } from '../contracts/addresses'

export function RequestFinalize() {
  const { isConnected, isWrongNetwork } = useWallet()
  const { auctionState } = useAuction()
  const [isRequesting, setIsRequesting] = useState(false)

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleRequest = () => {
    if (!isConnected || isWrongNetwork) return

    setIsRequesting(true)
    
    writeContract({
      address: AUCTION_CONTRACT_ADDRESS,
      abi: AUCTION_ABI,
      functionName: 'requestFinalize',
    })
  }

  if (isSuccess && isRequesting) {
    setIsRequesting(false)
    alert('✅ Finalization requested!')
  }

  // Only show when auction ENDED
  if (auctionState !== 'ENDED') return null

  const isDisabled = !isConnected || isWrongNetwork || isRequesting || isConfirming

  return (
    <div className="terminal-box">
      <div className="terminal-title">&gt; FINALIZE AUCTION</div>
      
      <div className="info-row">
        <span className="info-label">[STATUS]</span>
        <span className="info-value">Auction ended - awaiting finalization</span>
      </div>

      <div className="info-row">
        <span className="info-label">[ACTION]</span>
        <span className="info-value">Request decryption and finalization</span>
      </div>

      <button
        onClick={handleRequest}
        className="btn submit-btn-full"
        disabled={isDisabled}
      >
        {isRequesting || isConfirming ? '⏳ REQUESTING...' : '🏁 REQUEST FINALIZATION'}
      </button>

      <div className="fhe-info-box">
        🔓 This will trigger FHE decryption to determine the winner.
        <br />
        The decryption process is handled by the KMS network.
      </div>
    </div>
  )
}