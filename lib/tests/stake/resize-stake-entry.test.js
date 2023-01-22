"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
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
describe("Resize stake entry", () => {
    (0, globals_1.beforeAll)(async () => {
        provider = await (0, workspace_1.getProvider)();
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMasterEdition)(provider.connection, provider.wallet);
    });
    it("Create Pool", async () => {
        let tx;
        [tx, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {});
        await (0, utils_2.executeTransaction)(provider.connection, tx, provider.wallet);
    });
    it("Stake", async () => {
        const tx = await (0, src_1.stake)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
            userOriginalMintTokenAccountId: originalMintTokenAccountId,
            receiptType: stakePool_1.ReceiptType.Original,
        });
        await (0, utils_2.executeTransaction)(provider.connection, tx, provider.wallet);
        const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        const userOriginalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, provider.wallet.publicKey, true);
        (0, globals_1.expect)(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        (0, globals_1.expect)(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        (0, globals_1.expect)(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
        (0, globals_1.expect)(checkUserOriginalTokenAccount.isFrozen).toEqual(true);
    });
    it("Resize", async () => {
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const tx = new web3_js_1.Transaction().add(await (0, stakePool_1.stakePoolProgram)(provider.connection, provider.wallet)
            .methods.stakeEntryResize()
            .accounts({
            stakeEntry: stakeEntryId,
            payer: provider.wallet.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .instruction());
        await (0, utils_2.executeTransaction)(provider.connection, tx, provider.wallet);
    });
});
//# sourceMappingURL=resize-stake-entry.test.js.map