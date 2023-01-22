import type { BN } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";
export declare const withInitReceiptManager: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    name: string;
    stakePoolId: PublicKey;
    authority: PublicKey;
    requiredStakeSeconds: BN;
    stakeSecondsToUse: BN;
    paymentMint: PublicKey;
    paymentManagerId?: PublicKey;
    paymentRecipientId: PublicKey;
    requiresAuthorization: boolean;
    maxClaimedReceipts?: BN;
}) => Promise<[Transaction, PublicKey]>;
export declare const withInitReceiptEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    stakeEntryId: PublicKey;
}) => Promise<[Transaction, PublicKey]>;
export declare const withInitRewardReceipt: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    receiptManagerId: PublicKey;
    receiptEntryId: PublicKey;
    stakeEntryId: PublicKey;
    payer?: PublicKey;
}) => Promise<[Transaction, PublicKey]>;
export declare const withUpdateReceiptManager: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    name: string;
    stakePoolId: PublicKey;
    authority: PublicKey;
    requiredStakeSeconds: BN;
    stakeSecondsToUse: BN;
    paymentMint: PublicKey;
    paymentManagerId?: PublicKey;
    paymentRecipientId: PublicKey;
    requiresAuthorization: boolean;
    maxClaimedReceipts?: BN;
}) => Promise<[Transaction, PublicKey]>;
export declare const withClaimRewardReceipt: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    receiptManagerName: string;
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    claimer: PublicKey;
    payer: PublicKey;
}) => Promise<[Transaction, PublicKey]>;
export declare const withCloseReceiptManager: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    receiptManagerId: PublicKey;
}) => Promise<Transaction>;
export declare const withCloseReceiptEntry: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    receiptManagerId: PublicKey;
    receiptEntryId: PublicKey;
    stakeEntryId: PublicKey;
}) => Promise<Transaction>;
export declare const withCloseRewardReceipt: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    receiptManagerId: PublicKey;
    rewardReceiptId: PublicKey;
}) => Promise<Transaction>;
export declare const withSetRewardReceiptAllowed: (transaction: Transaction, connection: Connection, wallet: Wallet, params: {
    receiptManagerId: PublicKey;
    rewardReceiptId: PublicKey;
    auth: boolean;
}) => Promise<Transaction>;
//# sourceMappingURL=transaction.d.ts.map