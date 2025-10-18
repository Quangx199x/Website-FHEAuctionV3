// src/components/WalletConnect.tsx
import { useWallet } from '../hooks/useWallet'
import './WalletConnect.css'

export function WalletConnect() {
  const {
    isConnected,
    balance,
    chain,
    isConnecting,
    isLoadingBalance,
    isWrongNetwork,
    connect,
    disconnect,
    switchToSepolia,
    formatAddress,
  } = useWallet()

  return (
    <div className="terminal-box">
      <div className="terminal-title">&gt; INIT WALLET SERVICE &amp; FHE SDK</div>
      
      <div className="info-row">
        <span className="info-label">[STATUS] Wallet:</span>
        <span className="info-value">
          <span className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnecting ? 'CONNECTING...' : isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </span>
      </div>

      <div className="info-row">
        <span className="info-label">[ADDRESS]</span>
        <span className="info-value">{formatAddress()}</span>
      </div>

      <div className="info-row">
        <span className="info-label">[BALANCE]</span>
        <span className="info-value">
          {isLoadingBalance ? 'Loading...' : `${balance} ETH`}
        </span>
      </div>

      <div className="info-row">
        <span className="info-label">[NETWORK] Current:</span>
        <span className="info-value">
          {isConnected ? (
            <>
              {chain?.name || 'Unknown'} ({chain?.id || '?'})
              {isWrongNetwork && (
                <span className="status-badge disconnected wrong-network-badge">
                  WRONG NETWORK
                </span>
              )}
            </>
          ) : (
            'Not Connected'
          )}
        </span>
      </div>

      <div className="info-row">
        <span className="info-label">[NETWORK] Target:</span>
        <span className="info-value">Sepolia (11155111)</span>
      </div>

      <div className="info-row">
        <span className="info-label">[FHE SDK]</span>
        <span className="info-value">
          {isConnected && !isWrongNetwork ? (
            <span className="ready-status">Ready ✓</span>
          ) : isWrongNetwork ? (
            <span className="error-status">Wrong Network ✗</span>
          ) : (
            'Waiting for wallet...'
          )}
        </span>
      </div>

      <div className="wallet-buttons">
        {!isConnected ? (
          <button 
            className="btn" 
            onClick={connect}
            disabled={isConnecting}
          >
            {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
          </button>
        ) : isWrongNetwork ? (
          <button 
            className="btn" 
            onClick={switchToSepolia}
          >
            SWITCH TO SEPOLIA
          </button>
        ) : (
          <button className="btn btn-danger" onClick={disconnect}>
            DISCONNECT
          </button>
        )}
      </div>

      {!isConnected && !isConnecting && (
        <div className="metamask-warning">
          ⚠️ Make sure you have MetaMask installed
        </div>
      )}
    </div>
  )
}