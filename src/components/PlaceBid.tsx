// src/components/PlaceBid.tsx
import { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useAuction } from '../hooks/useAuction'
import { useWriteContract, useWaitForTransactionReceipt, useWalletClient } from 'wagmi' // ✅ Thêm useWalletClient
import { AUCTION_ABI } from '../contracts/auctionABI'
import { AUCTION_CONTRACT_ADDRESS } from '../contracts/addresses'
import { parseEther } from 'viem'
import { initializeFheRelayer, encryptBidWithRelayer } from '../services/fheRelayer'
import './PlaceBid.css'

export function PlaceBid() {
  const { isConnected, isWrongNetwork, address } = useWallet()
  const { currentRound, auction, auctionState, auctionStateRaw, refetch } = useAuction()
  
  // ✅ Thêm walletClient để sign
  const { data: walletClient } = useWalletClient()
  
  const [bidAmount, setBidAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [encryptionProgress, setEncryptionProgress] = useState('')

  const { writeContract, data: hash } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setEncryptionProgress('')
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount')
      return
    }

    if (!address) {
      setError('Wallet not connected')
      return
    }

    if (!walletClient) {
      setError('Wallet client not available')
      return
    }

    if (auctionStateRaw !== 0) {
      setError(`Cannot bid: Auction is ${auctionState}`)
      return
    }

    setIsSubmitting(true)
    setIsEncrypting(true)
    
    try {
      const bidWei = parseEther(bidAmount)
      console.log('💰 Placing bid:', bidAmount, 'ETH')
      console.log('📊 Wei:', bidWei.toString())

      // Step 1: Initialize Relayer
      setEncryptionProgress('Initializing FHE Relayer...')
      console.log('[Bid] Step 1/5: Initializing...')
      
      await initializeFheRelayer()
      console.log('[Bid] ✓ Initialized')

      // Step 2: Encrypt via Relayer
      setEncryptionProgress('Encrypting bid via Relayer...')
      console.log('[Bid] Step 2/5: Encrypting...')
      
      const encryptedData = await encryptBidWithRelayer(
        bidWei,
        AUCTION_CONTRACT_ADDRESS,
        address
      )
      
      console.log('[Bid] ✓ Encrypted')
      setIsEncrypting(false)

      // Step 3: Extract data
      setEncryptionProgress('Preparing transaction...')
      console.log('[Bid] Step 3/5: Extracting data...')
      
      const handles = encryptedData.handles || []
      const proof = encryptedData.inputProof || new Uint8Array()
      
      if (handles.length === 0) {
        throw new Error('No encrypted handles')
      }

      // Convert to hex
      const toHex = (bytes: Uint8Array): `0x${string}` => {
        return `0x${Array.from(bytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')}` as `0x${string}`
      }

      const encryptedBid = toHex(handles[0])
      const inputProof = toHex(proof)

      console.log('[Bid] ✓ Encrypted bid:', encryptedBid.slice(0, 20) + '...')
      console.log('[Bid] ✓ Proof length:', inputProof.length)

      // ✅ Step 4: Generate EIP-712 Signature
      setEncryptionProgress('Signing EIP-712 message...')
      console.log('[Bid] Step 4/5: Generating signature...')
      
      const domain = {
        name: 'FHEAuction',
        version: '3',
        chainId: 11155111,
        verifyingContract: AUCTION_CONTRACT_ADDRESS,
      } as const

      const types = {
        PublicKey: [{ name: 'key', type: 'bytes32' }],
      } as const

      const message = {
        key: encryptedBid, // ✅ Dùng encrypted bid làm publicKey
      } as const

      console.log('[Bid] Signing message:', message)

      const signature = await walletClient.signTypedData({
        account: address,
        domain,
        types,
        primaryType: 'PublicKey',
        message,
      })

      console.log('[Bid] ✓ Signature:', signature.slice(0, 20) + '...')

      // ✅ Step 5: Submit with REAL signature
      setEncryptionProgress('Submitting...')
      console.log('[Bid] Step 5/5: Submitting...')
      
      writeContract({
        address: AUCTION_CONTRACT_ADDRESS,
        abi: AUCTION_ABI,
        functionName: 'bid',
        args: [
          encryptedBid,    // ✅ encrypted bid
          inputProof,      // ✅ proof
          encryptedBid,    // ✅ publicKey = encrypted bid
          signature,       // ✅ REAL EIP-712 signature
        ],
        value: bidWei,
        gas: 800000n,
      })

      console.log('[Bid] ✓ Transaction submitted!')

    } catch (error) {
      console.error('[Bid] ❌ Error:', error)
      setError((error as Error).message || 'Failed to place bid')
    } finally {
      setIsSubmitting(false)
      setIsEncrypting(false)
      setEncryptionProgress('')
    }
  }

  useEffect(() => {
    if (isSuccess && isSubmitting) {
      console.log('🎉 Success!')
      alert('🎉 Bid placed successfully!')
      setBidAmount('')
      setError(null)
      setTimeout(() => refetch(), 2000)
    }
  }, [isSuccess, isSubmitting, refetch])

  const isAuctionActive = auctionStateRaw === 0
  const isDisabled = !isConnected || isWrongNetwork || !isAuctionActive || isSubmitting || isConfirming

  return (
    <div className="terminal-box">
      <div className="terminal-title">&gt; PLACE BID (FHE RELAYER)</div>

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
              <span className="ready-status">✅ ACTIVE</span>
            ) : (
              <span className="error-status">❌ {auctionState}</span>
            )}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">[ENCRYPTION]</span>
          <span className="info-value">
            {isEncrypting ? (
              <span className="blink">🔐 ENCRYPTING...</span>
            ) : (
              <span className="ready-status">✓ RELAYER</span>
            )}
          </span>
        </div>

        {encryptionProgress && (
          <div className="encryption-progress-box">
            <span className="blink">⏳</span> {encryptionProgress}
          </div>
        )}

        {error && (
          <div className="warning-box">
            ❌ {error}
          </div>
        )}

        {!isConnected && (
          <div className="warning-box">⚠️ Connect wallet</div>
        )}

        {isConnected && isWrongNetwork && (
          <div className="warning-box">⚠️ Switch to Sepolia</div>
        )}

        {isConnected && !isWrongNetwork && !isAuctionActive && (
          <div className="warning-box">
            ⚠️ Auction is {auctionState}
          </div>
        )}

        <button type="submit" className="btn submit-btn-full" disabled={isDisabled}>
          {isEncrypting ? (
            <>🔐 ENCRYPTING<span className="blink">...</span></>
          ) : isSubmitting ? (
            <>📡 SUBMITTING<span className="blink">...</span></>
          ) : isConfirming ? (
            <>⏳ CONFIRMING<span className="blink">...</span></>
          ) : (
            '🔒 PLACE ENCRYPTED BID'
          )}
        </button>

        <div className="fhe-info-box">
          🚀 <strong>Zama FHE Relayer SDK v0.2.0</strong>
          <br />
          🔐 Encryption via Zama Relayer API
          <br />
          ⚡ No WASM - Works everywhere!
          <br />
          🔒 100% Privacy guaranteed
          <br />
          ✍️ EIP-712 Signature Verification
        </div>
      </form>
    </div>
  )
}