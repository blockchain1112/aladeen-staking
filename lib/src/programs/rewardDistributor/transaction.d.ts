import type { web3 } from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { RewardDistributorKind } from "./constants";
export declare const withInitRewardDistributor: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    distributorId: BN;
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    rewardAmount?: BN;
    rewardDurationSeconds?: BN;
    kind?: RewardDistributorKind;
    maxSupply?: BN;
    supply?: BN;
    defaultMultiplier?: BN;
    multiplierDecimals?: number;
    maxRewardSecondsReceived?: BN;
    stakePoolDuration: number;
}) => Promise<[Transaction, web3.PublicKey]>;
export declare const withInitRewardEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakeEntryId: PublicKey;
    rewardDistributorId: PublicKey;
}) => Promise<[Transaction, PublicKey]>;
export declare const withClaimRewards: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    distributorId: BN;
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    lastStaker: PublicKey;
    payer?: PublicKey;
    skipRewardMintTokenAccount?: boolean;
    authority?: PublicKey;
    stakePoolDuration: number;
}) => Promise<Transaction>;
export declare const withCloseRewardDistributor: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    distributorId: BN;
    stakePoolId: PublicKey;
    stakePoolDuration: number;
}) => Promise<Transaction>;
export declare const withUpdateRewardEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakePoolId: PublicKey;
    rewardDistributorId: PublicKey;
    stakeEntryId: PublicKey;
    multiplier: BN;
}) => Promise<Transaction>;
export declare const withCloseRewardEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    distributorId: BN;
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    stakePoolDuration: number;
}) => Promise<Transaction>;
export declare const withUpdateRewardDistributor: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    distributorId: BN;
    stakePoolId: PublicKey;
    defaultMultiplier?: BN;
    multiplierDecimals?: number;
    rewardAmount?: BN;
    rewardDurationSeconds?: BN;
    maxRewardSecondsReceived?: BN;
    stakePoolDuration: number;
}) => Promise<Transaction>;
export declare const withReclaimFunds: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    distributorId: BN;
    stakePoolId: PublicKey;
    amount: BN;
    stakePoolDuration: number;
}) => Promise<Transaction>;
//# sourceMappingURL=transaction.d.ts.map