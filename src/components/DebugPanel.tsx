// src/components/DebugPanel.tsx
import { useWallet } from '../hooks/useWallet'
import { useAuction } from '../hooks/useAuction'
import { useReadContract } from 'wagmi'
import { AUCTION_ABI } from '../contracts/auctionABI'
import { AUCTION_CONTRACT_ADDRESS } from '../contracts/addresses'
import { sepolia } from 'wagmi/chains'

export function DebugPanel() {
  const { address, isConnected, chain } = useWallet()
  const { auctionState, auctionStateRaw, currentRound } = useAuction()

  // Read raw state directly
  const { data: rawState } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'auctionState',
    chainId: sepolia.id,
  })

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="terminal-box" style={{ background: 'rgba(255, 255, 0, 0.1)' }}>
      <div className="terminal-title">&gt; DEBUG PANEL</div>

      <div className="info-row">
        <span className="info-label">[WALLET]</span>
        <span className="info-value">{address || 'Not connected'}</span>
      </div>

      <div className="info-row">
        <span className="info-label">[CHAIN ID]</span>
        <span className="info-value">{chain?.id || 'N/A'}</span>
      </div>

      <div className="info-row">
        <span className="info-label">[CONNECTED]</span>
        <span className="info-value">{isConnected ? 'Yes' : 'No'}</span>
      </div>

      <div className="info-row">
        <span className="info-label">[ROUND]</span>
        <span className="info-value">{currentRound}</span>
      </div>

      <div className="info-row">
        <span className="info-label">[STATE RAW]</span>
        <span className="info-value">{String(rawState)}</span>
      </div>

      <div className="info-row">
        <span className="info-label">[STATE PARSED]</span>
        <span className="info-value">{auctionState} ({auctionStateRaw})</span>
      </div>

      <div className="info-row">
        <span className="info-label">[CONTRACT]</span>
        <span className="info-value" style={{ fontSize: '10px' }}>
          {AUCTION_CONTRACT_ADDRESS}
        </span>
      </div>

      <button 
        onClick={() => window.location.reload()}
        className="btn submit-btn-full"
        style={{ marginTop: '10px' }}
      >
        🔄 RELOAD PAGE
      </button>
    </div>
  )
}