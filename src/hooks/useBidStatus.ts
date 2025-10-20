// src/hooks/useBidStatus.ts
import { useReadContract } from 'wagmi'
import { AUCTION_ABI } from '../contracts/auctionABI'
import { AUCTION_CONTRACT_ADDRESS } from '../contracts/addresses'
import { sepolia } from 'wagmi/chains'
import { useWallet } from './useWallet'

// Thêm _ prefix để đánh dấu không dùng
export function useBidStatus(_roundId: number) {  // ← THÊM _ 
  const { address } = useWallet()

  const { data: bidderInfo, isLoading, refetch } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'getBidderInfo',
    args: address ? [address] : undefined,
    chainId: sepolia.id,
  })

  const info = bidderInfo ? {
    deposit: (bidderInfo as readonly [bigint, boolean, boolean])[0],
    hasBidded: (bidderInfo as readonly [bigint, boolean, boolean])[1],
    cancelled: (bidderInfo as readonly [bigint, boolean, boolean])[2],
  } : null

  return {
    hasBid: info?.hasBidded || false,
    isValid: info ? (info.deposit > BigInt(0) && !info.cancelled) : false,
    isCancelled: info?.cancelled || false,
    deposit: info?.deposit || BigInt(0),
    isLoading,
    refetch,
  }
}