// src/config/wagmi.ts
import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Cấu hình wagmi
export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(), // MetaMask, Coinbase Wallet, etc.
  ],
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/ci_d4rRtnL_AgHtbKMESHvOsNVhokEVX'), // RPC public của Sepolia
  },
})

// Export để dùng ở nơi khác
export const CHAIN_ID = sepolia.id
export const CHAIN_NAME = sepolia.name