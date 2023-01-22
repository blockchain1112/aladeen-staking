"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const src_1 = require("../../src");
const accounts_1 = require("../../src/programs/groupRewardDistributor/accounts");
const pda_1 = require("../../src/programs/groupRewardDistributor/pda");
const accounts_2 = require("../../src/programs/rewardDistributor/accounts");
const pda_2 = require("../../src/programs/rewardDistributor/pda");
const transaction_1 = require("../../src/programs/rewardDistributor/transaction");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_3 = require("../../src/programs/stakePool/accounts");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
// reward distributor with mint youre are not authority
describe("Group stake and claim rewards", () => {
    let provider;
    let originalMintTokenAccountId;
    let originalMintId;
    let originalMint2TokenAccountId;
    let originalMintId2;
    let rewardMintId;
    let groupRewardMintId;
    let stakePoolId;
    let groupRewardDistributorId;
    let groupStakeEntryId;
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        // original mint
        const mintAuthority = await (0, utils_2.newAccountWithLamports)(provider.connection);
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMasterEdition)(provider.connection, new anchor_1.Wallet(mintAuthority), { target: provider.wallet.publicKey });
        // original mint 2
        [originalMint2TokenAccountId, originalMintId2] = await (0, utils_2.createMasterEdition)(provider.connection, new anchor_1.Wallet(mintAuthority), { target: provider.wallet.publicKey });
        // reward mint
        [, rewardMintId] = await (0, utils_2.createMint)(provider.connection, provider.wallet);
        [, groupRewardMintId] = await (0, utils_2.createMint)(provider.connection, provider.wallet);
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
        const rewardDistributorId = (0, pda_2.findRewardDistributorId)(stakePoolId, new bn_js_1.BN(0));
        const rewardDistributorData = await (0, accounts_2.getRewardDistributor)(provider.connection, rewardDistributorId);
        expect(rewardDistributorData.parsed.rewardMint.toString()).toEqual(rewardMintId.toString());
        expect(rewardDistributorData.parsed.rewardMint.toString()).toEqual(rewardMintId.toString());
    });
    it("Create Group Reward Distributor", async () => {
        const [transaction, rewardDistributorId] = await (0, src_1.createGroupRewardDistributor)(provider.connection, provider.wallet, {
            authorizedPools: [stakePoolId],
            rewardMintId: groupRewardMintId,
        });
        groupRewardDistributorId = rewardDistributorId;
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const rewardDistributorData = await (0, accounts_1.getGroupRewardDistributor)(provider.connection, rewardDistributorId);
        expect(rewardDistributorData.parsed.rewardMint.toString()).toEqual(groupRewardMintId.toString());
        expect(rewardDistributorData.parsed.rewardMint.toString()).toEqual(groupRewardMintId.toString());
    });
    it("Create Reward Entry", async () => {
        const rewardDistributorId = (0, pda_2.findRewardDistributorId)(stakePoolId, new bn_js_1.BN(0));
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const transaction = await (0, src_1.initializeRewardEntry)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const rewardEntryId = (0, pda_2.findRewardEntryId)(rewardDistributorId, stakeEntryId);
        const rewardEntryData = await (0, accounts_2.getRewardEntry)(provider.connection, rewardEntryId);
        expect(rewardEntryData.parsed.rewardDistributor.toString()).toEqual(rewardDistributorId.toString());
        expect(rewardEntryData.parsed.stakeEntry.toString()).toEqual(stakeEntryId.toString());
    });
    it("Create Reward Entry 2", async () => {
        const rewardDistributorId = (0, pda_2.findRewardDistributorId)(stakePoolId, new bn_js_1.BN(0));
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId2);
        const transaction = await (0, src_1.initializeRewardEntry)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            originalMintId: originalMintId2,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const rewardEntryId = (0, pda_2.findRewardEntryId)(rewardDistributorId, stakeEntryId);
        const rewardEntryData = await (0, accounts_2.getRewardEntry)(provider.connection, rewardEntryId);
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
        const stakeEntryData = await (0, accounts_3.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(true);
    });
    it("Stake2", async () => {
        const transaction = await (0, src_1.stake)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId2,
            userOriginalMintTokenAccountId: originalMint2TokenAccountId,
            receiptType: stakePool_1.ReceiptType.Original,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_3.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId2));
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId2, provider.wallet.publicKey, true);
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(true);
    });
    it("Create Group Stake Entry", async () => {
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const stakeEntryId2 = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId2);
        const [transaction, groupEntryId] = await (0, src_1.createGroupEntry)(provider.connection, provider.wallet, {
            stakeEntryIds: [stakeEntryId, stakeEntryId2],
        });
        groupStakeEntryId = groupEntryId;
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const groupStakeEntryData = await (0, accounts_3.getGroupStakeEntry)(provider.connection, groupEntryId);
        expect(groupStakeEntryData.parsed.stakeEntries.length).toEqual(2);
        for (const id of [stakeEntryId, stakeEntryId2]) {
            const stakeEntry = await (0, accounts_3.getStakeEntry)(provider.connection, id);
            expect(stakeEntry.parsed.grouped).toEqual(true);
        }
    });
    it("Claim Group Rewards", async () => {
        await (0, utils_2.delay)(2000);
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const stakeEntryId2 = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId2);
        const oldGroupStakeEntryData = await (0, accounts_3.getGroupStakeEntry)(provider.connection, groupStakeEntryId);
        const groupRewardEntryId = (0, pda_1.findGroupRewardEntryId)(groupRewardDistributorId, groupStakeEntryId);
        const [transaction] = await (0, src_1.claimGroupRewards)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            groupRewardDistributorId,
            groupEntryId: groupStakeEntryId,
            stakeEntryIds: [stakeEntryId, stakeEntryId2],
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const newGroupStakeEntryData = await (0, accounts_3.getGroupStakeEntry)(provider.connection, groupStakeEntryId);
        const groupRewardEntryData = await (0, accounts_1.getGroupRewardEntry)(provider.connection, groupRewardEntryId);
        expect(newGroupStakeEntryData.parsed.changedAt.toNumber()).toEqual(oldGroupStakeEntryData.parsed.changedAt.toNumber());
        expect(groupRewardEntryData.parsed.rewardSecondsReceived.toNumber()).toBeGreaterThan(1);
        const userGroupRewardMintTokenAccountId = await (0, common_1.findAta)(groupRewardMintId, provider.wallet.publicKey, true);
        const checkUserRewardTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userGroupRewardMintTokenAccountId);
        expect(Number(checkUserRewardTokenAccount.amount)).toBeGreaterThan(1);
    });
    it("Start cooldown period", async () => {
        const [transaction] = await (0, src_1.initUngrouping)(provider.connection, provider.wallet, {
            groupEntryId: groupStakeEntryId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const groupStakeEntryData = await (0, accounts_3.getGroupStakeEntry)(provider.connection, groupStakeEntryId);
        expect(groupStakeEntryData.parsed.groupCooldownStartSeconds).not.toBeNull();
    });
    it("Close group", async () => {
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const stakeEntryId2 = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId2);
        const [transaction] = await (0, src_1.closeGroupEntry)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            groupEntryId: groupStakeEntryId,
            groupRewardDistributorId,
            stakeEntryIds: [stakeEntryId, stakeEntryId2],
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const userGroupRewardMintTokenAccountId = await (0, common_1.findAta)(groupRewardMintId, provider.wallet.publicKey, true);
        const checkUserRewardTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userGroupRewardMintTokenAccountId);
        expect(Number(checkUserRewardTokenAccount.amount)).toBeGreaterThan(1);
        for (const id of [stakeEntryId, stakeEntryId2]) {
            const stakeEntry = await (0, accounts_3.getStakeEntry)(provider.connection, id);
            expect(stakeEntry.parsed.grouped).toEqual(false);
        }
    });
    it("Unstake", async () => {
        const transaction = await (0, src_1.unstake)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_3.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
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
    it("Unstake2", async () => {
        const transaction = await (0, src_1.unstake)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            originalMintId: originalMintId2,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_3.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId2));
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(web3_js_1.PublicKey.default.toString());
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId2, provider.wallet.publicKey, true);
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(false);
        const stakeEntryOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId2, stakeEntryData.pubkey, true);
        const userRewardMintTokenAccountId = await (0, common_1.findAta)(rewardMintId, provider.wallet.publicKey, true);
        const checkStakeEntryOriginalMintTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, stakeEntryOriginalMintTokenAccountId);
        expect(Number(checkStakeEntryOriginalMintTokenAccount.amount)).toEqual(0);
        const checkUserRewardTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userRewardMintTokenAccountId);
        expect(Number(checkUserRewardTokenAccount.amount)).toBeGreaterThan(1);
    });
});
//# sourceMappingURL=group-stake-claim-rewards.test.js.map