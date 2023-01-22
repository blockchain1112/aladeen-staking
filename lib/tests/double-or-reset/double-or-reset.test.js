"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const src_1 = require("../../src");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_1 = require("../../src/programs/stakePool/accounts");
const transaction_1 = require("../../src/programs/stakePool/transaction");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
describe("Create stake pool", () => {
    let provider;
    let stakePoolId;
    let originalMintTokenAccountId;
    let originalMintId;
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        // original mint
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMasterEdition)(provider.connection, provider.wallet);
    });
    it("Create Pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {
            doubleOrResetEnabled: true,
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
    it("Double or reset", async () => {
        var _a, _b, _c, _d;
        await (0, utils_2.delay)(2000);
        const transaction = await (0, transaction_1.withDoubleOrResetTotalStakeSeconds)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            stakeEntryId: await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId),
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        expect((_a = stakeEntryData.parsed.lastUpdatedAt) === null || _a === void 0 ? void 0 : _a.toNumber()).toBeGreaterThan(0);
        if (!(((_b = stakeEntryData.parsed.totalStakeSeconds) === null || _b === void 0 ? void 0 : _b.toNumber()) === 0 ||
            ((_c = stakeEntryData.parsed.totalStakeSeconds) === null || _c === void 0 ? void 0 : _c.toNumber()) >= 4)) {
            throw `Invalid double or nothing value: ${(_d = stakeEntryData.parsed.totalStakeSeconds) === null || _d === void 0 ? void 0 : _d.toNumber()}`;
        }
    });
});
//# sourceMappingURL=double-or-reset.test.js.map