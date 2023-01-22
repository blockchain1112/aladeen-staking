import { BN } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { Connection, PublicKey } from "@solana/web3.js";
import { Keypair, Transaction } from "@solana/web3.js";
import type { GroupRewardDistributorKind, GroupRewardDistributorMetadataKind, GroupRewardDistributorPoolKind } from "./programs/groupRewardDistributor";
import type { RewardDistributorKind } from "./programs/rewardDistributor";
import { ReceiptType } from "./programs/stakePool";
/**
 * Convenience call to create a stake pool
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param requiresCollections - (Optional) List of required collections pubkeys
 * @param requiresCreators - (Optional) List of required creators pubkeys
 * @param requiresAuthorization - (Optional) Boolean to require authorization
 * @param overlayText - (Optional) Text to overlay on receipt mint tokens
 * @param imageUri - (Optional) Image URI for stake pool
 * @param resetOnStake - (Optional) Boolean to reset an entry's total stake seconds on unstake
 * @param cooldownSeconds - (Optional) Number of seconds for token to cool down before returned to the staker
 * @param rewardDistributor - (Optional) Parameters to creat reward distributor
 * @returns
 */
export declare const createStakePool: (connection: Connection, wallet: Wallet, params: {
    requiresCollections?: PublicKey[];
    requiresCreators?: PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
    resetOnStake?: boolean;
    cooldownSeconds?: number;
    minStakeSeconds?: number;
    endDate?: BN;
    doubleOrResetEnabled?: boolean;
    rewardDistributor?: {
        rewardMintId: PublicKey;
        rewardAmount?: BN;
        rewardDurationSeconds?: BN;
        rewardDistributorKind?: RewardDistributorKind;
        maxSupply?: BN;
        supply?: BN;
    };
}) => Promise<[Transaction, PublicKey, PublicKey?]>;
/**
 * Convenience call to create a reward distributor
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param rewardMintId - (Optional) Reward mint id
 * @param rewardAmount - (Optional) Reward amount
 * @param rewardDurationSeconds - (Optional) Reward duration in seconds
 * @param rewardDistributorKind - (Optional) Reward distributor kind Mint or Treasury
 * @param maxSupply - (Optional) Max supply
 * @param supply - (Optional) Supply
 * @returns
 */
export declare const createRewardDistributor: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    rewardAmount?: BN;
    rewardDurationSeconds?: BN;
    kind?: RewardDistributorKind;
    maxSupply?: BN;
    supply?: BN;
}) => Promise<[Transaction, PublicKey]>;
/**
 * Convenience call to create a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @param user - (Optional) User pubkey in case the person paying for the transaction and
 * stake entry owner are different
 * @returns
 */
export declare const createStakeEntry: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
}) => Promise<[Transaction, PublicKey]>;
/**
 * Convenience call to create a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
export declare const initializeRewardEntry: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    multiplier?: BN;
}) => Promise<Transaction>;
/**
 * Convenience call to authorize a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
export declare const authorizeStakeEntry: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
}) => Promise<Transaction>;
/**
 * Convenience call to create a stake entry and a stake mint
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @param amount - (Optional) Amount of tokens to be staked, defaults to 1
 * @returns
 */
export declare const createStakeEntryAndStakeMint: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    receiptName?: string;
}) => Promise<[Transaction, PublicKey, Keypair | undefined]>;
/**
 * Convenience method to claim rewards
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool id
 * @param stakeEntryId - Original mint id
 * @returns
 */
export declare const claimRewards: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    lastStaker?: PublicKey;
    payer?: PublicKey;
    skipRewardMintTokenAccount?: boolean;
}) => Promise<Transaction>;
/**
 * Convenience method to stake tokens
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool id
 * @param originalMintId - Original mint id
 * @param userOriginalMintTokenAccountId - User's original mint token account id
 * @param receiptType - (Optional) ReceiptType to be received back. If none provided, none will be claimed
 * @param user - (Optional) User pubkey in case the person paying for the transaction and
 * stake entry owner are different
 * @param amount - (Optional) Amount of tokens to be staked, defaults to 1
 * @returns
 */
export declare const stake: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    userOriginalMintTokenAccountId: PublicKey;
    receiptType?: ReceiptType;
    amount?: BN;
}) => Promise<Transaction>;
/**
 * Convenience method to unstake tokens
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
export declare const unstake: (connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    skipRewardMintTokenAccount?: boolean;
}) => Promise<Transaction>;
/**
 * Convenience call to create a group entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param params
 * stakePoolId - Stake pool ID
 * originalMintId - Original mint ID
 * user - (Optional) User pubkey in case the person paying for the transaction and
 * stake entry owner are different
 * @returns
 */
export declare const createGroupEntry: (connection: Connection, wallet: Wallet, params: {
    stakeEntryIds: PublicKey[];
    groupCooldownSeconds?: number;
    groupStakeSeconds?: number;
}) => Promise<[Transaction, PublicKey]>;
/**
 * Convenience call to create a group reward distributor
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param params
 *  rewardMintId - (Optional) Reward mint id
 *  authorizedPools - Authorized stake pool ids
 *  rewardAmount - (Optional) Reward amount
 *  rewardDurationSeconds - (Optional) Reward duration in seconds
 *  rewardKind - (Optional) Reward distributor kind Mint or Treasury
 *  poolKind - (Optional) Reward distributor pool validation kind NoRestriction, AllFromSinglePool or EachFromSeparatePool
 *  metadataKind - (Optional) Reward distributor metadata validation kind NoRestriction, UniqueNames or UniqueSymbols
 *  supply - (Optional) Supply
 *  baseAdder - (Optional) Base adder value that will be add to the calculated multiplier
 *  baseAdderDecimals - (Optional) Base adder decimals
 *  baseMultiplier - (Optional) Base multiplier value that will be multiplied by the calculated multiplier
 *  baseMultiplierDecimals - (Optional) Base multiplier decimals
 *  multiplierDecimals - (Optional) Multiplier decimals
 *  maxSupply - (Optional) Max supply
 *  minCooldownSeconds - (Optional) number;
 *  minStakeSeconds - (Optional) number;
 *  groupCountMultiplier - (Optional) Group Count Multiplier if provided will multiplied the total reward to this number and total groups that this user has
 *  groupCountMultiplierDecimals - (Optional) Group Count Multiplier decimals
 *  minGroupSize - (Optional) min group size
 *  maxRewardSecondsReceived - (Optional) max reward seconds received
 * @returns
 */
export declare const createGroupRewardDistributor: (connection: Connection, wallet: Wallet, params: {
    rewardMintId: PublicKey;
    authorizedPools: PublicKey[];
    rewardAmount?: BN;
    rewardDurationSeconds?: BN;
    rewardKind?: GroupRewardDistributorKind;
    poolKind?: GroupRewardDistributorPoolKind;
    metadataKind?: GroupRewardDistributorMetadataKind;
    supply?: BN;
    baseAdder?: BN;
    baseAdderDecimals?: number;
    baseMultiplier?: BN;
    baseMultiplierDecimals?: number;
    multiplierDecimals?: number;
    maxSupply?: BN;
    minCooldownSeconds?: number;
    minStakeSeconds?: number;
    groupCountMultiplier?: BN;
    groupCountMultiplierDecimals?: number;
    minGroupSize?: number;
    maxRewardSecondsReceived?: BN;
}) => Promise<[Transaction, PublicKey]>;
/**
 * Convenience call to update a group reward distributor
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param params
 * groupRewardDistributorId - Group reward distributor id
 * authorizedPools - Authorized stake pool ids
 * rewardAmount - (Optional) Reward amount
 * rewardDurationSeconds - (Optional) Reward duration in seconds
 * poolKind - (Optional) Reward distributor pool validation kind NoRestriction, AllFromSinglePool or EachFromSeparatePool
 * metadataKind - (Optional) Reward distributor metadata validation kind NoRestriction, UniqueNames or UniqueSymbols
 * baseAdder - (Optional) Base adder value that will be add to the calculated multiplier
 * baseAdderDecimals - (Optional) Base adder decimals
 * baseMultiplier - (Optional) Base multiplier value that will be multiplied by the calculated multiplier
 * baseMultiplierDecimals - (Optional) Base multiplier decimals
 * multiplierDecimals - (Optional) Multiplier decimals
 * maxSupply - (Optional) Max supply
 * minCooldownSeconds - (Optional) number;
 * minStakeSeconds - (Optional) number;
 * groupCountMultiplier - (Optional) Group Count Multiplier if provided will multiplied the total reward to this number and total groups that this user has
 * groupCountMultiplierDecimals - (Optional) Group Count Multiplier decimals
 * minGroupSize - (Optional) min group size
 * maxRewardSecondsReceived - (Optional) max reward seconds received
 * @returns
 */
export declare const updateGroupRewardDistributor: (connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
    authorizedPools: PublicKey[];
    rewardAmount?: BN;
    rewardDurationSeconds?: BN;
    poolKind?: GroupRewardDistributorPoolKind;
    metadataKind?: GroupRewardDistributorMetadataKind;
    baseAdder?: BN;
    baseAdderDecimals?: number;
    baseMultiplier?: BN;
    baseMultiplierDecimals?: number;
    multiplierDecimals?: number;
    maxSupply?: BN;
    minCooldownSeconds?: number;
    minStakeSeconds?: number;
    groupCountMultiplier?: BN;
    groupCountMultiplierDecimals?: number;
    minGroupSize?: number;
    maxRewardSecondsReceived?: BN;
}) => Promise<Transaction>;
/**
 * Convenience method to claim rewards
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param params
 * groupRewardDistributorId - Group reward distributor ID
 * groupEntryId - Group entry ID
 * stakeEntryIds - Stake entry IDs
 * @returns
 */
export declare const claimGroupRewards: (connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
    groupEntryId: PublicKey;
    stakeEntryIds: PublicKey[];
}) => Promise<[Transaction]>;
/**
 * Convenience method to close group stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param params
 * groupRewardDistributorId - Group reward distributor ID
 * groupEntryId - Group entry ID
 * stakeEntryIds - Stake entry IDs
 * @returns
 */
export declare const closeGroupEntry: (connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
    groupEntryId: PublicKey;
    stakeEntryIds: PublicKey[];
}) => Promise<[Transaction]>;
/**
 * Convenience method to init ungrouping
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param params
 * groupRewardDistributorId - Group reward distributor ID
 * groupEntryId - Group entry ID
 * stakeEntryIds - Stake entry IDs
 * @returns
 */
export declare const initUngrouping: (connection: Connection, wallet: Wallet, params: {
    groupEntryId: PublicKey;
}) => Promise<[Transaction]>;
//# sourceMappingURL=api.d.ts.map