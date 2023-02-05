import { tryGetAccount, withFindOrInitAssociatedTokenAccount, } from "@cardinal/common";
import { PAYMENT_MANAGER_ADDRESS } from "@cardinal/payment-manager";
import { getPaymentManager } from "@cardinal/payment-manager/dist/cjs/accounts";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import { withUpdateTotalStakeSeconds } from "../stakePool/transaction";
import { getReceiptManager } from "./accounts";
import { RECEIPT_MANAGER_PAYMENT_MANAGER, receiptManagerProgram, } from "./constants";
import { findReceiptEntryId, findReceiptManagerId, findRewardReceiptId, } from "./pda";
export const withInitReceiptManager = async (transaction, connection, wallet, params) => {
    var _a;
    const receiptManagerId = findReceiptManagerId(params.stakePoolId, params.name);
    const program = receiptManagerProgram(connection, wallet);
    const ix = await program.methods
        .initReceiptManager({
        name: params.name,
        authority: params.authority,
        requiredStakeSeconds: params.requiredStakeSeconds,
        stakeSecondsToUse: params.stakeSecondsToUse,
        paymentMint: params.paymentMint,
        paymentManager: params.paymentManagerId || RECEIPT_MANAGER_PAYMENT_MANAGER,
        paymentRecipient: params.paymentRecipientId,
        requiresAuthorization: params.requiresAuthorization,
        maxClaimedReceipts: (_a = params.maxClaimedReceipts) !== null && _a !== void 0 ? _a : null,
    })
        .accounts({
        receiptManager: receiptManagerId,
        stakePool: params.stakePoolId,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, receiptManagerId];
};
export const withInitReceiptEntry = async (transaction, connection, wallet, params) => {
    const receiptEntryId = findReceiptEntryId(params.stakeEntryId);
    const program = receiptManagerProgram(connection, wallet);
    const ix = await program.methods
        .initReceiptEntry()
        .accounts({
        receiptEntry: receiptEntryId,
        stakeEntry: params.stakeEntryId,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, receiptEntryId];
};
export const withInitRewardReceipt = async (transaction, connection, wallet, params) => {
    const rewardReceiptId = findRewardReceiptId(params.receiptManagerId, params.receiptEntryId);
    const program = receiptManagerProgram(connection, wallet);
    const ix = await program.methods
        .initRewardReceipt()
        .accounts({
        rewardReceipt: rewardReceiptId,
        receiptManager: params.receiptManagerId,
        receiptEntry: params.receiptEntryId,
        stakeEntry: params.stakeEntryId,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, rewardReceiptId];
};
export const withUpdateReceiptManager = async (transaction, connection, wallet, params) => {
    const receiptManagerId = findReceiptManagerId(params.stakePoolId, params.name);
    const receiptManagerData = await getReceiptManager(connection, receiptManagerId);
    const program = receiptManagerProgram(connection, wallet);
    const ix = await program.methods
        .updateReceiptManager({
        authority: params.authority || receiptManagerData.parsed.authority,
        requiredStakeSeconds: params.requiredStakeSeconds ||
            receiptManagerData.parsed.requiredStakeSeconds,
        stakeSecondsToUse: params.stakeSecondsToUse || receiptManagerData.parsed.stakeSecondsToUse,
        paymentMint: params.paymentMint || receiptManagerData.parsed.paymentMint,
        paymentManager: params.paymentManagerId || receiptManagerData.parsed.paymentManager,
        paymentRecipient: params.paymentRecipientId || receiptManagerData.parsed.paymentRecipient,
        requiresAuthorization: params.requiresAuthorization ||
            receiptManagerData.parsed.requiresAuthorization,
        maxClaimedReceipts: params.maxClaimedReceipts ||
            receiptManagerData.parsed.maxClaimedReceipts,
    })
        .accounts({
        receiptManager: receiptManagerId,
        authority: wallet.publicKey,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, receiptManagerId];
};
export const withClaimRewardReceipt = async (transaction, connection, wallet, params) => {
    var _a;
    const receiptManagerId = findReceiptManagerId(params.stakePoolId, params.receiptManagerName);
    const checkReceiptManager = await tryGetAccount(() => getReceiptManager(connection, receiptManagerId));
    if (!checkReceiptManager) {
        throw `No reward receipt manager found with name ${params.receiptManagerName} for pool ${params.stakePoolId.toString()}`;
    }
    const receiptEntryId = findReceiptEntryId(params.stakeEntryId);
    const rewardReceiptId = findRewardReceiptId(receiptManagerId, receiptEntryId);
    const checkPaymentManager = await tryGetAccount(() => getPaymentManager(connection, checkReceiptManager.parsed.paymentManager));
    if (!checkPaymentManager) {
        throw `Could not find payment manager with address ${checkReceiptManager.parsed.paymentManager.toString()}`;
    }
    const feeCollectorTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, checkReceiptManager.parsed.paymentMint, checkPaymentManager.parsed.feeCollector, wallet.publicKey);
    const paymentRecipientTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, checkReceiptManager.parsed.paymentMint, checkReceiptManager.parsed.paymentRecipient, (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey);
    const payerTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, checkReceiptManager.parsed.paymentMint, params.payer, wallet.publicKey);
    await withUpdateTotalStakeSeconds(transaction, connection, wallet, {
        stakeEntryId: params.stakeEntryId,
        lastStaker: params.claimer,
    });
    const program = receiptManagerProgram(connection, wallet);
    const ix = await program.methods
        .claimRewardReceipt()
        .accounts({
        rewardReceipt: rewardReceiptId,
        receiptManager: receiptManagerId,
        stakeEntry: params.stakeEntryId,
        receiptEntry: receiptEntryId,
        paymentManager: checkReceiptManager.parsed.paymentManager,
        feeCollectorTokenAccount: feeCollectorTokenAccountId,
        paymentRecipientTokenAccount: paymentRecipientTokenAccountId,
        payerTokenAccount: payerTokenAccountId,
        payer: wallet.publicKey,
        claimer: params.claimer,
        cardinalPaymentManager: PAYMENT_MANAGER_ADDRESS,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, rewardReceiptId];
};
export const withCloseReceiptManager = async (transaction, connection, wallet, params) => {
    const program = receiptManagerProgram(connection, wallet);
    const ix = await program.methods
        .closeReceiptManager()
        .accounts({
        receiptManager: params.receiptManagerId,
        authority: wallet.publicKey,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
export const withCloseReceiptEntry = async (transaction, connection, wallet, params) => {
    const program = receiptManagerProgram(connection, wallet);
    const ix = await program.methods
        .closeReceiptEntry()
        .accounts({
        receiptEntry: params.receiptEntryId,
        receiptManager: params.receiptManagerId,
        stakeEntry: params.stakeEntryId,
        authority: wallet.publicKey,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
export const withCloseRewardReceipt = async (transaction, connection, wallet, params) => {
    const program = receiptManagerProgram(connection, wallet);
    const ix = await program.methods
        .closeRewardReceipt()
        .accounts({
        rewardReceipt: params.rewardReceiptId,
        receiptManager: params.receiptManagerId,
        authority: wallet.publicKey,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
export const withSetRewardReceiptAllowed = async (transaction, connection, wallet, params) => {
    const program = receiptManagerProgram(connection, wallet);
    const ix = await program.methods
        .setRewardReceiptAllowed(params.auth)
        .accounts({
        receiptManager: params.receiptManagerId,
        rewardReceipt: params.rewardReceiptId,
        authority: wallet.publicKey,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
//# sourceMappingURL=transaction.js.map