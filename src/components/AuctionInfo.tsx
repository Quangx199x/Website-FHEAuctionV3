// src/components/AuctionInfo.tsx
import { useWallet } from '../hooks/useWallet'
import { useAuction } from '../hooks/useAuction'
import { useBidStatus } from '../hooks/useBidStatus'
import './AuctionInfo.css'

export function AuctionInfo() {
  const { isConnected, isWrongNetwork } = useWallet()
  const {
    currentRound,
    currentBlock,
    auction,
    auctionState,
    blocksRemaining,
    timeRemaining,
    progressPercentage,
    isLoading,
  } = useAuction()

  // GỌI VỚI currentRound
  const { hasBid, isValid, isCancelled } = useBidStatus(currentRound)

  const getStateBadge = () => {
  switch (auctionState) {
    case 'ACTIVE':
      return <span className="status-badge connected">ACTIVE</span>
    case 'ENDED':
      return <span className="status-badge disconnected">ENDED</span>
    case 'FINALIZED':
      return <span className="status-badge disconnected">FINALIZED</span>
    case 'IDLE':
      return <span className="status-badge">IDLE</span>  // ← Đây
    case 'EMERGENCY':
      return <span className="status-badge disconnected">EMERGENCY</span>
    default:
      return <span className="status-badge">LOADING...</span>
  }
}

  return (
    <div className="terminal-box">
      <div className="terminal-title">&gt; AUCTION DATA FEED (FHE PROTECTED)</div>

      {!isConnected && (
        <div className="warning-not-connected">
          ⚠️ Please connect your wallet to view auction data
        </div>
      )}

      {isConnected && isWrongNetwork && (
        <div className="warning-not-connected">
          ⚠️ Please switch to Sepolia network
        </div>
      )}

      <div className="auction-grid">
        <div>
          <div className="info-row">
            <span className="info-label">[ROUND]</span>
            <span className="info-value">
              {isLoading ? '...' : `#${currentRound}`}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">[STATE]</span>
            <span className="info-value">
              {getStateBadge()}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">[CURRENT BLOCK]</span>
            <span className="info-value">
              {isLoading ? '...' : currentBlock.toLocaleString()}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">[END BLOCK]</span>
            <span className="info-value">
              {isLoading ? '...' : auction?.endBlock.toLocaleString() || '0'}
            </span>
          </div>
        </div>

        <div>
          <div className="info-row">
            <span className="info-label">[VALID BIDDERS]</span>
            <span className="info-value">
              {isLoading ? '...' : `${auction?.validBiddersCount || 0} / ${auction?.maxBidders || 50}`}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">[CURRENT LEADER]</span>
            <span className="info-value">
              {isLoading ? '...' : auction?.currentLeader === '0x0000000000000000000000000000000000000000' 
                ? 'None' 
                : `${auction?.currentLeader.slice(0, 6)}...${auction?.currentLeader.slice(-4)}`}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">[WINNING BID]</span>
            <span className="info-value">
              ???
              <span className="encrypted-badge">
                🔒 ENCRYPTED
              </span>
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">[MIN INCREMENT]</span>
            <span className="info-value">
              {isLoading ? '...' : auction ? `${Number(auction.minIncrement) / 1e18} ETH` : '0.000000001 ETH'}
            </span>
          </div>
        </div>
      </div>

      {isConnected && !isWrongNetwork && (
        <div className="info-row bid-status-box">
          <span className="info-label">[YOUR BID STATUS]</span>
          <span className="info-value">
            {hasBid ? (
              <>
                Submitted {isValid && '✓'}
                {!isValid && !isCancelled && <span className="status-badge disconnected">Invalid</span>}
                {isCancelled && <span className="status-badge disconnected">Cancelled</span>}
              </>
            ) : (
              'No bid yet'
            )}
          </span>
        </div>
      )}

      <div className="countdown-section">
        <div className="info-label countdown-label">
          [TIME REMAINING]
        </div>
        <div className="glow countdown-display">
          {isLoading ? '--:--:--' : timeRemaining}
        </div>

       <div className="progress-bar-container">
  <div 
    className="progress-bar-dynamic" 
    style={{ width: `${progressPercentage}%` }}
  />
</div>
        
        <div className="blocks-remaining">
          {blocksRemaining} blocks remaining
        </div>
      </div>

      <div className="info-row estimated-end">
        <span className="info-label">[END BLOCK]</span>
        <span className="info-value">
          {isLoading ? '...' : auction?.endBlock.toLocaleString() || 'N/A'}
        </span>
      </div>
    </div>
  )
}