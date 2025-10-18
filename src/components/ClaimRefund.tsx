// src/components/ClaimRefund.tsx
import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AUCTION_ABI } from '../contracts/auctionABI'
import { AUCTION_CONTRACT_ADDRESS } from '../contracts/addresses'
import { sepolia } from 'wagmi/chains'
import { formatEther } from 'viem'

export function ClaimRefund() {
  const { address, isConnected, isWrongNetwork } = useWallet()
  const [isClaiming, setIsClaiming] = useState(false)

  // Read pending refund
  const { data: refundAmount } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'pendingRefunds',
    args: address ? [address] : undefined,
    chainId: sepolia.id,
  })

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleClaim = () => {
    if (!isConnected || isWrongNetwork) return

    setIsClaiming(true)
    
    writeContract({
      address: AUCTION_CONTRACT_ADDRESS,
      abi: AUCTION_ABI,
      functionName: 'claimRefund',
    })
  }

  if (isSuccess && isClaiming) {
    setIsClaiming(false)
    alert('✅ Refund claimed!')
  }

  const refundAmountBigInt = refundAmount as bigint | undefined
  const hasRefund = refundAmountBigInt && refundAmountBigInt > BigInt(0)

  // Only show if has refund
  if (!hasRefund) return null

  const isDisabled = !isConnected || isWrongNetwork || isClaiming || isConfirming

  return (
    <div className="terminal-box">
      <div className="terminal-title">&gt; CLAIM REFUND</div>
      
      <div className="info-row">
        <span className="info-label">[REFUND AMOUNT]</span>
        <span className="info-value">
          {refundAmountBigInt ? formatEther(refundAmountBigInt) : '0'} ETH
        </span>
      </div>

      <div className="info-row">
        <span className="info-label">[STATUS]</span>
        <span className="info-value ready-status">✅ Available</span>
      </div>

      <button
        onClick={handleClaim}
        className="btn submit-btn-full"
        disabled={isDisabled}
      >
        {isClaiming || isConfirming ? '⏳ CLAIMING...' : '💰 CLAIM REFUND'}
      </button>

      <div className="fhe-info-box">
        💸 Claim your refund from cancelled or invalid bids.
      </div>
    </div>
  )
}