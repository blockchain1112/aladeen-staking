import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
/**
 * Finds the stake pool id.
 * @returns
 */
export declare const findStakePoolId: (identifier: BN) => PublicKey;
/**
 * Convenience method to find the stake entry id.
 * @returns
 */
export declare const findStakeEntryId: (wallet: PublicKey, stakePoolId: PublicKey, originalMintId: PublicKey, isFungible: boolean) => PublicKey;
/**
 * Finds the identifier id.
 * @returns
 */
export declare const findIdentifierId: () => PublicKey;
/**
 * Find stake authorization id.
 * @returns
 */
export declare const findStakeAuthorizationId: (stakePoolId: PublicKey, mintId: PublicKey) => PublicKey;
/**
 * Find stake booster id.
 * @returns
 */
export declare const findStakeBoosterId: (stakePoolId: PublicKey, identifier?: BN) => PublicKey;
/**
 * Convenience method to find the stake entry id.
 * @returns
 */
export declare const findGroupEntryId: (id: PublicKey) => PublicKey;
//# sourceMappingURL=pda.d.ts.map