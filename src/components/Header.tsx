// src/components/Header.tsx
import './Header.css'

export function Header() {
  return (
    <header className="terminal-box header-box">
      <div className="header-container">
        <div>
          <h1 className="glow header-title">
            ZAMA
          </h1>
        </div>

        <div>
          <h1 className="glow header-title">
            [SYSTEM ONLINE] FHE AUCTION V3 $
          </h1>
        </div>

        <div className="header-social">
          <a 
            href="https://x.com/Quangx199x" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn"
          >
            𝕏
          </a>
          <a 
            href="https://github.com/Quangx199x" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn"
          >
            ⌘
          </a>
        </div>
      </div>
    </header>
  )
}