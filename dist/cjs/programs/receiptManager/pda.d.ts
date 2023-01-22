import { PublicKey } from "@solana/web3.js";
/**
 * Finds the reward receipt manager id.
 * @returns
 */
export declare const findReceiptManagerId: (stakePoolId: PublicKey, name: string) => PublicKey;
/**
 * Finds the reward receipt manager id.
 * @returns
 */
export declare const findReceiptEntryId: (stakeEntry: PublicKey) => PublicKey;
/**
 * Finds the reward receipt id.
 * @returns
 */
export declare const findRewardReceiptId: (receiptManager: PublicKey, receiptEntry: PublicKey) => PublicKey;
//# sourceMappingURL=pda.d.ts.map