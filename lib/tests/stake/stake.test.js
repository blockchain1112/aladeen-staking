"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const globals_1 = require("@jest/globals");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = tslib_1.__importDefault(require("bn.js"));
const src_1 = require("../../src");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_1 = require("../../src/programs/stakePool/accounts");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
let provider;
let originalMintTokenAccountId;
let originalMintId;
let stakePoolId;
describe("Stake unstake", () => {
    (0, globals_1.beforeAll)(async () => {
        provider = await (0, workspace_1.getProvider)();
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMasterEdition)(provider.connection, provider.wallet);
    });
    (0, globals_1.test)("Create Pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {});
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    (0, globals_1.test)("Stake", async () => {
        await (0, utils_2.executeTransaction)(provider.connection, await (0, src_1.stake)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId,
            userOriginalMintTokenAccountId: originalMintTokenAccountId,
            receiptType: stakePool_1.ReceiptType.Original,
        }), provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        const userOriginalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, provider.wallet.publicKey, true);
        (0, globals_1.expect)(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        (0, globals_1.expect)(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        (0, globals_1.expect)(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        (0, globals_1.expect)(checkUserOriginalTokenAccount.isFrozen).toEqual(true);
    });
    (0, globals_1.test)("Unstake", async () => {
        await (0, utils_2.executeTransaction)(provider.connection, await (0, src_1.unstake)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.default(0),
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        }), provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        (0, globals_1.expect)(stakeEntryData.parsed.lastStaker.toString()).toEqual(web3_js_1.PublicKey.default.toString());
        (0, globals_1.expect)(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        const userOriginalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, provider.wallet.publicKey, true);
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        (0, globals_1.expect)(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        (0, globals_1.expect)(checkUserOriginalTokenAccount.isFrozen).toEqual(false);
    });
});
//# sourceMappingURL=stake.test.js.map