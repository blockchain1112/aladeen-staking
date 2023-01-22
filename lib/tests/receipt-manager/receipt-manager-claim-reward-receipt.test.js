"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const accounts_1 = require("@cardinal/payment-manager/dist/cjs/accounts");
const pda_1 = require("@cardinal/payment-manager/dist/cjs/pda");
const transaction_1 = require("@cardinal/payment-manager/dist/cjs/transaction");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const src_1 = require("../../src");
const receiptManager_1 = require("../../src/programs/receiptManager");
const accounts_2 = require("../../src/programs/receiptManager/accounts");
const pda_2 = require("../../src/programs/receiptManager/pda");
const transaction_2 = require("../../src/programs/receiptManager/transaction");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_3 = require("../../src/programs/stakePool/accounts");
const pda_3 = require("../../src/programs/stakePool/pda");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
describe("Receipt manager claim reward receipt", () => {
    let provider;
    let originalMintTokenAccountId;
    let originalMintId;
    let stakePoolId;
    const receiptManagerName = `mgr-${Math.random()}`;
    const requiredStakeSeconds = new anchor_1.BN(5);
    const stakeSecondsToUse = new anchor_1.BN(1);
    const requiresAuthorization = false;
    const MAKER_FEE = 0;
    const TAKER_FEE = 0;
    const feeCollector = web3_js_1.Keypair.generate();
    const paymentRecipient = web3_js_1.Keypair.generate();
    const paymentMint = new web3_js_1.PublicKey("So11111111111111111111111111111111111111112");
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        // original mint
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMasterEdition)(provider.connection, provider.wallet);
        const transaction = new web3_js_1.Transaction();
        await (0, common_1.withWrapSol)(transaction, provider.connection, provider.wallet, web3_js_1.LAMPORTS_PER_SOL);
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    it("Create payment manager", async () => {
        const transaction = new web3_js_1.Transaction();
        const [paymentManagerId] = await (0, pda_1.findPaymentManagerAddress)(receiptManager_1.RECEIPT_MANAGER_PAYMENT_MANAGER_NAME);
        const checkIfPaymentManagerExists = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getPaymentManager)(provider.connection, paymentManagerId));
        if (!checkIfPaymentManagerExists) {
            await (0, transaction_1.withInit)(transaction, provider.connection, provider.wallet, receiptManager_1.RECEIPT_MANAGER_PAYMENT_MANAGER_NAME, feeCollector.publicKey, MAKER_FEE, TAKER_FEE, false);
            await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        }
        const paymentManagerData = await (0, accounts_1.getPaymentManager)(provider.connection, paymentManagerId);
        expect(paymentManagerData.parsed.name).toEqual(receiptManager_1.RECEIPT_MANAGER_PAYMENT_MANAGER_NAME);
    });
    it("Create Pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {});
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    it("Fail To Create Reward Receipt Manager", async () => {
        const transaction = new web3_js_1.Transaction();
        await (0, transaction_2.withInitReceiptManager)(transaction, provider.connection, provider.wallet, {
            name: receiptManagerName,
            stakePoolId: stakePoolId,
            authority: provider.wallet.publicKey,
            requiredStakeSeconds: requiredStakeSeconds,
            stakeSecondsToUse: stakeSecondsToUse,
            paymentMint: web3_js_1.Keypair.generate().publicKey,
            paymentRecipientId: paymentRecipient.publicKey,
            requiresAuthorization: requiresAuthorization,
        });
        await expect((0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet, {
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
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
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
    it("Init stake entry for pool", async () => {
        const [transaction, _] = await (0, src_1.createStakeEntry)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_3.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        expect(stakeEntryData.parsed.originalMint.toString()).toEqual(originalMintId.toString());
        expect(stakeEntryData.parsed.pool.toString()).toEqual(stakePoolId.toString());
        expect(stakeEntryData.parsed.stakeMint).toEqual(null);
    });
    it("Stake", async () => {
        const transaction = await (0, src_1.stake)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
            userOriginalMintTokenAccountId: originalMintTokenAccountId,
            receiptType: stakePool_1.ReceiptType.Original,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_3.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(true);
    });
    it("Init Reward Entry and Receipt", async () => {
        const transaction = new web3_js_1.Transaction();
        const receiptManagerId = (0, pda_2.findReceiptManagerId)(stakePoolId, receiptManagerName);
        const stakeEntryId = (0, pda_3.findStakeEntryId)(provider.wallet.publicKey, stakePoolId, originalMintId, false);
        const [, receiptEntryId] = await (0, transaction_2.withInitReceiptEntry)(transaction, provider.connection, provider.wallet, {
            stakeEntryId: stakeEntryId,
        });
        const [, rewardReceiptId] = await (0, transaction_2.withInitRewardReceipt)(transaction, provider.connection, provider.wallet, {
            receiptManagerId: receiptManagerId,
            receiptEntryId: receiptEntryId,
            stakeEntryId: stakeEntryId,
            payer: provider.wallet.publicKey,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const receiptEntryData = await (0, accounts_2.getReceiptEntry)(provider.connection, receiptEntryId);
        expect(receiptEntryData.parsed.stakeEntry.toString()).toEqual(receiptEntryData.parsed.stakeEntry.toString());
        expect(receiptEntryData.parsed.usedStakeSeconds.toNumber()).toEqual(0);
        const rewardReceiptData = await (0, accounts_2.getRewardReceipt)(provider.connection, rewardReceiptId);
        expect(rewardReceiptData.parsed.allowed).toBeTruthy();
        expect(rewardReceiptData.parsed.target.toString()).toEqual(web3_js_1.PublicKey.default.toString());
        expect(rewardReceiptData.parsed.receiptEntry.toString()).toEqual(receiptEntryId.toString());
        expect(rewardReceiptData.parsed.receiptManager.toString()).toEqual(receiptManagerId.toString());
    });
    it("Fail Create Reward Receipt, duration not satisfied", async () => {
        const stakeEntryId = (0, pda_3.findStakeEntryId)(provider.wallet.publicKey, stakePoolId, originalMintId, false);
        const transaction = new web3_js_1.Transaction();
        await (0, transaction_2.withClaimRewardReceipt)(transaction, provider.connection, provider.wallet, {
            receiptManagerName: receiptManagerName,
            stakePoolId: stakePoolId,
            stakeEntryId: stakeEntryId,
            claimer: provider.wallet.publicKey,
            payer: provider.wallet.publicKey,
        });
        await expect((0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet, {
            silent: true,
        })).rejects.toThrow();
    });
    it("Claim Reward Receipt", async () => {
        await (0, utils_2.delay)(6000);
        const stakeEntryId = (0, pda_3.findStakeEntryId)(provider.wallet.publicKey, stakePoolId, originalMintId, false);
        const receiptEntryId = (0, pda_2.findReceiptEntryId)(stakeEntryId);
        const paymentTokenAccountId = await (0, common_1.findAta)(paymentMint, paymentRecipient.publicKey, true);
        let beforeBalance = 0;
        try {
            beforeBalance = Number((await (0, spl_token_1.getAccount)(provider.connection, paymentTokenAccountId)).amount);
        }
        catch (e) {
            beforeBalance = 0;
        }
        const transaction = new web3_js_1.Transaction();
        const [, rewardReceiptId] = await (0, transaction_2.withClaimRewardReceipt)(transaction, provider.connection, provider.wallet, {
            receiptManagerName: receiptManagerName,
            stakePoolId: stakePoolId,
            stakeEntryId: stakeEntryId,
            claimer: provider.wallet.publicKey,
            payer: provider.wallet.publicKey,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const receiptManagerId = (0, pda_2.findReceiptManagerId)(stakePoolId, receiptManagerName);
        const checkRewardReceiptData = await (0, common_1.tryGetAccount)(() => (0, accounts_2.getRewardReceipt)(provider.connection, rewardReceiptId));
        expect(checkRewardReceiptData).not.toBeNull();
        expect(checkRewardReceiptData === null || checkRewardReceiptData === void 0 ? void 0 : checkRewardReceiptData.parsed.target.toString()).toEqual(provider.wallet.publicKey.toString());
        expect(checkRewardReceiptData === null || checkRewardReceiptData === void 0 ? void 0 : checkRewardReceiptData.parsed.receiptEntry.toString()).toEqual(receiptEntryId.toString());
        expect(checkRewardReceiptData === null || checkRewardReceiptData === void 0 ? void 0 : checkRewardReceiptData.parsed.receiptManager.toString()).toEqual(receiptManagerId.toString());
        const paymentTokenAccountData = await (0, spl_token_1.getAccount)(provider.connection, paymentTokenAccountId);
        expect(paymentTokenAccountData.amount.toString()).toEqual((beforeBalance + 2 * 10 ** 6).toString());
        const receiptEntryData = await (0, accounts_2.getReceiptEntry)(provider.connection, receiptEntryId);
        expect(receiptEntryData.parsed.usedStakeSeconds.toNumber()).toEqual(stakeSecondsToUse.toNumber());
    });
    it("Claim reward receipt fail already claimed", async () => {
        const stakeEntryId = (0, pda_3.findStakeEntryId)(provider.wallet.publicKey, stakePoolId, originalMintId, false);
        const transaction = new web3_js_1.Transaction();
        await (0, transaction_2.withClaimRewardReceipt)(transaction, provider.connection, provider.wallet, {
            receiptManagerName: receiptManagerName,
            stakePoolId: stakePoolId,
            stakeEntryId: stakeEntryId,
            claimer: provider.wallet.publicKey,
            payer: provider.wallet.publicKey,
        });
        await expect((0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet, {
            silent: true,
        })).rejects.toThrow();
    });
});
//# sourceMappingURL=receipt-manager-claim-reward-receipt.test.js.map