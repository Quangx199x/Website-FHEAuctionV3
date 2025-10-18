// src/components/CancelBid.tsx
import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useAuction } from '../hooks/useAuction'
import { useBidStatus } from '../hooks/useBidStatus'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AUCTION_ABI } from '../contracts/auctionABI'
import { AUCTION_CONTRACT_ADDRESS } from '../contracts/addresses'

export function CancelBid() {
  const { isConnected, isWrongNetwork } = useWallet()
  const { currentRound, auctionState } = useAuction()  // ← LẤY currentRound
  const { hasBid, isCancelled } = useBidStatus(currentRound)  // ← TRUYỀN currentRound
  
  const [isCancelling, setIsCancelling] = useState(false)

  const { writeContract, data: hash } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleCancel = async () => {
    if (!isConnected || isWrongNetwork || !hasBid || isCancelled) return

    try {
      setIsCancelling(true)
      
      writeContract({
        address: AUCTION_CONTRACT_ADDRESS,
        abi: AUCTION_ABI,
        functionName: 'cancelBid',
      })
    } catch (error) {
      console.error('Error cancelling bid:', error)
      alert('Failed to cancel bid')
      setIsCancelling(false)
    }
  }

  if (isSuccess && isCancelling) {
    setIsCancelling(false)
    alert('Bid cancelled successfully!')
  }

  if (!hasBid || isCancelled) return null

  if (auctionState === 'ENDED' || auctionState === 'FINALIZED') {
    return (
      <div className="terminal-box">
        <div className="terminal-title">&gt; CANCEL BID</div>
        <div className="warning-box">
          Cannot cancel bid after auction has ended
        </div>
      </div>
    )
  }

  const isDisabled = !isConnected || isWrongNetwork || isCancelling || isConfirming

  return (
    <div className="terminal-box">
      <div className="terminal-title">&gt; CANCEL BID</div>
      
      <div className="info-row">
        <span className="info-label">[STATUS]</span>
        <span className="info-value">
          {isCancelling || isConfirming ? 'Cancelling...' : 'Ready to cancel'}
        </span>
      </div>

      <div className="info-row">
        <span className="info-label">[ACTION]</span>
        <span className="info-value">
          Cancel your bid and get refund
        </span>
      </div>

      <button
        onClick={handleCancel}
        className="btn btn-danger submit-btn-full"
        disabled={isDisabled}
      >
        {isCancelling || isConfirming ? 'CANCELLING...' : 'CANCEL MY BID'}
      </button>

      <div className="fhe-info-box">
        ⚠️ You can cancel your bid before the auction ends. Your deposit will be refunded.
      </div>
    </div>
  )
}