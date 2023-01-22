"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const transaction_1 = require("@cardinal/payment-manager/dist/cjs/transaction");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const src_1 = require("../../src");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_1 = require("../../src/programs/stakePool/accounts");
const transaction_2 = require("../../src/programs/stakePool/transaction");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
describe("Stake booster boost", () => {
    let provider;
    let stakePoolId;
    let originalMintTokenAccountId;
    let originalMintId;
    const feeCollector = web3_js_1.Keypair.generate();
    let paymentMintTokenAccount;
    let paymentMintId;
    const STAKE_BOOSTER_PAYMENT_AMOUNT = new bn_js_1.BN(2);
    const BOOST_SECONDS = new bn_js_1.BN(10);
    const SECONDS_TO_BOOST = new bn_js_1.BN(3);
    const PAYMENT_SUPPLY = new bn_js_1.BN(100);
    const MAKER_FEE = 50;
    const TAKER_FEE = 0;
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        const mintKeypair = web3_js_1.Keypair.generate();
        originalMintId = mintKeypair.publicKey;
        originalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, provider.wallet.publicKey);
        // master edition
        const transaction = await (0, utils_2.createMasterEditionTx)(provider.connection, mintKeypair.publicKey, provider.wallet.publicKey);
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet, { signers: [mintKeypair] });
        [paymentMintTokenAccount, paymentMintId] = await (0, utils_2.createMint)(provider.connection, provider.wallet, { amount: PAYMENT_SUPPLY.toNumber() });
        // payment mint
        const stakeBoostPaymentManager = await provider.connection.getAccountInfo(stakePool_1.STAKE_BOOSTER_PAYMENT_MANAGER);
        if (!stakeBoostPaymentManager) {
            // create payment manager
            const transaction = new web3_js_1.Transaction();
            await (0, transaction_1.withInit)(transaction, provider.connection, provider.wallet, stakePool_1.STAKE_BOOSTER_PAYMENT_MANAGER_NAME, feeCollector.publicKey, MAKER_FEE, TAKER_FEE, false);
            await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        }
    });
    it("Create Pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {});
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    it("Create booster", async () => {
        const transaction = await (0, transaction_2.withInitStakeBooster)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            paymentAmount: STAKE_BOOSTER_PAYMENT_AMOUNT,
            paymentMint: paymentMintId,
            boostSeconds: BOOST_SECONDS,
            startTimeSeconds: Date.now() / 1000,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    it("Stake", async () => {
        const transaction = await (0, src_1.stake)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
            userOriginalMintTokenAccountId: originalMintTokenAccountId,
            receiptType: stakePool_1.ReceiptType.Original,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(true);
    });
    it("Update", async () => {
        var _a, _b, _c;
        await (0, utils_2.delay)(1000);
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const oldStakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, stakeEntryId);
        const transaction = new web3_js_1.Transaction();
        await (0, transaction_2.withUpdateTotalStakeSeconds)(transaction, provider.connection, provider.wallet, {
            stakeEntryId: stakeEntryId,
            lastStaker: provider.wallet.publicKey,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, stakeEntryId);
        expect(stakeEntryData.parsed.lastUpdatedAt).not.toEqual(null);
        expect(oldStakeEntryData.parsed.lastUpdatedAt).not.toEqual(null);
        expect((_a = stakeEntryData.parsed.lastUpdatedAt) === null || _a === void 0 ? void 0 : _a.toNumber()).toBeGreaterThan((_c = (_b = oldStakeEntryData.parsed.lastUpdatedAt) === null || _b === void 0 ? void 0 : _b.toNumber()) !== null && _c !== void 0 ? _c : 0);
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        expect(stakeEntryData.parsed.totalStakeSeconds.toNumber()).toBeGreaterThan(oldStakeEntryData.parsed.totalStakeSeconds.toNumber());
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(true);
    });
    it("Boost", async () => {
        await (0, utils_2.delay)(5000);
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const oldStakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, stakeEntryId);
        const transaction = await (0, transaction_2.withBoostStakeEntry)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            stakeEntryId: stakeEntryId,
            originalMintId: originalMintId,
            payerTokenAccount: paymentMintTokenAccount,
            secondsToBoost: SECONDS_TO_BOOST,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        expect(oldStakeEntryData.parsed.lastStakedAt.toNumber()).toEqual(stakeEntryData.parsed.lastStakedAt.toNumber());
        expect(stakeEntryData.parsed.totalStakeSeconds.toNumber()).toEqual(oldStakeEntryData.parsed.totalStakeSeconds
            .add(SECONDS_TO_BOOST)
            .toNumber());
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(true);
        const checkPaymentMintTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, paymentMintTokenAccount);
        expect(Number(checkPaymentMintTokenAccount.amount)).toEqual(PAYMENT_SUPPLY.sub(SECONDS_TO_BOOST.mul(STAKE_BOOSTER_PAYMENT_AMOUNT).div(BOOST_SECONDS)).toNumber());
    });
    it("Unstake", async () => {
        await (0, utils_2.delay)(2000);
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const oldStakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, stakeEntryId);
        const transaction = await (0, src_1.unstake)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(web3_js_1.PublicKey.default.toString());
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        expect(stakeEntryData.parsed.totalStakeSeconds.toNumber()).toBeGreaterThan(oldStakeEntryData.parsed.totalStakeSeconds.toNumber());
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(false);
    });
    it("Fail boost while unstaked", async () => {
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const transaction = await (0, transaction_2.withBoostStakeEntry)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
            stakeEntryId: stakeEntryId,
            payerTokenAccount: paymentMintTokenAccount,
            secondsToBoost: SECONDS_TO_BOOST,
        });
        await expect((0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet, {
            silent: true,
        })).rejects.toThrow();
    });
    it("Fail boost too far", async () => {
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const transaction = await (0, transaction_2.withBoostStakeEntry)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            stakeEntryId: stakeEntryId,
            originalMintId: originalMintId,
            payerTokenAccount: paymentMintTokenAccount,
            secondsToBoost: SECONDS_TO_BOOST.mul(new bn_js_1.BN(10)),
        });
        await expect((0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet, {
            silent: true,
        })).rejects.toThrow();
    });
});
//# sourceMappingURL=stake-booster-boost.test.js.map