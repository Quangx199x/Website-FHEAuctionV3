// src/components/OwnerPanel.tsx
import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useAuction } from '../hooks/useAuction'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AUCTION_ABI } from '../contracts/auctionABI'
import { AUCTION_CONTRACT_ADDRESS } from '../contracts/addresses'
import { sepolia } from 'wagmi/chains'
import { parseEther } from 'viem'

export function OwnerPanel() {
  const { address, isConnected } = useWallet()
  const { auctionState, refetch } = useAuction()
  const [action, setAction] = useState<string>('')
  const [isStarting, setIsStarting] = useState(false)

  // Read owner
  const { data: ownerAddress } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'owner',
    chainId: sepolia.id,
  })

  // Read paused state
  const { data: isPaused } = useReadContract({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'paused',
    chainId: sepolia.id,
  })

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const isOwner = address && ownerAddress && 
    address.toLowerCase() === (ownerAddress as string).toLowerCase()

  if (!isOwner) return null

  const handleAction = (functionName: string) => {
    setAction(functionName)
    
    if (functionName === 'emergencyEnd') {
      const reason = prompt('Enter emergency reason:')
      if (!reason) return
      
      writeContract({
        address: AUCTION_CONTRACT_ADDRESS,
        abi: AUCTION_ABI,
        functionName: 'emergencyEnd',
        args: [reason],
      })
    } else {
      writeContract({
        address: AUCTION_CONTRACT_ADDRESS,
        abi: AUCTION_ABI,
        functionName: functionName as any,
      })
    }
  }

    if (isSuccess && action) {
    if (action === 'startAuction') {
      alert('✅ Auction started! First bid placed.')
      setIsStarting(false)
      setTimeout(() => refetch(), 2000)
    } else {
      alert(`✅ ${action} executed!`)
    }
    setAction('')
  }

  const paused = isPaused as boolean

  return (
    <div className="terminal-box">
      <div className="terminal-title">&gt; OWNER CONTROL PANEL</div>

      <div className="info-row">
        <span className="info-label">[AUTHORIZATION]</span>
        <span className="info-value">
          <span className="status-badge connected">OWNER ✓</span>
        </span>
      </div>

      <div className="info-row">
        <span className="info-label">[AUCTION STATE]</span>
        <span className="info-value">{auctionState}</span>
      </div>

      <div className="info-row">
        <span className="info-label">[PAUSED]</span>
        <span className="info-value">{paused ? 'YES' : 'NO'}</span>
      </div>

     
      {/* Pause/Unpause */}
      <div style={{ marginTop: '15px' }}>
        <button
          onClick={() => handleAction(paused ? 'unpauseAuction' : 'pauseAuction')}
          className="btn submit-btn-full"
          disabled={isConfirming}
          style={{ marginBottom: '10px' }}
        >
          {paused ? '▶️ UNPAUSE AUCTION' : '⏸️ PAUSE AUCTION'}
        </button>
      </div>

      {/* Emergency Actions */}
      {auctionState === 'ACTIVE' && (
        <button
          onClick={() => handleAction('emergencyEnd')}
          className="btn btn-danger submit-btn-full"
          disabled={isConfirming}
          style={{ marginBottom: '10px' }}
        >
          🚨 EMERGENCY END
        </button>
      )}

      {/* Force Finalize */}
      {auctionState === 'ENDED' && (
        <button
          onClick={() => handleAction('forceFinalize')}
          className="btn submit-btn-full"
          disabled={isConfirming}
          style={{ marginBottom: '10px' }}
        >
          ⚡ FORCE FINALIZE
        </button>
      )}

      {/* Withdraw Fees */}
      <button
        onClick={() => handleAction('withdrawPlatformFees')}
        className="btn submit-btn-full"
        disabled={isConfirming}
      >
        💰 WITHDRAW PLATFORM FEES
      </button>

      {/* Etherscan Link */}
      <a 
        href={`https://sepolia.etherscan.io/address/${AUCTION_CONTRACT_ADDRESS}#writeContract`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn submit-btn-full"
        style={{ 
          display: 'inline-block', 
          textAlign: 'center', 
          textDecoration: 'none', 
          marginTop: '15px',
          background: 'transparent'
        }}
      >
        🔗 ADVANCED (ETHERSCAN)
      </a>
    </div>
  )
}