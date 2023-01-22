"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const accounts_1 = require("@cardinal/payment-manager/dist/cjs/accounts");
const pda_1 = require("@cardinal/payment-manager/dist/cjs/pda");
const transaction_1 = require("@cardinal/payment-manager/dist/cjs/transaction");
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const src_1 = require("../../src");
const receiptManager_1 = require("../../src/programs/receiptManager");
const accounts_2 = require("../../src/programs/receiptManager/accounts");
const pda_2 = require("../../src/programs/receiptManager/pda");
const transaction_2 = require("../../src/programs/receiptManager/transaction");
const utils_1 = require("../utils");
const workspace_1 = require("../workspace");
describe("Create update close receipt manager", () => {
    let provider;
    let stakePoolId;
    let invalidAuthority;
    const receiptManagerName = `mgr-${Math.random()}`;
    const requiredStakeSeconds = new anchor_1.BN(5);
    const stakeSecondsToUse = new anchor_1.BN(1);
    const updatedStakeSecondsToUse = new anchor_1.BN(10);
    const requiresAuthorization = false;
    const MAKER_FEE = 0;
    const TAKER_FEE = 0;
    const feeCollector = web3_js_1.Keypair.generate();
    const paymentRecipient = web3_js_1.Keypair.generate();
    const paymentMint = new web3_js_1.PublicKey("So11111111111111111111111111111111111111112");
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        invalidAuthority = await (0, utils_1.newAccountWithLamports)(provider.connection);
    });
    it("Create payment manager", async () => {
        const transaction = new web3_js_1.Transaction();
        const [paymentManagerId] = await (0, pda_1.findPaymentManagerAddress)(receiptManager_1.RECEIPT_MANAGER_PAYMENT_MANAGER_NAME);
        const checkIfPaymentManagerExists = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getPaymentManager)(provider.connection, paymentManagerId));
        if (!checkIfPaymentManagerExists) {
            await (0, transaction_1.withInit)(transaction, provider.connection, provider.wallet, receiptManager_1.RECEIPT_MANAGER_PAYMENT_MANAGER_NAME, feeCollector.publicKey, MAKER_FEE, TAKER_FEE, false);
            await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        }
        const paymentManagerData = await (0, accounts_1.getPaymentManager)(provider.connection, paymentManagerId);
        expect(paymentManagerData.parsed.name).toEqual(receiptManager_1.RECEIPT_MANAGER_PAYMENT_MANAGER_NAME);
    });
    it("Create Pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {});
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    it("Invalid authority", async () => {
        const transaction = new web3_js_1.Transaction();
        await (0, transaction_2.withInitReceiptManager)(transaction, provider.connection, provider.wallet, {
            name: receiptManagerName,
            stakePoolId: stakePoolId,
            authority: invalidAuthority.publicKey,
            requiredStakeSeconds: requiredStakeSeconds,
            stakeSecondsToUse: stakeSecondsToUse,
            paymentMint: paymentMint,
            paymentRecipientId: paymentRecipient.publicKey,
            requiresAuthorization: requiresAuthorization,
        });
        await expect((0, utils_1.executeTransaction)(provider.connection, transaction, new anchor_1.Wallet(invalidAuthority), {
            silent: true,
        })).rejects.toThrow();
    });
    it("Create Reward Receipt Manager", async () => {
        const transaction = new web3_js_1.Transaction();
        const [, receiptManagerId] = await (0, transaction_2.withInitReceiptManager)(transaction, provider.connection, provider.wallet, {
            name: receiptManagerName,
            stakePoolId: stakePoolId,
            authority: provider.wallet.publicKey,
            requiredStakeSeconds: requiredStakeSeconds,
            stakeSecondsToUse: stakeSecondsToUse,
            paymentMint: paymentMint,
            paymentRecipientId: paymentRecipient.publicKey,
            requiresAuthorization: requiresAuthorization,
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const receiptManagerData = await (0, accounts_2.getReceiptManager)(provider.connection, receiptManagerId);
        const [payamentManagerId] = await (0, pda_1.findPaymentManagerAddress)(receiptManager_1.RECEIPT_MANAGER_PAYMENT_MANAGER_NAME);
        expect(receiptManagerData.parsed.paymentManager.toString()).toEqual(payamentManagerId.toString());
        expect(receiptManagerData.parsed.authority.toString()).toEqual(provider.wallet.publicKey.toString());
        expect(receiptManagerData.parsed.paymentMint.toString()).toEqual(paymentMint.toString());
        expect(receiptManagerData.parsed.stakePool.toString()).toEqual(stakePoolId.toString());
        expect(receiptManagerData.parsed.requiredStakeSeconds.toString()).toEqual(requiredStakeSeconds.toString());
        expect(receiptManagerData.parsed.stakeSecondsToUse.toString()).toEqual(stakeSecondsToUse.toString());
        expect(receiptManagerData.parsed.requiresAuthorization.toString()).toEqual(requiresAuthorization.toString());
    });
    it("Invalid authority updated", async () => {
        const transaction = new web3_js_1.Transaction();
        await (0, transaction_2.withUpdateReceiptManager)(transaction, provider.connection, new anchor_1.Wallet(invalidAuthority), {
            name: receiptManagerName,
            stakePoolId: stakePoolId,
            authority: invalidAuthority.publicKey,
            requiredStakeSeconds: requiredStakeSeconds,
            stakeSecondsToUse: stakeSecondsToUse,
            paymentMint: paymentMint,
            paymentRecipientId: paymentRecipient.publicKey,
            requiresAuthorization: requiresAuthorization,
        });
        await expect((0, utils_1.executeTransaction)(provider.connection, transaction, new anchor_1.Wallet(invalidAuthority), { silent: true })).rejects.toThrow();
    });
    it("Update reward receipt manager", async () => {
        const transaction = new web3_js_1.Transaction();
        const [, receiptManagerId] = await (0, transaction_2.withUpdateReceiptManager)(transaction, provider.connection, provider.wallet, {
            name: receiptManagerName,
            stakePoolId: stakePoolId,
            authority: provider.wallet.publicKey,
            requiredStakeSeconds: requiredStakeSeconds,
            stakeSecondsToUse: updatedStakeSecondsToUse,
            paymentMint: paymentMint,
            paymentRecipientId: paymentRecipient.publicKey,
            requiresAuthorization: requiresAuthorization,
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const receiptManagerData = await (0, accounts_2.getReceiptManager)(provider.connection, receiptManagerId);
        const [payamentManagerId] = await (0, pda_1.findPaymentManagerAddress)(receiptManager_1.RECEIPT_MANAGER_PAYMENT_MANAGER_NAME);
        expect(receiptManagerData.parsed.paymentManager.toString()).toEqual(payamentManagerId.toString());
        expect(receiptManagerData.parsed.authority.toString()).toEqual(provider.wallet.publicKey.toString());
        expect(receiptManagerData.parsed.paymentMint.toString()).toEqual(paymentMint.toString());
        expect(receiptManagerData.parsed.stakePool.toString()).toEqual(stakePoolId.toString());
        expect(receiptManagerData.parsed.requiredStakeSeconds.toString()).toEqual(requiredStakeSeconds.toString());
        expect(receiptManagerData.parsed.stakeSecondsToUse.toString()).toEqual(updatedStakeSecondsToUse.toString());
        expect(receiptManagerData.parsed.requiresAuthorization.toString()).toEqual(requiresAuthorization.toString());
    });
    it("Close reward receipt manager", async () => {
        const receiptManagerId = (0, pda_2.findReceiptManagerId)(stakePoolId, receiptManagerName);
        const transaction = await (0, transaction_2.withCloseReceiptManager)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
            receiptManagerId,
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const receiptManagerData = await (0, common_1.tryGetAccount)(() => (0, accounts_2.getReceiptManager)(provider.connection, receiptManagerId));
        expect(receiptManagerData).toEqual(null);
    });
});
//# sourceMappingURL=receipt-manager-update-close.test.js.map