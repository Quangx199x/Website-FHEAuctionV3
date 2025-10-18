// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmi'
import App from './App.tsx'
import './index.css'
import './styles/terminal.css'

// Tạo QueryClient cho React Query
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Wrap app với WagmiProvider */}
    <WagmiProvider config={config}>
      {/* Wrap với QueryClientProvider */}
      <QueryClientProvider client={queryClient}>
        <App />
     </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)