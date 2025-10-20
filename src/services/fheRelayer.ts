// src/services/fheRelayer.ts
import { 
  initSDK, 
  createInstance, 
  SepoliaConfig 
} from '@zama-fhe/relayer-sdk/bundle'

let fhevmInstance: any = null
let isSDKInitialized = false

// Initialize SDK (chỉ 1 lần)
export async function initializeFheRelayer() {
  try {
    // Step 1: Load WASM (chỉ cần 1 lần)
    if (!isSDKInitialized) {
      console.log('[FHE SDK] 🚀 Loading WASM...')
      await initSDK()
      isSDKInitialized = true
      console.log('[FHE SDK] ✅ WASM loaded!')
    }

    // Step 2: Create instance nếu chưa có
    if (!fhevmInstance && window.ethereum) {
      console.log('[FHE Instance] 🔧 Creating instance...')
      
      const config = { 
        ...SepoliaConfig, 
        network: window.ethereum 
      }
      
      fhevmInstance = await createInstance(config)
      console.log('[FHE Instance] ✅ Ready!')
    }

    return fhevmInstance
  } catch (error) {
    console.error('[FHE Relayer] ❌ Error:', error)
    throw error
  }
}

// Encrypt bid amount
export async function encryptBidWithRelayer(
  bidAmount: bigint,
  contractAddress: string,
  userAddress: string
) {
  if (!fhevmInstance) {
    throw new Error('FHE not initialized. Call initializeFheRelayer() first!')
  }

  try {
    console.log('[FHE Encrypt] 🔐 Encrypting:', bidAmount.toString())
    
    const input = fhevmInstance.createEncryptedInput(
      contractAddress, 
      userAddress
    )
    input.add64(bidAmount)
    const encryptedData = await input.encrypt()
    
    console.log('[FHE Encrypt] ✅ Encrypted!')
    return encryptedData
  } catch (error) {
    console.error('[FHE Encrypt] ❌ Error:', error)
    throw error
  }
}

export function getFheInstance() {
  return fhevmInstance
}

export function resetFheInstance() {
  fhevmInstance = null
  isSDKInitialized = false
}