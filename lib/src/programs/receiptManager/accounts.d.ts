import type { AccountData } from "@cardinal/common";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { ReceiptEntryData, ReceiptManagerData, RewardReceiptData } from "./constants";
export declare const getReceiptManager: (connection: Connection, receiptManagerId: PublicKey) => Promise<AccountData<ReceiptManagerData>>;
export declare const getAllreceiptManagers: (connection: Connection) => Promise<AccountData<ReceiptManagerData>[]>;
export declare const getReceiptManagersForPool: (connection: Connection, stakePoolId: PublicKey) => Promise<AccountData<RewardReceiptData>[]>;
export declare const getReceiptEntry: (connection: Connection, receiptEntryId: PublicKey) => Promise<AccountData<ReceiptEntryData>>;
export declare const getRewardReceipt: (connection: Connection, rewardReceiptId: PublicKey) => Promise<AccountData<RewardReceiptData>>;
export declare const getAllRewardReceipts: (connection: Connection) => Promise<AccountData<ReceiptManagerData>[]>;
export declare const getRewardReceiptsForManager: (connection: Connection, rewardDistributorId: PublicKey) => Promise<AccountData<RewardReceiptData>[]>;
export declare const getClaimableRewardReceiptsForManager: (connection: Connection, receiptManagerId: PublicKey) => Promise<AccountData<RewardReceiptData>[]>;
export declare const getAllOfType: <T>(connection: Connection, key: string) => Promise<AccountData<T>[]>;
//# sourceMappingURL=accounts.d.ts.map