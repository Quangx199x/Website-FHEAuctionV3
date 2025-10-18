// src/components/ViewWinners.tsx
import { useWallet } from '../hooks/useWallet'
import { useAuction } from '../hooks/useAuction'
import { useReadContract } from 'wagmi'
import { AUCTION_ABI } from '../contracts/auctionABI'
import { AUCTION_CONTRACT_ADDRESS } from '../contracts/addresses'
import { sepolia } from 'wagmi/chains'
import { formatEther } from 'viem'

export function ViewWinners() {
  const { isConnected } = useWallet()
  const { currentRound, auctionState } = useAuction()

  // Read winning bid
  const { data: winningBid } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'winningBid',
    chainId: sepolia.id,
  })

  // Read current lead bidder
  const { data: leadBidder } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'currentLeadBidder',
    chainId: sepolia.id,
  })

  // Only show when finalized
  if (auctionState !== 'FINALIZED') return null

  const winningBidBigInt = winningBid as bigint | undefined
  const winner = leadBidder as string | undefined

  return (
    <div className="terminal-box">
      <div className="terminal-title">&gt; AUCTION RESULTS</div>
      
      <div className="info-row">
        <span className="info-label">[ROUND]</span>
        <span className="info-value">#{currentRound}</span>
      </div>

      <div className="info-row">
        <span className="info-label">[WINNER]</span>
        <span className="info-value">
          {winner && winner !== '0x0000000000000000000000000000000000000000'
            ? `${winner.slice(0, 6)}...${winner.slice(-4)}`
            : 'No winner'}
        </span>
      </div>

      <div className="info-row">
        <span className="info-label">[WINNING BID]</span>
        <span className="info-value">
          {winningBidBigInt && winningBidBigInt > BigInt(0)
            ? `${formatEther(winningBidBigInt)} ETH`
            : '0 ETH'}
        </span>
      </div>

      <div className="info-row">
        <span className="info-label">[STATUS]</span>
        <span className="info-value ready-status">✅ FINALIZED</span>
      </div>

      <div className="fhe-info-box">
        🏆 Auction completed! The winning bid has been decrypted.
      </div>
    </div>
  )
}