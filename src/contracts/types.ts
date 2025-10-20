// src/contracts/types.ts

/**
 * Auction State Enum
 * Khớp với contract FHEAuction
 * 
 * State 0 = ACTIVE: Auction đang nhận bids
 * State 1 = ENDED: Auction đã hết hạn, chờ finalize
 * State 2 = FINALIZING: Đang decrypt và finalize
 * State 3 = FINALIZED: Auction đã hoàn thành
 * State 4 = EMERGENCY: Emergency mode
 */
export enum AuctionState {
  ACTIVE = 0,
  ENDED = 1,
  FINALIZING = 2,
  FINALIZED = 3,
  EMERGENCY = 4,
}

/**
 * Bidder Information Structure
 */
export interface BidderInfo {
  deposit: bigint
  hasBidded: boolean
  cancelled: boolean
}

/**
 * Encrypted Bid Data
 * Used for FHE encryption
 */
export interface EncryptedBidData {
  encryptedBid: Uint8Array
  inputProof: Uint8Array
  handles: Uint8Array[]
}