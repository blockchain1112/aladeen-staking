"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const src_1 = require("../../src");
const accounts_1 = require("../../src/programs/rewardDistributor/accounts");
const pda_1 = require("../../src/programs/rewardDistributor/pda");
const transaction_1 = require("../../src/programs/rewardDistributor/transaction");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_2 = require("../../src/programs/stakePool/accounts");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
describe("Stake and claim permissionless rewards", () => {
    let originalMintTokenAccountId;
    let originalMintId;
    let rewardMintId;
    let stakePoolId;
    let provider;
    const rewardClaimer = web3_js_1.Keypair.generate();
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        // original mint
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMasterEdition)(provider.connection, provider.wallet);
        // original mint
        [, rewardMintId] = await (0, utils_2.createMint)(provider.connection, provider.wallet, {
            amount: 0,
        });
        const fromAirdropSignature = await provider.connection.requestAirdrop(rewardClaimer.publicKey, 10 * web3_js_1.LAMPORTS_PER_SOL);
        await provider.connection.confirmTransaction(fromAirdropSignature);
    });
    it("Create Pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {});
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    it("Create Reward Distributor", async () => {
        const transaction = new web3_js_1.Transaction();
        await (0, transaction_1.withInitRewardDistributor)(transaction, provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            rewardMintId: rewardMintId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, new bn_js_1.BN(0));
        const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(provider.connection, rewardDistributorId);
        expect(rewardDistributorData.parsed.rewardMint.toString()).toEqual(rewardMintId.toString());
        expect(rewardDistributorData.parsed.rewardMint.toString()).toEqual(rewardMintId.toString());
    });
    it("Create Reward Entry", async () => {
        const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, new bn_js_1.BN(0));
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const transaction = await (0, src_1.initializeRewardEntry)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const rewardEntryId = (0, pda_1.findRewardEntryId)(rewardDistributorId, stakeEntryId);
        const rewardEntryData = await (0, accounts_1.getRewardEntry)(provider.connection, rewardEntryId);
        expect(rewardEntryData.parsed.rewardDistributor.toString()).toEqual(rewardDistributorId.toString());
        expect(rewardEntryData.parsed.stakeEntry.toString()).toEqual(stakeEntryId.toString());
    });
    it("Stake", async () => {
        const transaction = await (0, src_1.stake)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
            userOriginalMintTokenAccountId: originalMintTokenAccountId,
            receiptType: stakePool_1.ReceiptType.Original,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_2.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(true);
    });
    it("Claim Rewards fail", async () => {
        await (0, utils_2.delay)(2000);
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const transaction = await (0, src_1.claimRewards)(provider.connection, new anchor_1.Wallet(rewardClaimer), {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            stakeEntryId: stakeEntryId,
        });
        await expect((0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet, {
            silent: true,
        })).rejects.toThrow();
    });
    it("Claim Rewards", async () => {
        var _a, _b, _c;
        await (0, utils_2.delay)(2000);
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const oldStakeEntryData = await (0, accounts_2.getStakeEntry)(provider.connection, stakeEntryId);
        const transaction = await (0, src_1.claimRewards)(provider.connection, new anchor_1.Wallet(rewardClaimer), {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            stakeEntryId: stakeEntryId,
            lastStaker: oldStakeEntryData.parsed.lastStaker,
            authority: provider.wallet.publicKey,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, new anchor_1.Wallet(rewardClaimer));
        const newStakeEntryData = await (0, accounts_2.getStakeEntry)(provider.connection, stakeEntryId);
        expect(newStakeEntryData.parsed.lastUpdatedAt).not.toEqual(null);
        expect(oldStakeEntryData.parsed.lastUpdatedAt).not.toEqual(null);
        expect((_a = newStakeEntryData.parsed.lastUpdatedAt) === null || _a === void 0 ? void 0 : _a.toNumber()).toBeGreaterThan((_c = (_b = oldStakeEntryData.parsed.lastUpdatedAt) === null || _b === void 0 ? void 0 : _b.toNumber()) !== null && _c !== void 0 ? _c : 0);
        expect(newStakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        expect(newStakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        expect(newStakeEntryData.parsed.totalStakeSeconds.toNumber()).toBeGreaterThan(oldStakeEntryData.parsed.totalStakeSeconds.toNumber());
        const userRewardMintTokenAccountId = await (0, common_1.findAta)(rewardMintId, provider.wallet.publicKey, true);
        const checkUserRewardTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userRewardMintTokenAccountId);
        expect(Number(checkUserRewardTokenAccount.amount)).toBeGreaterThan(1);
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(true);
    });
    it("Unstake", async () => {
        const transaction = await (0, src_1.unstake)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_2.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(web3_js_1.PublicKey.default.toString());
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(false);
        const stakeEntryOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, stakeEntryData.pubkey, true);
        const userRewardMintTokenAccountId = await (0, common_1.findAta)(rewardMintId, provider.wallet.publicKey, true);
        const checkStakeEntryOriginalMintTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, stakeEntryOriginalMintTokenAccountId);
        expect(Number(checkStakeEntryOriginalMintTokenAccount.amount)).toEqual(0);
        const checkUserRewardTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userRewardMintTokenAccountId);
        expect(Number(checkUserRewardTokenAccount.amount)).toBeGreaterThan(1);
    });
});
//# sourceMappingURL=stake-permissionless-claim-rewards.test.js.map