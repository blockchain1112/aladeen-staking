import { Program } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { ConfirmOptions, Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { ParsedIdlAccountData } from "../../accounts";
import * as RECEIPT_MANAGER_TYPES from "../../idl/cardinal_receipt_manager";
export declare const RECEIPT_MANAGER_ADDRESS: PublicKey;
export declare const RECEIPT_MANAGER_SEED = "receipt-manager";
export declare const REWARD_RECEIPT_SEED = "reward-receipt";
export declare const RECEIPT_ENTRY_SEED = "receipt-entry";
export type RECEIPT_MANAGER_PROGRAM = RECEIPT_MANAGER_TYPES.CardinalReceiptManager;
export declare const RECEIPT_MANAGER_IDL: RECEIPT_MANAGER_TYPES.CardinalReceiptManager;
export type ReceiptManagerData = ParsedIdlAccountData<"receiptManager", RECEIPT_MANAGER_PROGRAM>;
export type RewardReceiptData = ParsedIdlAccountData<"rewardReceipt", RECEIPT_MANAGER_PROGRAM>;
export type ReceiptEntryData = ParsedIdlAccountData<"receiptEntry", RECEIPT_MANAGER_PROGRAM>;
export declare const RECEIPT_MANAGER_PAYMENT_MANAGER_NAME = "cardinal-receipt-manager";
export declare const RECEIPT_MANAGER_PAYMENT_MANAGER: PublicKey;
export declare const receiptManagerProgram: (connection: Connection, wallet?: Wallet, confirmOptions?: ConfirmOptions) => Program<RECEIPT_MANAGER_TYPES.CardinalReceiptManager>;
//# sourceMappingURL=constants.d.ts.map