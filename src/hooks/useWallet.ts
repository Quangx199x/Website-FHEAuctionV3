// src/hooks/useWallet.ts
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'

export function useWallet() {
  // Lấy thông tin account
  const { address, isConnected, chain } = useAccount()
  
  // Connect wallet
  const { connect, connectors, isPending: isConnecting } = useConnect()
  
  // Disconnect wallet
  const { disconnect } = useDisconnect()
  
  // Switch chain
  const { switchChain } = useSwitchChain()
  
  // Lấy balance ETH
  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address: address,
    chainId: sepolia.id,
  })

  // Function connect với connector đầu tiên (MetaMask)
  const handleConnect = () => {
    const connector = connectors[0] // MetaMask
    if (connector) {
      connect({ connector })
    }
  }

  // Function disconnect
  const handleDisconnect = () => {
    disconnect()
  }

  // Function switch về Sepolia
  const handleSwitchToSepolia = () => {
    if (chain?.id !== sepolia.id) {
      switchChain({ chainId: sepolia.id })
    }
  }

  // Format address
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '0x0000...0000'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Format balance
  const formatBalance = () => {
    if (!balance) return '0.0000'
    const eth = parseFloat(balance.formatted)
    return eth.toFixed(4)
  }

  return {
    // States
    address,
    isConnected,
    chain,
    balance: formatBalance(),
    isConnecting,
    isLoadingBalance,
    isWrongNetwork: chain?.id !== sepolia.id,
    
    // Functions
    connect: handleConnect,
    disconnect: handleDisconnect,
    switchToSepolia: handleSwitchToSepolia,
    formatAddress: () => formatAddress(address),
  }
}