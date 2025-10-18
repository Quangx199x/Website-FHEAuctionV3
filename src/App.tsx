// src/App.tsx
import { Header } from './components/Header'
import { WalletConnect } from './components/WalletConnect'
import { AuctionInfo } from './components/AuctionInfo'
import { PlaceBid } from './components/PlaceBid'
import { CancelBid } from './components/CancelBid'
import { OwnerPanel } from './components/OwnerPanel'
import { RequestFinalize } from './components/RequestFinalize'
import { ViewWinners } from './components/ViewWinners'
import { ClaimRefund } from './components/ClaimRefund'
import { DebugPanel } from './components/DebugPanel'
import { AUCTION_CONTRACT_ADDRESS } from './contracts/addresses'
import './App.css'

function App() {
  return (
    <>
      <div className="scanline"></div>

      <div className="app-container">
        <Header />
        <WalletConnect />
        
        {/* Debug Panel - only in dev */}
        <DebugPanel />
        
        <AuctionInfo />
        <PlaceBid />
        <CancelBid />
        <RequestFinalize />
        <ViewWinners />
        <ClaimRefund />
        <OwnerPanel />

        <footer className="app-footer">
          <div className="footer-status">
            [SYSTEM STATUS] OPERATIONAL
          </div>
          <div>
            Powered by{' '}
            <a href="https://www.zama.ai/" target="_blank" rel="noopener noreferrer" className="footer-link">
              Zama FHE
            </a>
            {' '}| Contract: {AUCTION_CONTRACT_ADDRESS.slice(0, 6)}...{AUCTION_CONTRACT_ADDRESS.slice(-4)} | Network: Sepolia
          </div>
          <div className="footer-copyright">
            © 2024 FHE Auction. All bids are encrypted end-to-end.
          </div>
        </footer>
      </div>
    </>
  )
}

export default App