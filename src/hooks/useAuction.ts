// src/hooks/useAuction.ts
import { useReadContract, useBlockNumber } from 'wagmi'
import { AUCTION_ABI } from '../contracts/auctionABI'
import { AUCTION_CONTRACT_ADDRESS } from '../contracts/addresses'
import { sepolia } from 'wagmi/chains'
import { useEffect, useState } from 'react'

export function useAuction() {
  const { data: currentRound, isLoading: isLoadingRound } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'currentRound',
    chainId: sepolia.id,
  })

  const { data: auctionEndBlock } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'auctionEndBlock',
    chainId: sepolia.id,
  })

  const { data: estimatedEndTime } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'getEstimatedEndTime',
    chainId: sepolia.id,
  })

  const { data: auctionState, refetch: refetchState } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'auctionState',
    chainId: sepolia.id,
  })

  const { data: leadBidder } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'currentLeadBidder',
    chainId: sepolia.id,
  })

  const { data: minDeposit } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'minBidDeposit',
    chainId: sepolia.id,
  })

  const { data: minIncrement } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'MIN_BID_INCREMENT',
    chainId: sepolia.id,
  })

  const { data: maxBidders } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'MAX_BIDDERS_PER_ROUND',
    chainId: sepolia.id,
  })

  const { data: roundBidders, refetch: refetchBidders } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'getRoundBidders',
    chainId: sepolia.id,
  })

  const { data: currentBlock } = useBlockNumber({
    chainId: sepolia.id,
    watch: true,
  })

  const [timeRemaining, setTimeRemaining] = useState('--:--:--')

  // DEBUG: Log auction state
  useEffect(() => {
    if (auctionState !== undefined) {
      console.log('🔍 Auction State Raw:', auctionState)
      console.log('🔍 Auction State Number:', Number(auctionState))
      console.log('🔍 Auction State String:', getStateString())
    }
  }, [auctionState])

  useEffect(() => {
    if (!estimatedEndTime) return

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000)
      const endTime = Number(estimatedEndTime)
      const remaining = endTime - now

      if (remaining <= 0) {
        setTimeRemaining('00:00:00')
        return
      }

      const hours = Math.floor(remaining / 3600)
      const minutes = Math.floor((remaining % 3600) / 60)
      const seconds = remaining % 60

      setTimeRemaining(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [estimatedEndTime])

  const getStateString = () => {
  if (auctionState === undefined) return 'LOADING'
  
  const stateNum = Number(auctionState)
  console.log('🎯 State Number:', stateNum)
  
  // FIXED: Mapping đúng 100% theo contract
  switch (stateNum) {
    case 0: return 'ACTIVE'      // Đang nhận bids
    case 1: return 'ENDED'       // Đã hết hạn
    case 2: return 'FINALIZING'  // Đang decrypt
    case 3: return 'FINALIZED'   // Hoàn thành
    case 4: return 'EMERGENCY'   // Emergency
    default: return 'UNKNOWN'
  }
}

  const blocksRemaining = () => {
    if (!auctionEndBlock || !currentBlock) return 0
    
    const endBlock = Number(auctionEndBlock)
    const current = Number(currentBlock)
    const remaining = endBlock - current
    
    return remaining > 0 ? remaining : 0
  }

  const progressPercentage = () => {
    if (!estimatedEndTime) return 0
    
    const now = Math.floor(Date.now() / 1000)
    const endTime = Number(estimatedEndTime)
    
    const duration = 3600
    const startTime = endTime - duration
    const elapsed = now - startTime
    const percentage = (elapsed / duration) * 100
    
    return Math.min(Math.max(percentage, 0), 100)
  }

 const auction = {
  startBlock: auctionEndBlock ? Number(auctionEndBlock) - 300 : 0,
  endBlock: auctionEndBlock ? Number(auctionEndBlock) : 0,
  minIncrement: minIncrement || BigInt(0),  // ← SỬA: bỏ fallback minDeposit
  maxBidders: maxBidders ? Number(maxBidders) : 50,
  validBiddersCount: roundBidders ? (roundBidders as readonly string[]).length : 0,
  currentLeader: leadBidder as string || '0x0000000000000000000000000000000000000000',
  isFinalized: Number(auctionState) === 3,  // State 3 = FINALIZED
}

  return {
    currentRound: currentRound ? Number(currentRound) : 0,
    currentBlock: currentBlock ? Number(currentBlock) : 0,
    auction,
    auctionState: getStateString(),
    auctionStateRaw: Number(auctionState), // Thêm raw state
    blocksRemaining: blocksRemaining(),
    timeRemaining,
    progressPercentage: progressPercentage(),
    isLoading: isLoadingRound,
    refetch: () => {
      refetchState()
      refetchBidders()
    },
  }
}