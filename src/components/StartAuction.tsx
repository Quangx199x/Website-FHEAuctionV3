// src/components/StartAuction.tsx
import { useWallet } from '../hooks/useWallet'
import { useReadContract } from 'wagmi'
import { AUCTION_ABI } from '../contracts/auctionABI'
import { AUCTION_CONTRACT_ADDRESS } from '../contracts/addresses'
import { sepolia } from 'wagmi/chains'

export function StartAuction() {
  const { address, isConnected } = useWallet()

  // Read owner
  const { data: ownerAddress } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'owner',
    chainId: sepolia.id,
  })

  // Read auction state
  const { data: currentState } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'auctionState',
    chainId: sepolia.id,
  })

  // Check if user is owner
  const isOwner = address && ownerAddress && 
    address.toLowerCase() === (ownerAddress as string).toLowerCase()

  const stateString = Number(currentState) === 1 ? 'ACTIVE' : 'IDLE'
  const isAuctionActive = Number(currentState) === 1

  // Don't show if not owner
  if (!isOwner) return null

  return (
    <div className="terminal-box">
      <div className="terminal-title">&gt; AUCTION CONTROL PANEL [OWNER ONLY]</div>

      <div className="info-row">
        <span className="info-label">[AUTHORIZATION]</span>
        <span className="info-value">
          <span className="status-badge connected">OWNER VERIFIED ✓</span>
        </span>
      </div>

      <div className="info-row">
        <span className="info-label">[CURRENT STATE]</span>
        <span className="info-value">
          <span className={`status-badge ${isAuctionActive ? 'connected' : 'disconnected'}`}>
            {stateString}
          </span>
        </span>
      </div>

      <div className="fhe-info-box" style={{ marginTop: '15px' }}>
        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
          ℹ️ AUCTION INFO:
        </div>
        <div>• This contract auto-starts auctions</div>
        <div>• No manual start function available</div>
        <div>• Auction runs continuously in rounds</div>
        <div>• Use Etherscan to interact with admin functions if needed</div>
      </div>

      <a 
        href={`https://sepolia.etherscan.io/address/${AUCTION_CONTRACT_ADDRESS}#writeContract`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn submit-btn-full"
        style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none', marginTop: '15px' }}
      >
        🔗 MANAGE ON ETHERSCAN
      </a>
    </div>
  )
}