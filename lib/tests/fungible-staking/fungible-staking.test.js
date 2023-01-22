"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const console_1 = require("console");
const src_1 = require("../../src");
const rewardDistributor_1 = require("../../src/programs/rewardDistributor");
const accounts_1 = require("../../src/programs/rewardDistributor/accounts");
const pda_1 = require("../../src/programs/rewardDistributor/pda");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_2 = require("../../src/programs/stakePool/accounts");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
describe("Create stake pool", () => {
    let provider;
    let stakePoolId;
    let originalMintTokenAccountId;
    let originalMintId;
    let rewardMintId;
    const maxSupply = 100;
    const stakingAmount = 10;
    let stakeMintKeypair;
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        // original mint
        const mintAuthority = await (0, utils_2.newAccountWithLamports)(provider.connection);
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMint)(provider.connection, new anchor_1.Wallet(mintAuthority), { target: provider.wallet.publicKey, amount: stakingAmount });
        // reward mint
        [, rewardMintId] = await (0, utils_2.createMint)(provider.connection, new anchor_1.Wallet(mintAuthority), { target: provider.wallet.publicKey, amount: maxSupply });
    });
    it("Create Pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {});
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    it("Create Reward Distributor", async () => {
        const transaction = new web3_js_1.Transaction();
        await src_1.rewardDistributor.transaction.withInitRewardDistributor(transaction, provider.connection, provider.wallet, {
            distributorId: new anchor_1.BN(0),
            stakePoolId: stakePoolId,
            rewardMintId: rewardMintId,
            kind: rewardDistributor_1.RewardDistributorKind.Treasury,
            maxSupply: new anchor_1.BN(maxSupply),
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, new anchor_1.BN(0));
        const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(provider.connection, rewardDistributorId);
        expect(rewardDistributorData.parsed.rewardMint.toString()).toEqual(rewardMintId.toString());
    });
    it("Init Reward Entry", async () => {
        const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, new anchor_1.BN(0));
        const transaction = await (0, src_1.initializeRewardEntry)(provider.connection, provider.wallet, {
            distributorId: new anchor_1.BN(0),
            originalMintId: originalMintId,
            stakePoolId: stakePoolId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(provider.connection, rewardDistributorId);
        expect(rewardDistributorData.parsed.rewardMint.toString()).toEqual(rewardMintId.toString());
    });
    it("Init fungible stake entry and stake mint", async () => {
        var _a;
        let transaction;
        [transaction, , stakeMintKeypair] = await (0, src_1.createStakeEntryAndStakeMint)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet, {
            signers: stakeMintKeypair ? [stakeMintKeypair] : [],
        });
        const stakeEntryData = await (0, accounts_2.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        expect(stakeEntryData.parsed.originalMint.toString()).toEqual(originalMintId.toString());
        expect(stakeEntryData.parsed.pool.toString()).toEqual(stakePoolId.toString());
        if (stakeMintKeypair) {
            expect((_a = stakeEntryData.parsed.stakeMint) === null || _a === void 0 ? void 0 : _a.toString()).toEqual(stakeMintKeypair.publicKey.toString());
            expect((await (0, spl_token_1.getMint)(provider.connection, stakeMintKeypair.publicKey))
                .isInitialized).toBeTruthy();
        }
    });
    it("Stake half", async () => {
        const transaction = await (0, src_1.stake)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
            userOriginalMintTokenAccountId: originalMintTokenAccountId,
            receiptType: stakePool_1.ReceiptType.Receipt,
            amount: new anchor_1.BN(stakingAmount / 2),
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_2.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        const stakeEntryOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, stakeEntryData.pubkey, true);
        if (stakeMintKeypair) {
            const userReceiptTokenAccountId = await (0, common_1.findAta)(stakeMintKeypair.publicKey, provider.wallet.publicKey, true);
            expect(stakeEntryData.parsed.amount.toNumber()).toEqual(stakingAmount / 2);
            expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
            expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(provider.wallet.publicKey.toString());
            const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
            expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(stakingAmount / 2);
            const checkStakeEntryOriginalMintTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, stakeEntryOriginalMintTokenAccountId);
            expect(Number(checkStakeEntryOriginalMintTokenAccount.amount)).toEqual(stakingAmount / 2);
            const userReceiptTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userReceiptTokenAccountId);
            expect(Number(userReceiptTokenAccount.amount)).toEqual(1);
        }
    });
    it("Stake another half", async () => {
        try {
            await (0, src_1.stake)(provider.connection, provider.wallet, {
                stakePoolId: stakePoolId,
                originalMintId: originalMintId,
                userOriginalMintTokenAccountId: originalMintTokenAccountId,
                receiptType: stakePool_1.ReceiptType.Receipt,
                amount: new anchor_1.BN(stakingAmount / 2),
            });
            (0, console_1.assert)(false, "Staked ix should have failed because there are tokens already staked");
        }
        catch (e) {
            (0, console_1.assert)(true);
        }
    });
    it("Unstake", async () => {
        const transaction = await (0, src_1.unstake)(provider.connection, provider.wallet, {
            distributorId: new anchor_1.BN(0),
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntryData = await (0, accounts_2.getStakeEntry)(provider.connection, await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId));
        expect(stakeEntryData.parsed.lastStaker.toString()).toEqual(web3_js_1.PublicKey.default.toString());
        expect(stakeEntryData.parsed.lastStakedAt.toNumber()).toBeGreaterThan(0);
        const userOriginalMintTokenAccountId = await (0, common_1.findAta)(originalMintId, provider.wallet.publicKey, true);
        const checkUserOriginalTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, userOriginalMintTokenAccountId);
        expect(Number(checkUserOriginalTokenAccount.amount)).toEqual(10);
        expect(checkUserOriginalTokenAccount.isFrozen).toEqual(false);
    });
});
//# sourceMappingURL=fungible-staking.test.js.map