"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// blockasset setup
const common_1 = require("@cardinal/common");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const src_1 = require("../../../src");
const accounts_1 = require("../../../src/programs/rewardDistributor/accounts");
const pda_1 = require("../../../src/programs/rewardDistributor/pda");
const transaction_1 = require("../../../src/programs/rewardDistributor/transaction");
const accounts_2 = require("../../../src/programs/stakePool/accounts");
const utils_1 = require("../../../src/programs/stakePool/utils");
const utils_2 = require("../../utils");
const workspace_1 = require("../../workspace");
describe("Stake and claim rewards", () => {
    let provider;
    let originalMintTokenAccountId;
    let originalMintId;
    let rewardMintId;
    let stakePoolId;
    let rewardDistributorId;
    // fungible test that the amount and seconds should be zero
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        // original mint
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMint)(provider.connection, provider.wallet, { amount: 1, decimals: 6 });
        // reward mint
        [, rewardMintId] = await (0, utils_2.createMint)(provider.connection, provider.wallet, {
            amount: 0,
        });
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
            rewardAmount: new bn_js_1.BN((10 ** 6 / 24 / 60 / 60) * 1000),
            rewardDurationSeconds: new bn_js_1.BN(1),
            supply: new bn_js_1.BN(5 * 10 * 6),
            defaultMultiplier: new bn_js_1.BN(1000),
            multiplierDecimals: 7,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, new bn_js_1.BN(0));
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
        await (0, transaction_1.withUpdateRewardEntry)(transaction, provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            rewardDistributorId: rewardDistributorId,
            stakeEntryId: stakeEntryId,
            multiplier: new bn_js_1.BN(12481),
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
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_2.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(0);
    });
    it("Claim Rewards", async () => {
        await (0, utils_2.delay)(4000);
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const rewardEntryId = (0, pda_1.findRewardEntryId)(rewardDistributorId, stakeEntryId);
        const transaction = await (0, src_1.claimRewards)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            stakeEntryId: stakeEntryId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(0);
        const rewardEntryAfter = await (0, accounts_1.getRewardEntry)(provider.connection, rewardEntryId);
        const userRewardMintTokenAccount = await (0, common_1.findAta)(rewardMintId, provider.wallet.publicKey, true);
        const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(provider.connection, rewardDistributorId);
        const a = await (0, spl_token_1.getAccount)(provider.connection, userRewardMintTokenAccount);
        console.log("user reward mint token acount", Number(a.amount));
        console.log("rewardsIssued", rewardDistributorData.parsed.rewardsIssued.toNumber());
        expect(rewardEntryAfter.parsed.rewardSecondsReceived.toNumber()).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=rewards-multiplier-test.test.js.map