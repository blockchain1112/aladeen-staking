"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const src_1 = require("../../src");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_1 = require("../../src/programs/stakePool/accounts");
const pda_1 = require("../../src/programs/stakePool/pda");
const transaction_1 = require("../../src/programs/stakePool/transaction");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
let provider;
let originalMintTokenAccountId;
let originalMintId;
let stakePoolId;
let newStaker;
describe("Reassign stake entry", () => {
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        const mintKeypair = web3_js_1.Keypair.generate();
        originalMintId = mintKeypair.publicKey;
        originalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, provider.wallet.publicKey);
        newStaker = new anchor_1.Wallet(await (0, workspace_1.newAccountWithLamports)(provider.connection));
        await (0, utils_2.executeTransaction)(provider.connection, await (0, utils_2.createMasterEditionTx)(provider.connection, mintKeypair.publicKey, provider.wallet.publicKey), provider.wallet, { signers: [mintKeypair] });
    });
    it("Create Pool", async () => {
        let tx;
        [tx, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {});
        await (0, utils_2.executeTransaction)(provider.connection, tx, provider.wallet);
    });
    it("Stake", async () => {
        let transaction = new web3_js_1.Transaction();
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const checkStakeEntryData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getStakeEntry)(provider.connection, stakeEntryId));
        if (!checkStakeEntryData) {
            [transaction] = await (0, src_1.createStakeEntry)(provider.connection, provider.wallet, {
                stakePoolId: stakePoolId,
                originalMintId: originalMintId,
            });
        }
        await (0, transaction_1.withStake)(transaction, provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
            userOriginalMintTokenAccountId: originalMintTokenAccountId,
            amount: new bn_js_1.BN(1),
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        const userOriginalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, provider.wallet.publicKey, true);
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(0);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(false);
    });
    it("Reassign stake entry", async () => {
        const transaction = new web3_js_1.Transaction();
        const stakeEntryId = (0, pda_1.findStakeEntryId)(provider.wallet.publicKey, stakePoolId, originalMintId, false);
        await (0, transaction_1.withReassignStakeEntry)(transaction, provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            stakeEntryId: stakeEntryId,
            target: newStaker.publicKey,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, stakeEntryId);
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(newStaker.publicKey.toString());
    });
    it("Claim receipt mint", async () => {
        const transaction = new web3_js_1.Transaction();
        const stakeEntryId = (0, pda_1.findStakeEntryId)(provider.wallet.publicKey, stakePoolId, originalMintId, false);
        await (0, transaction_1.withClaimReceiptMint)(transaction, provider.connection, newStaker, {
            stakePoolId: stakePoolId,
            stakeEntryId: stakeEntryId,
            originalMintId: originalMintId,
            receiptMintId: originalMintId,
            receiptType: stakePool_1.ReceiptType.Original,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, newStaker);
        const userOriginalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, newStaker.publicKey, true);
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(true);
    });
    it("Unstake", async () => {
        let transaction = new web3_js_1.Transaction();
        await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, provider.connection, originalMintId, newStaker.publicKey, provider.wallet.publicKey, true);
        transaction = await (0, src_1.unstake)(provider.connection, newStaker, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, newStaker);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(web3_js_1.PublicKey.default.toString());
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        const userOriginalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, newStaker.publicKey, true);
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(false);
    });
});
//# sourceMappingURL=reassign-staker.test.js.map