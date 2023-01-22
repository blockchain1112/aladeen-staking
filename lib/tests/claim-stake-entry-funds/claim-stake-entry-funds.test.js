"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const globals_1 = require("@jest/globals");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const src_1 = require("../../src");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_1 = require("../../src/programs/stakePool/accounts");
const pda_1 = require("../../src/programs/stakePool/pda");
const transaction_1 = require("../../src/programs/stakePool/transaction");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
let provider;
let originalMintTokenAccountId;
let originalMintId;
let stakePoolId;
let customPaymentMint;
const initialSupply = 100000;
const transferAmount = 100;
describe("Claim stake entry funds", () => {
    (0, globals_1.beforeAll)(async () => {
        provider = await (0, workspace_1.getProvider)();
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMasterEdition)(provider.connection, provider.wallet);
        [, customPaymentMint] = await (0, common_1.createMint)(provider.connection, provider.wallet, { amount: initialSupply });
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
    (0, globals_1.test)("Sends funds to stake entry", async () => {
        const transaction = new web3_js_1.Transaction();
        const stakeEntryId = (0, pda_1.findStakeEntryId)(provider.wallet.publicKey, stakePoolId, originalMintId, false);
        const stakeEntryAtaId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, provider.connection, customPaymentMint, stakeEntryId, provider.wallet.publicKey, true);
        const authorityAtaId = await (0, common_1.findAta)(customPaymentMint, provider.wallet.publicKey, true);
        transaction.add((0, spl_token_1.createTransferCheckedInstruction)(authorityAtaId, customPaymentMint, stakeEntryAtaId, provider.wallet.publicKey, transferAmount, 0));
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const accountInfo = await (0, spl_token_1.getAccount)(provider.connection, stakeEntryAtaId);
        (0, globals_1.expect)(accountInfo.amount.toString()).toEqual(transferAmount.toString());
    });
    (0, globals_1.test)("Claim funds from stake entry", async () => {
        const transaction = new web3_js_1.Transaction();
        const stakeEntryId = (0, pda_1.findStakeEntryId)(provider.wallet.publicKey, stakePoolId, originalMintId, false);
        const authorityAtaId = await (0, common_1.findAta)(customPaymentMint, provider.wallet.publicKey, true);
        const beforeAccountData = await (0, spl_token_1.getAccount)(provider.connection, authorityAtaId);
        (0, globals_1.expect)(beforeAccountData.amount.toString()).toEqual((initialSupply - transferAmount).toString());
        await (0, transaction_1.withClaimStakeEntryFunds)(transaction, provider.connection, provider.wallet, stakeEntryId, customPaymentMint);
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const afterAccountData = await (0, spl_token_1.getAccount)(provider.connection, authorityAtaId);
        (0, globals_1.expect)(afterAccountData.amount.toString()).toEqual(initialSupply.toString());
    });
});
//# sourceMappingURL=claim-stake-entry-funds.test.js.map