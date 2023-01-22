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
const transaction_1 = require("../../src/programs/stakePool/transaction");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
let provider;
let originalMintTokenAccountId;
let originalMintId;
let stakePoolId;
describe("Stake receipt none", () => {
    (0, globals_1.beforeAll)(async () => {
        provider = await (0, workspace_1.getProvider)();
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMasterEdition)(provider.connection, provider.wallet);
    });
    it("Create Pool", async () => {
        const tx = new web3_js_1.Transaction();
        [, stakePoolId] = await (0, transaction_1.withInitStakePool)(tx, provider.connection, provider.wallet, {});
        await (0, utils_2.executeTransaction)(provider.connection, tx, provider.wallet);
    });
    it("Init stake entry", async () => {
        await (0, utils_2.executeTransaction)(provider.connection, (await (0, src_1.createStakeEntry)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        }))[0], provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        (0, globals_1.expect)(stakeEntryData.parsed.originalMint.toString()).toEqual(originalMintId.toString());
        (0, globals_1.expect)(stakeEntryData.parsed.pool.toString()).toEqual(stakePoolId.toString());
    });
    it("Stake", async () => {
        await (0, utils_2.executeTransaction)(provider.connection, await (0, src_1.stake)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
            userOriginalMintTokenAccountId: originalMintTokenAccountId,
            receiptType: stakePool_1.ReceiptType.None,
        }), provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        const userOriginalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, provider.wallet.publicKey, true);
        const stakeEntryOriginalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, stakeEntryData.pubkey, true);
        (0, globals_1.expect)(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        (0, globals_1.expect)(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        (0, globals_1.expect)(Number(checkUserOriginalTokenAccount.amount)).toEqual(0);
        const checkStakeEntryOriginalMintTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, stakeEntryOriginalMintTokenAccountId);
        (0, globals_1.expect)(Number(checkStakeEntryOriginalMintTokenAccount.amount)).toEqual(1);
    });
    it("Unstake", async () => {
        await (0, utils_2.executeTransaction)(provider.connection, await (0, src_1.unstake)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.default(0),
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        }), provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        const userOriginalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, provider.wallet.publicKey, true);
        const stakeEntryOriginalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, stakeEntryData.pubkey, true);
        (0, globals_1.expect)(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        (0, globals_1.expect)(stakeEntryData.parsed.lastStaker.toString()).toEqual(web3_js_1.PublicKey.default.toString());
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        (0, globals_1.expect)(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        const checkStakeEntryOriginalMintTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, stakeEntryOriginalMintTokenAccountId);
        (0, globals_1.expect)(Number(checkStakeEntryOriginalMintTokenAccount.amount)).toEqual(0);
    });
});
//# sourceMappingURL=stake-receipt-none.test.js.map