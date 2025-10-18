// src/components/PlaceBid.tsx
import { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useAuction } from '../hooks/useAuction'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AUCTION_ABI } from '../contracts/auctionABI'
import { AUCTION_CONTRACT_ADDRESS } from '../contracts/addresses'
import { parseEther } from 'viem'
import './PlaceBid.css'

export function PlaceBid() {
  const { isConnected, isWrongNetwork } = useWallet()
  const { currentRound, auction, auctionState, auctionStateRaw, refetch } = useAuction()
  
  const [bidAmount, setBidAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { writeContract, data: hash } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Debug log
  useEffect(() => {
    console.log('📊 PlaceBid Component State:')
    console.log('  - auctionState:', auctionState)
    console.log('  - auctionStateRaw:', auctionStateRaw)
    console.log('  - isConnected:', isConnected)
    console.log('  - isWrongNetwork:', isWrongNetwork)
  }, [auctionState, auctionStateRaw, isConnected, isWrongNetwork])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Please enter a valid bid amount')
      return
    }

    // Check state again
    if (auctionStateRaw !== 1) {
      alert(`Cannot bid: Auction state is ${auctionState} (${auctionStateRaw})`)
      return
    }

    setIsSubmitting(true)
    
    try {
      const bidWei = parseEther(bidAmount)
      
      console.log('💰 Placing bid:', bidAmount, 'ETH')
      console.log('📊 Wei:', bidWei.toString())
      
      const dummyEncrypted = ('0x' + '00'.repeat(32)) as `0x${string}`
      const dummyProof = '0x' as `0x${string}`
      const dummyPublicKey = ('0x' + '00'.repeat(32)) as `0x${string}`
      const dummySignature = '0x' as `0x${string}`
      
      console.log('📤 Submitting to contract...')
      
      writeContract({
        address: AUCTION_CONTRACT_ADDRESS,
        abi: AUCTION_ABI,
        functionName: 'bid',
        args: [dummyEncrypted, dummyProof, dummyPublicKey, dummySignature],
        value: bidWei,
      })
      
    } catch (error) {
      console.error('❌ Error:', error)
      alert('Failed: ' + (error as Error).message)
      setIsSubmitting(false)
    }
  }

  if (isSuccess && isSubmitting) {
    setIsSubmitting(false)
    console.log('🎉 Bid placed successfully!')
    alert('🎉 Bid placed!')
    setBidAmount('')
    // Refetch data
    setTimeout(() => refetch(), 2000)
  }

  // Check if auction is truly active (state = 1)
  const isAuctionActive = auctionStateRaw === 1
  const isDisabled = !isConnected || isWrongNetwork || !isAuctionActive || isSubmitting || isConfirming

  return (
    <div className="terminal-box">
      <div className="terminal-title">&gt; PLACE BID</div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>[BID AMOUNT] (ETH)</label>
          <input
            type="number"
            step="0.001"
            min="0"
            placeholder="0.0"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            disabled={isDisabled}
          />
        </div>

        <div className="info-row">
          <span className="info-label">[MIN DEPOSIT]</span>
          <span className="info-value">
            {auction && auction.minIncrement > BigInt(0) 
              ? `${Number(auction.minIncrement) / 1e18} ETH` 
              : 'Loading...'}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">[ROUND]</span>
          <span className="info-value">#{currentRound}</span>
        </div>

        <div className="info-row">
          <span className="info-label">[STATE]</span>
          <span className="info-value">
            {isAuctionActive ? (
              <span className="ready-status">✅ ACTIVE (Ready to bid)</span>
            ) : (
              <span className="error-status">❌ {auctionState} (State: {auctionStateRaw})</span>
            )}
          </span>
        </div>

        {/* Warnings */}
        {!isConnected && (
          <div className="warning-box">⚠️ Connect wallet to place bid</div>
        )}

        {isConnected && isWrongNetwork && (
          <div className="warning-box">⚠️ Switch to Sepolia network</div>
        )}

        {isConnected && !isWrongNetwork && !isAuctionActive && (
          <div className="warning-box">
            ⚠️ Auction is {auctionState} (State code: {auctionStateRaw}). 
            {auctionStateRaw === 0 && ' Auction not started yet.'}
            {auctionStateRaw === 2 && ' Auction has ended.'}
            {auctionStateRaw === 3 && ' Auction finalized.'}
          </div>
        )}

        <button type="submit" className="btn submit-btn-full" disabled={isDisabled}>
          {isSubmitting ? '⏳ SUBMITTING...' : isConfirming ? '⏳ CONFIRMING...' : 'PLACE BID'}
        </button>

        <div className="fhe-info-box">
          💰 Your bid will be submitted to the contract with your deposit.
          <br />
          Debug: State={auctionStateRaw}, Active={isAuctionActive ? 'Yes' : 'No'}
        </div>
      </form>
    </div>
  )
}