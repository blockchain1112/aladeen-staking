"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const src_1 = require("../../src");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_1 = require("../../src/programs/stakePool/accounts");
const transaction_1 = require("../../src/programs/stakePool/transaction");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
describe("Group stake ungroup", () => {
    let provider;
    let mintId1;
    let mintId2;
    let mintId3;
    let mintId4;
    let mintId5;
    let mintId6;
    let stakePoolId;
    let groupStakeEntryId;
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        const mintAuthority = await (0, utils_2.newAccountWithLamports)(provider.connection);
        // mint1
        [, mintId1] = await (0, utils_2.createMasterEdition)(provider.connection, new anchor_1.Wallet(mintAuthority), { target: provider.wallet.publicKey });
        // mint2
        [, mintId2] = await (0, utils_2.createMasterEdition)(provider.connection, new anchor_1.Wallet(mintAuthority), { target: provider.wallet.publicKey });
        // mint3
        [, mintId3] = await (0, utils_2.createMasterEdition)(provider.connection, new anchor_1.Wallet(mintAuthority), { target: provider.wallet.publicKey });
        // mint4
        [, mintId4] = await (0, utils_2.createMasterEdition)(provider.connection, new anchor_1.Wallet(mintAuthority), { target: provider.wallet.publicKey });
        // mint5
        [, mintId5] = await (0, utils_2.createMasterEdition)(provider.connection, new anchor_1.Wallet(mintAuthority), { target: provider.wallet.publicKey });
        // mint6
        [, mintId6] = await (0, utils_2.createMasterEdition)(provider.connection, new anchor_1.Wallet(mintAuthority), { target: provider.wallet.publicKey });
    });
    it("Create Pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {});
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    it("Stake all", async () => {
        const mintIds = [mintId1, mintId2, mintId3, mintId4, mintId5, mintId6];
        for (let i = 0; i < mintIds.length; i++) {
            const mintId = mintIds[i];
            const userTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(mintId, provider.wallet.publicKey, true);
            const transaction = await (0, src_1.stake)(provider.connection, provider.wallet, {
                stakePoolId: stakePoolId,
                originalMintId: mintId,
                userOriginalMintTokenAccountId: userTokenAccountId,
                receiptType: stakePool_1.ReceiptType.Original,
            });
            await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
            const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, mintId));
            expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
            expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
            const userTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userTokenAccountId);
            expect(Number(userTokenAccount.amount)).toEqual(1);
            expect(userTokenAccount.isFrozen).toEqual(true);
        }
    });
    it("Create Group Stake Entry", async () => {
        const mindIds = [mintId1, mintId2, mintId3, mintId4, mintId5, mintId6];
        const stakeEntryIds = await Promise.all(mindIds.map((mintId) => (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, mintId)));
        const [transaction, groupEntryId] = await (0, src_1.createGroupEntry)(provider.connection, provider.wallet, {
            stakeEntryIds,
        });
        groupStakeEntryId = groupEntryId;
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const groupStakeEntryData = await (0, accounts_1.getGroupStakeEntry)(provider.connection, groupEntryId);
        expect(groupStakeEntryData.parsed.stakeEntries.length).toEqual(stakeEntryIds.length);
        for (const id of stakeEntryIds) {
            const stakeEntry = await (0, accounts_1.getStakeEntry)(provider.connection, id);
            expect(stakeEntry.parsed.grouped).toEqual(true);
        }
    });
    it("Start cooldown period", async () => {
        const [transaction] = await (0, src_1.initUngrouping)(provider.connection, provider.wallet, {
            groupEntryId: groupStakeEntryId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const groupStakeEntryData = await (0, accounts_1.getGroupStakeEntry)(provider.connection, groupStakeEntryId);
        expect(groupStakeEntryData.parsed.groupCooldownStartSeconds).not.toBeNull();
    });
    it("Remove 1 from group", async () => {
        const mintId = mintId1;
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, mintId);
        const [transaction] = await (0, transaction_1.withRemoveFromGroupEntry)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
            groupEntryId: groupStakeEntryId,
            stakeEntryId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const groupStakeEntryData = await (0, accounts_1.getGroupStakeEntry)(provider.connection, groupStakeEntryId);
        expect(groupStakeEntryData.parsed.stakeEntries.length).toEqual(5);
        const stakeEntry = await (0, accounts_1.getStakeEntry)(provider.connection, stakeEntryId);
        expect(stakeEntry.parsed.grouped).toEqual(false);
    });
    it("Remove remaining from group", async () => {
        const mintIds = [mintId2, mintId3, mintId4, mintId5];
        for (let i = 0; i < mintIds.length; i++) {
            const mintId = mintIds[i];
            const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, mintId);
            const [transaction] = await (0, transaction_1.withRemoveFromGroupEntry)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
                groupEntryId: groupStakeEntryId,
                stakeEntryId,
            });
            await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
            const groupStakeEntryData = await (0, accounts_1.getGroupStakeEntry)(provider.connection, groupStakeEntryId);
            expect(groupStakeEntryData.parsed.stakeEntries.length).toEqual(mintIds.length - i);
            const stakeEntry = await (0, accounts_1.getStakeEntry)(provider.connection, stakeEntryId);
            expect(stakeEntry.parsed.grouped).toEqual(false);
        }
    });
    it("Remove last from group", async () => {
        const mintId = mintId6;
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, mintId);
        const [transaction] = await (0, transaction_1.withRemoveFromGroupEntry)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
            groupEntryId: groupStakeEntryId,
            stakeEntryId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        await expect(async () => {
            await (0, accounts_1.getGroupStakeEntry)(provider.connection, groupStakeEntryId);
        }).rejects.toThrow(new Error(`Account does not exist ${groupStakeEntryId.toBase58()}`));
        const stakeEntry = await (0, accounts_1.getStakeEntry)(provider.connection, stakeEntryId);
        expect(stakeEntry.parsed.grouped).toEqual(false);
    });
});
//# sourceMappingURL=group-stake-ungroup.test.js.map