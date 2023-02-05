"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withSetRewardReceiptAllowed = exports.withCloseRewardReceipt = exports.withCloseReceiptEntry = exports.withCloseReceiptManager = exports.withClaimRewardReceipt = exports.withUpdateReceiptManager = exports.withInitRewardReceipt = exports.withInitReceiptEntry = exports.withInitReceiptManager = void 0;
const common_1 = require("@cardinal/common");
const payment_manager_1 = require("@cardinal/payment-manager");
const accounts_1 = require("@cardinal/payment-manager/dist/cjs/accounts");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const transaction_1 = require("../stakePool/transaction");
const accounts_2 = require("./accounts");
const constants_1 = require("./constants");
const pda_1 = require("./pda");
const withInitReceiptManager = async (transaction, connection, wallet, params) => {
    var _a;
    const receiptManagerId = (0, pda_1.findReceiptManagerId)(params.stakePoolId, params.name);
    const program = (0, constants_1.receiptManagerProgram)(connection, wallet);
    const ix = await program.methods
        .initReceiptManager({
        name: params.name,
        authority: params.authority,
        requiredStakeSeconds: params.requiredStakeSeconds,
        stakeSecondsToUse: params.stakeSecondsToUse,
        paymentMint: params.paymentMint,
        paymentManager: params.paymentManagerId || constants_1.RECEIPT_MANAGER_PAYMENT_MANAGER,
        paymentRecipient: params.paymentRecipientId,
        requiresAuthorization: params.requiresAuthorization,
        maxClaimedReceipts: (_a = params.maxClaimedReceipts) !== null && _a !== void 0 ? _a : null,
    })
        .accounts({
        receiptManager: receiptManagerId,
        stakePool: params.stakePoolId,
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, receiptManagerId];
};
exports.withInitReceiptManager = withInitReceiptManager;
const withInitReceiptEntry = async (transaction, connection, wallet, params) => {
    const receiptEntryId = (0, pda_1.findReceiptEntryId)(params.stakeEntryId);
    const program = (0, constants_1.receiptManagerProgram)(connection, wallet);
    const ix = await program.methods
        .initReceiptEntry()
        .accounts({
        receiptEntry: receiptEntryId,
        stakeEntry: params.stakeEntryId,
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, receiptEntryId];
};
exports.withInitReceiptEntry = withInitReceiptEntry;
const withInitRewardReceipt = async (transaction, connection, wallet, params) => {
    const rewardReceiptId = (0, pda_1.findRewardReceiptId)(params.receiptManagerId, params.receiptEntryId);
    const program = (0, constants_1.receiptManagerProgram)(connection, wallet);
    const ix = await program.methods
        .initRewardReceipt()
        .accounts({
        rewardReceipt: rewardReceiptId,
        receiptManager: params.receiptManagerId,
        receiptEntry: params.receiptEntryId,
        stakeEntry: params.stakeEntryId,
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, rewardReceiptId];
};
exports.withInitRewardReceipt = withInitRewardReceipt;
const withUpdateReceiptManager = async (transaction, connection, wallet, params) => {
    const receiptManagerId = (0, pda_1.findReceiptManagerId)(params.stakePoolId, params.name);
    const receiptManagerData = await (0, accounts_2.getReceiptManager)(connection, receiptManagerId);
    const program = (0, constants_1.receiptManagerProgram)(connection, wallet);
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
exports.withUpdateReceiptManager = withUpdateReceiptManager;
const withClaimRewardReceipt = async (transaction, connection, wallet, params) => {
    var _a;
    const receiptManagerId = (0, pda_1.findReceiptManagerId)(params.stakePoolId, params.receiptManagerName);
    const checkReceiptManager = await (0, common_1.tryGetAccount)(() => (0, accounts_2.getReceiptManager)(connection, receiptManagerId));
    if (!checkReceiptManager) {
        throw `No reward receipt manager found with name ${params.receiptManagerName} for pool ${params.stakePoolId.toString()}`;
    }
    const receiptEntryId = (0, pda_1.findReceiptEntryId)(params.stakeEntryId);
    const rewardReceiptId = (0, pda_1.findRewardReceiptId)(receiptManagerId, receiptEntryId);
    const checkPaymentManager = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getPaymentManager)(connection, checkReceiptManager.parsed.paymentManager));
    if (!checkPaymentManager) {
        throw `Could not find payment manager with address ${checkReceiptManager.parsed.paymentManager.toString()}`;
    }
    const feeCollectorTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, checkReceiptManager.parsed.paymentMint, checkPaymentManager.parsed.feeCollector, wallet.publicKey);
    const paymentRecipientTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, checkReceiptManager.parsed.paymentMint, checkReceiptManager.parsed.paymentRecipient, (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey);
    const payerTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, checkReceiptManager.parsed.paymentMint, params.payer, wallet.publicKey);
    await (0, transaction_1.withUpdateTotalStakeSeconds)(transaction, connection, wallet, {
        stakeEntryId: params.stakeEntryId,
        lastStaker: params.claimer,
    });
    const program = (0, constants_1.receiptManagerProgram)(connection, wallet);
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
        cardinalPaymentManager: payment_manager_1.PAYMENT_MANAGER_ADDRESS,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, rewardReceiptId];
};
exports.withClaimRewardReceipt = withClaimRewardReceipt;
const withCloseReceiptManager = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.receiptManagerProgram)(connection, wallet);
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
exports.withCloseReceiptManager = withCloseReceiptManager;
const withCloseReceiptEntry = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.receiptManagerProgram)(connection, wallet);
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
exports.withCloseReceiptEntry = withCloseReceiptEntry;
const withCloseRewardReceipt = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.receiptManagerProgram)(connection, wallet);
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
exports.withCloseRewardReceipt = withCloseRewardReceipt;
const withSetRewardReceiptAllowed = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.receiptManagerProgram)(connection, wallet);
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
exports.withSetRewardReceiptAllowed = withSetRewardReceiptAllowed;
//# sourceMappingURL=transaction.js.map