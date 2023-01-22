import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
/**
 * Finds the reward entry id.
 * @returns
 */
export declare const findRewardEntryId: (rewardDistributorId: PublicKey, stakeEntryId: PublicKey) => PublicKey;
/**
 * Finds the reward distributor id.
 * @returns
 */
export declare const findRewardDistributorId: (stakePoolId: PublicKey, id: BN) => PublicKey;
/**
 * Finds the reward distributor id.
 * @returns
 */
export declare const findRewardAuthority: (authority: PublicKey) => PublicKey;
//# sourceMappingURL=pda.d.ts.map