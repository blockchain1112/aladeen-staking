import { BN } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { AccountMeta, Connection, PublicKey, Transaction } from "@solana/web3.js";
export declare const remainingAccountsForInitStakeEntry: (stakePoolId: PublicKey, originalMintId: PublicKey) => AccountMeta[];
export declare const withRemainingAccountsForUnstake: (transaction: Transaction, connection: Connection, wallet: Wallet, stakeEntryId: PublicKey, receiptMint: PublicKey | null | undefined) => Promise<AccountMeta[]>;
/**
 * Convenience method to find the stake entry id from a mint
 * NOTE: This will lookup the mint on-chain to get the supply
 * @returns
 */
export declare const findStakeEntryIdFromMint: (connection: Connection, wallet: PublicKey, stakePoolId: PublicKey, originalMintId: PublicKey, isFungible?: boolean) => Promise<PublicKey>;
export declare const getTotalStakeSeconds: (connection: Connection, stakeEntryId: PublicKey) => Promise<BN>;
export declare const getActiveStakeSeconds: (connection: Connection, stakeEntryId: PublicKey) => Promise<BN>;
export declare const getUnclaimedRewards: (connection: Connection, stakePoolId: PublicKey, distributorId: BN) => Promise<BN>;
export declare const getClaimedRewards: (connection: Connection, stakePoolId: PublicKey, distributorId: BN) => Promise<BN>;
//# sourceMappingURL=utils.d.ts.map