import type { BN } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { AccountMeta, Connection, PublicKey } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import type { GroupRewardDistributorMetadataKind, GroupRewardDistributorPoolKind } from "./constants";
import { GroupRewardDistributorKind } from "./constants";
export declare const initGroupRewardDistributor: (connection: Connection, wallet: Wallet, params: {
    rewardAmount: BN;
    rewardDurationSeconds: BN;
    rewardKind: GroupRewardDistributorKind;
    metadataKind: GroupRewardDistributorMetadataKind;
    poolKind: GroupRewardDistributorPoolKind;
    authorizedPools: PublicKey[];
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
    rewardMintId: PublicKey;
}) => Promise<[Transaction, PublicKey]>;
export declare const initGroupRewardCounter: (connection: Connection, wallet: Wallet, params: {
    groupRewardCounterId: PublicKey;
    groupRewardDistributorId: PublicKey;
    authority?: PublicKey;
}) => Promise<Transaction>;
export declare const initGroupRewardEntry: (connection: Connection, wallet: Wallet, params: {
    groupEntryId: PublicKey;
    groupRewardDistributorId: PublicKey;
    groupRewardEntryId: PublicKey;
    groupRewardCounterId: PublicKey;
    authority?: PublicKey;
    stakeEntries: {
        stakeEntryId: PublicKey;
        originalMint: PublicKey;
        originalMintMetadata: PublicKey;
        rewardEntryId: PublicKey;
    }[];
}) => Promise<Transaction>;
export declare const claimGroupRewards: (connection: Connection, wallet: Wallet, params: {
    groupEntryId: PublicKey;
    groupRewardEntryId: PublicKey;
    groupRewardDistributorId: PublicKey;
    groupRewardCounterId: PublicKey;
    rewardMintId: PublicKey;
    userRewardMintTokenAccount: PublicKey;
    remainingAccountsForKind: AccountMeta[];
    authority?: PublicKey;
}) => Promise<Transaction>;
export declare const closeGroupRewardDistributor: (connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
    rewardMintId: PublicKey;
    remainingAccountsForKind: AccountMeta[];
}) => Promise<Transaction>;
export declare const updateGroupRewardEntry: (connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
    groupRewardEntryId: PublicKey;
    multiplier: BN;
}) => Promise<Transaction>;
export declare const closeGroupRewardEntry: (connection: Connection, wallet: Wallet, params: {
    groupEntryId: PublicKey;
    groupRewardEntryId: PublicKey;
    groupRewardDistributorId: PublicKey;
    groupRewardCounterId: PublicKey;
}) => Promise<Transaction>;
export declare const closeGroupRewardCounter: (connection: Connection, wallet: Wallet, params: {
    groupRewardCounterId: PublicKey;
    groupRewardDistributorId: PublicKey;
    authority?: PublicKey;
}) => Promise<Transaction>;
export declare const updateGroupRewardDistributor: (connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
    rewardAmount: BN;
    rewardDurationSeconds: BN;
    metadataKind: GroupRewardDistributorMetadataKind;
    poolKind: GroupRewardDistributorPoolKind;
    authorizedPools: PublicKey[];
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
export declare const reclaimGroupFunds: (connection: Connection, wallet: Wallet, params: {
    groupRewardDistributorId: PublicKey;
    groupRewardDistributorTokenAccountId: PublicKey;
    authorityTokenAccountId: PublicKey;
    authority: PublicKey;
    amount: BN;
}) => Promise<Transaction>;
//# sourceMappingURL=instruction.d.ts.map