"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const wrappedSol_1 = require("@cardinal/token-manager/dist/cjs/wrappedSol");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const src_1 = require("../../src");
const rewardDistributor_1 = require("../../src/programs/rewardDistributor");
const accounts_1 = require("../../src/programs/rewardDistributor/accounts");
const pda_1 = require("../../src/programs/rewardDistributor/pda");
const transaction_1 = require("../../src/programs/rewardDistributor/transaction");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_2 = require("../../src/programs/stakePool/accounts");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
describe("Stake and claim rewards from treasury", () => {
    const maxSupply = 5; // 5 wsol
    let provider;
    let stakePoolId;
    let stakeMintKeypair;
    let originalMintId;
    const rewardMint = new web3_js_1.PublicKey("So11111111111111111111111111111111111111112");
    let originalMintTokenAccountId;
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        // original mint
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMint)(provider.connection, provider.wallet, { amount: 1 });
    });
    it("Create Pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {});
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    it("Create Reward Distributor", async () => {
        const transaction = new web3_js_1.Transaction();
        // wrapped sol to creator
        await (0, wrappedSol_1.withWrapSol)(transaction, provider.connection, provider.wallet, maxSupply * web3_js_1.LAMPORTS_PER_SOL);
        await (0, transaction_1.withInitRewardDistributor)(transaction, provider.connection, provider.wallet, {
            distributorId: new anchor_1.BN(0),
            stakePoolId: stakePoolId,
            rewardMintId: rewardMint,
            rewardAmount: new anchor_1.BN(1 * web3_js_1.LAMPORTS_PER_SOL),
            rewardDurationSeconds: new anchor_1.BN(2),
            kind: rewardDistributor_1.RewardDistributorKind.Treasury,
            maxSupply: new anchor_1.BN(maxSupply * web3_js_1.LAMPORTS_PER_SOL),
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, new anchor_1.BN(0));
        const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(provider.connection, rewardDistributorId);
        expect(rewardDistributorData.parsed.rewardMint.toString()).toEqual(rewardMint.toString());
        expect(rewardDistributorData.parsed.rewardMint.toString()).toEqual(rewardMint.toString());
        expect(rewardDistributorData.parsed.rewardMint.toString()).toEqual(rewardMint.toString());
    });
    it("Init stake entry and mint", async () => {
        var _a;
        let transaction;
        [transaction, , stakeMintKeypair] = await (0, src_1.createStakeEntryAndStakeMint)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet, { signers: stakeMintKeypair ? [stakeMintKeypair] : [] });
        const stakeEntryData = await (0, accounts_2.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
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
        const stakeEntryData = await (0, accounts_2.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        if (stakeMintKeypair) {
            const userReceiptMintTokenAccountId = await (0, common_1.findAta)(stakeMintKeypair.publicKey, provider.wallet.publicKey, true);
            expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
            expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
            const checkUserReceiptMintTokenAccountId = await (0, spl_token_1.getAccount)(provider.connection, userReceiptMintTokenAccountId);
            expect(Number(checkUserReceiptMintTokenAccountId.amount)).toEqual(1);
            expect(checkUserReceiptMintTokenAccountId.isFrozen).toEqual(true);
        }
    });
    it("Claim Rewards", async () => {
        await (0, utils_2.delay)(6000);
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const userRewardMintTokenAccountId = await (0, common_1.findAta)(rewardMint, provider.wallet.publicKey, true);
        let beforeAmount = 0;
        try {
            beforeAmount = Number((await (0, spl_token_1.getAccount)(provider.connection, userRewardMintTokenAccountId))
                .amount);
        }
        catch (e) {
            beforeAmount = 0;
        }
        const transaction = await (0, src_1.claimRewards)(provider.connection, provider.wallet, {
            distributorId: new anchor_1.BN(0),
            stakePoolId: stakePoolId,
            stakeEntryId: stakeEntryId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const afterCheckUserRewardMintTokenAccountId = await (0, spl_token_1.getAccount)(provider.connection, userRewardMintTokenAccountId);
        expect(Number(afterCheckUserRewardMintTokenAccountId.amount)).toEqual(beforeAmount + 3000000000);
    });
});
//# sourceMappingURL=stake-treasury-max-supply.test.js.map