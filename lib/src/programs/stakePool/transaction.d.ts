import { BN } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import { ReceiptType } from "./constants";
/**
 * Add init pool identifier instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @returns Transaction, public key for the created pool identifier
 */
export declare const withInitPoolIdentifier: (transaction: Transaction, connection: Connection, wallet: Wallet) => Promise<[Transaction, PublicKey]>;
export declare const withInitStakePool: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    requiresCollections?: PublicKey[];
    requiresCreators?: PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
    resetOnStake?: boolean;
    cooldownSeconds?: number;
    minStakeSeconds?: number[];
    endDate?: BN;
    doubleOrResetEnabled?: boolean;
    taxMint: PublicKey;
}) => Promise<[Transaction, PublicKey]>;
/**
 * Add init stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created stake entry
 */
export declare const withInitStakeEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
}) => Promise<[Transaction, PublicKey]>;
/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export declare const withAuthorizeStakeEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
}) => Promise<Transaction>;
/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export declare const withDeauthorizeStakeEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
}) => Promise<Transaction>;
/**
 * Add init stake mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, keypair of the created stake mint
 */
export declare const withInitStakeMint: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    stakeMintKeypair: Keypair;
    name: string;
    symbol: string;
}) => Promise<[Transaction, Keypair]>;
/**
 * Add claim receipt mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export declare const withClaimReceiptMint: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    receiptMintId: PublicKey;
    receiptType: ReceiptType;
}) => Promise<Transaction>;
/**
 * Add stake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export declare const withStake: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    userOriginalMintTokenAccountId: PublicKey;
    amount?: BN;
    duration: number;
}) => Promise<Transaction>;
/**
 * Add unstake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export declare const withUnstake: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    distributorIds: BN[];
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    skipRewardMintTokenAccount?: boolean;
}) => Promise<Transaction>;
export declare const withUpdateStakePool: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
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
}) => Promise<[Transaction, PublicKey]>;
export declare const withUpdateTotalStakeSeconds: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakeEntryId: PublicKey;
    lastStaker: PublicKey;
}) => Promise<Transaction>;
export declare const withReturnReceiptMint: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakeEntryId: PublicKey;
}) => Promise<Transaction>;
export declare const withCloseStakePool: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
}) => Promise<Transaction>;
export declare const withCloseStakeEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
}) => Promise<Transaction>;
export declare const withReassignStakeEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    target: PublicKey;
}) => Promise<Transaction>;
export declare const withDoubleOrResetTotalStakeSeconds: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
}) => Promise<Transaction>;
export declare const withInitStakeBooster: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeBoosterIdentifier?: BN;
    paymentAmount: BN;
    paymentMint: PublicKey;
    boostSeconds: BN;
    startTimeSeconds: number;
    payer?: PublicKey;
}) => Promise<Transaction>;
export declare const withUpdateStakeBooster: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeBoosterIdentifier?: BN;
    paymentAmount: BN;
    paymentMint: PublicKey;
    boostSeconds: BN;
    startTimeSeconds: number;
}) => Promise<Transaction>;
export declare const withCloseStakeBooster: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeBoosterIdentifier?: BN;
}) => Promise<Transaction>;
export declare const withBoostStakeEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    stakeBoosterIdentifier?: BN;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    payerTokenAccount: PublicKey;
    payer?: PublicKey;
    secondsToBoost: BN;
}) => Promise<Transaction>;
/**
 * Add init group stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
export declare const withInitGroupStakeEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    groupCooldownSeconds?: number;
    groupStakeSeconds?: number;
}) => Promise<[Transaction, PublicKey]>;
/**
 * Add a stake entry to the group entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
export declare const withAddToGroupEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    groupEntryId: PublicKey;
    stakeEntryId: PublicKey;
    payer?: PublicKey;
}) => Promise<[Transaction]>;
/**
 * Remove stake entry from the group entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
export declare const withRemoveFromGroupEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    groupEntryId: PublicKey;
    stakeEntryId: PublicKey;
}) => Promise<[Transaction]>;
/**
 * Add init ungrouping instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
export declare const withInitUngrouping: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    groupEntryId: PublicKey;
}) => Promise<[Transaction]>;
export declare const withClaimStakeEntryFunds: (transaction: Transaction, connection: Connection, wallet: Wallet, stakeEntryId: PublicKey, fundsMintId: PublicKey) => Promise<[Transaction]>;
//# sourceMappingURL=transaction.d.ts.map