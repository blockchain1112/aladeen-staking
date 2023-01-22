import type { web3 } from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { GroupRewardDistributorKind, GroupRewardDistributorMetadataKind, GroupRewardDistributorPoolKind } from "./constants";
export declare const withInitGroupRewardDistributor: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
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
}) => Promise<[Transaction, web3.PublicKey]>;
export declare const withInitGroupRewardEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
    groupEntryId: PublicKey;
    stakeEntries: {
        stakeEntryId: PublicKey;
        originalMint: PublicKey;
        rewardDistributorId: PublicKey;
    }[];
}) => Promise<[Transaction, PublicKey]>;
export declare const withClaimGroupRewards: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
    groupEntryId: PublicKey;
    skipGroupRewardMintTokenAccount?: boolean;
}) => Promise<Transaction>;
export declare const withCloseGroupRewardDistributor: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
}) => Promise<Transaction>;
export declare const withUpdateGroupRewardEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
    groupRewardEntryId: PublicKey;
    multiplier: BN;
}) => Promise<Transaction>;
export declare const withCloseGroupRewardEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
    groupEntryId: PublicKey;
}) => Promise<Transaction>;
export declare const withUpdateGroupRewardDistributor: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
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
export declare const withReclaimGroupFunds: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
    amount: BN;
}) => Promise<Transaction>;
export declare const withCloseGroupRewardCounter: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
    groupEntryId: PublicKey;
    stakeEntries: {
        stakeEntryId: PublicKey;
        originalMint: PublicKey;
    }[];
}) => Promise<[Transaction]>;
//# sourceMappingURL=transaction.d.ts.map