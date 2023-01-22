"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const src_1 = require("../../src");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_1 = require("../../src/programs/stakePool/accounts");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
describe("Create stake pool", () => {
    let provider;
    const overlayText = "staking";
    let originalMintTokenAccountId;
    let originalMintId;
    let originalMintAuthorityId;
    let stakePoolId;
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        // original mint
        const originalMintAuthority = await (0, utils_2.newAccountWithLamports)(provider.connection);
        originalMintAuthorityId = originalMintAuthority.publicKey;
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMasterEdition)(provider.connection, new anchor_1.Wallet(originalMintAuthority), { target: provider.wallet.publicKey });
    });
    it("Create Pool", async () => {
        var _a;
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {
            overlayText: overlayText,
            requiresCreators: [originalMintAuthorityId],
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakePoolData = await (0, accounts_1.getStakePool)(provider.connection, stakePoolId);
        expect((_a = stakePoolData.parsed.requiresCreators[0]) === null || _a === void 0 ? void 0 : _a.toString()).toEqual(originalMintAuthorityId.toString());
    });
    it("Init stake entry for pool", async () => {
        const [transaction, _] = await (0, src_1.createStakeEntry)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        expect(stakeEntryData.parsed.originalMint.toString()).toEqual(originalMintId.toString());
        expect(stakeEntryData.parsed.pool.toString()).toEqual(stakePoolId.toString());
        expect(stakeEntryData.parsed.stakeMint).toEqual(null);
    });
    it("Stake successs", async () => {
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
});
//# sourceMappingURL=creator-allowlist.test.js.map