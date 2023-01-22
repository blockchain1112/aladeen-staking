"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const src_1 = require("../../src");
const accounts_1 = require("../../src/programs/stakePool/accounts");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
describe("Create stake pool", () => {
    let provider;
    let stakePoolId;
    let originalMintTokenAccountId;
    let originalMintId;
    const stakingAmount = 10;
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        // original mint
        const mintAuthority = await (0, utils_2.newAccountWithLamports)(provider.connection);
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMint)(provider.connection, new anchor_1.Wallet(mintAuthority), { target: provider.wallet.publicKey, amount: stakingAmount });
    });
    it("Create Pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {
            cooldownSeconds: 10,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    it("Stake half", async () => {
        const transaction = await (0, src_1.stake)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
            userOriginalMintTokenAccountId: originalMintTokenAccountId,
            amount: new anchor_1.BN(stakingAmount / 2),
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        const stakeEntryOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, stakeEntryData.pubkey, true);
        expect(stakeEntryData.parsed.amount.toNumber()).toEqual(stakingAmount / 2);
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(stakingAmount / 2);
        const checkStakeEntryOriginalMintTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, stakeEntryOriginalMintTokenAccountId);
        expect(Number(checkStakeEntryOriginalMintTokenAccount.amount)).toEqual(stakingAmount / 2);
    });
    it("Unstake", async () => {
        var _a;
        const transaction = await (0, src_1.unstake)(provider.connection, provider.wallet, {
            distributorId: new anchor_1.BN(0),
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        const stakeEntryOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, stakeEntryData.pubkey, true);
        expect((_a = stakeEntryData.parsed.cooldownStartSeconds) === null || _a === void 0 ? void 0 : _a.toNumber()).toBeGreaterThan(0);
        expect(stakeEntryData.parsed.amount.toNumber()).toEqual(stakingAmount / 2);
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(stakingAmount / 2);
        const checkStakeEntryOriginalMintTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, stakeEntryOriginalMintTokenAccountId);
        expect(Number(checkStakeEntryOriginalMintTokenAccount.amount)).toEqual(stakingAmount / 2);
    });
});
//# sourceMappingURL=fungible-staking-add-during-cooldown.test.js.map