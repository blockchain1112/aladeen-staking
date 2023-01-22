"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@cardinal/common");
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
beforeAll(async () => {
    provider = await (0, workspace_1.getProvider)();
    const mintKeypair = web3_js_1.Keypair.generate();
    originalMintId = mintKeypair.publicKey;
    originalMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(originalMintId, provider.wallet.publicKey);
    await (0, utils_2.executeTransaction)(provider.connection, await (0, utils_2.createMasterEditionTx)(provider.connection, mintKeypair.publicKey, provider.wallet.publicKey), provider.wallet, { signers: [mintKeypair] });
});
it("Create Pool", async () => {
    const transaction = new web3_js_1.Transaction();
    [, stakePoolId] = await (0, transaction_1.withInitStakePool)(transaction, provider.connection, provider.wallet, {});
    await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
});
it("Init stake entry and mint", async () => {
    var _a;
    const [transaction, , stakeMintKeypair] = await (0, src_1.createStakeEntryAndStakeMint)(provider.connection, provider.wallet, {
        stakePoolId: stakePoolId,
        originalMintId: originalMintId,
    });
    await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet, {
        signers: stakeMintKeypair ? [stakeMintKeypair] : [],
    });
    const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
    expect(stakeEntryData.parsed.originalMint.toString()).toEqual(originalMintId.toString());
    expect(stakeEntryData.parsed.pool.toString()).toEqual(stakePoolId.toString());
    expect((_a = stakeEntryData.parsed.stakeMint) === null || _a === void 0 ? void 0 : _a.toString()).toEqual(stakeMintKeypair === null || stakeMintKeypair === void 0 ? void 0 : stakeMintKeypair.publicKey.toString());
});
it("Stake", async () => {
    const transaction = await (0, src_1.stake)(provider.connection, provider.wallet, {
        stakePoolId: stakePoolId,
        originalMintId: originalMintId,
        userOriginalMintTokenAccountId: originalMintTokenAccountId,
        receiptType: stakePool_1.ReceiptType.Receipt,
    });
    await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
    const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
    const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
    if (!stakeEntryData.parsed.stakeMint) {
        throw new Error("Receipt mint keypair is null");
    }
    const stakeEntryOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, stakeEntryData.pubkey, true);
    expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
    expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
    const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
    expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(0);
    const checkStakeEntryOriginalMintTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, stakeEntryOriginalMintTokenAccountId);
    expect(Number(checkStakeEntryOriginalMintTokenAccount.amount)).toEqual(1);
});
it("Unstake", async () => {
    const transaction = await (0, src_1.unstake)(provider.connection, provider.wallet, {
        distributorId: new bn_js_1.default(0),
        stakePoolId: stakePoolId,
        originalMintId: originalMintId,
    });
    await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
    const stakeEntryData = await (0, accounts_1.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
    const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
    if (!stakeEntryData.parsed.stakeMint) {
        throw new Error("Receipt mint keypair is null");
    }
    const userReceiptMintTokenAccountId = await (0, common_1.findAta)(stakeEntryData.parsed.stakeMint, provider.wallet.publicKey, true);
    const stakeEntryOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, stakeEntryData.pubkey, true);
    const stakeEntryReceiptMintTokenAccountId = await (0, common_1.findAta)(stakeEntryData.parsed.stakeMint, stakeEntryData.pubkey, true);
    expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
    expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(web3_js_1.PublicKey.default.toString());
    const checkUserReceiptMintTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userReceiptMintTokenAccountId);
    expect(Number(checkUserReceiptMintTokenAccount.amount)).toEqual(0);
    const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
    expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(1);
    const checkStakeEntryOriginalMintTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, stakeEntryOriginalMintTokenAccountId);
    expect(Number(checkStakeEntryOriginalMintTokenAccount.amount)).toEqual(0);
    const checkStakeEntryReceiptMintTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, stakeEntryReceiptMintTokenAccountId);
    expect(Number(checkStakeEntryReceiptMintTokenAccount.amount)).toEqual(1);
});
//# sourceMappingURL=stake-receipts.test.js.map