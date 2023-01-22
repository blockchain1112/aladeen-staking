"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const src_1 = require("../../src");
const rewardDistributor_1 = require("../../src/programs/rewardDistributor");
const accounts_1 = require("../../src/programs/rewardDistributor/accounts");
const pda_1 = require("../../src/programs/rewardDistributor/pda");
const accounts_2 = require("../../src/programs/stakePool/accounts");
const transaction_1 = require("../../src/programs/stakePool/transaction");
const utils_1 = require("../../src/programs/stakePool/utils");
const utils_2 = require("../utils");
const workspace_1 = require("../workspace");
describe("Stake and claim rewards", () => {
    let provider;
    let originalMintTokenAccountId;
    let originalMintId;
    let rewardMintId;
    let stakePoolId;
    const maxSupply = 100;
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        // original mint
        [originalMintTokenAccountId, originalMintId] = await (0, utils_2.createMasterEdition)(provider.connection, provider.wallet);
        // reward mint
        [, rewardMintId] = await (0, utils_2.createMint)(provider.connection, provider.wallet, {
            amount: maxSupply,
        });
    });
    it("Create Pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {});
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    it("Create Reward Distributor", async () => {
        const transaction = new web3_js_1.Transaction();
        await src_1.rewardDistributor.transaction.withInitRewardDistributor(transaction, provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            rewardMintId: rewardMintId,
            kind: rewardDistributor_1.RewardDistributorKind.Treasury,
            maxSupply: new bn_js_1.BN(maxSupply),
            defaultMultiplier: new bn_js_1.BN(1),
            multiplierDecimals: 1,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, new bn_js_1.BN(0));
        const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(provider.connection, rewardDistributorId);
        expect(rewardDistributorData.parsed.rewardMint.toString()).toEqual(rewardMintId.toString());
        expect(rewardDistributorData.parsed.defaultMultiplier.toNumber()).toEqual(1);
        expect(rewardDistributorData.parsed.multiplierDecimals).toEqual(1);
    });
    it("Create Stake And Reward Entry", async () => {
        const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, new bn_js_1.BN(0));
        const [transaction, stakeEntryId] = await (0, src_1.createStakeEntry)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await src_1.rewardDistributor.transaction.withInitRewardEntry(transaction, provider.connection, provider.wallet, {
            stakeEntryId: stakeEntryId,
            rewardDistributorId: rewardDistributorId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(provider.connection, rewardDistributorId);
        expect(rewardDistributorData.parsed.defaultMultiplier.toNumber()).toEqual(1);
    });
    test("Stake", async () => {
        await (0, utils_2.executeTransaction)(provider.connection, await (0, src_1.stake)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId,
            userOriginalMintTokenAccountId: originalMintTokenAccountId,
        }), provider.wallet);
    });
    it("Fail close pool", async () => {
        const transaction = await (0, transaction_1.withCloseStakePool)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
        });
        await expect((0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet, {
            silent: true,
        })).rejects.toThrow();
    });
    test("Unstake", async () => {
        await (0, utils_2.executeTransaction)(provider.connection, await (0, src_1.unstake)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        }), provider.wallet);
    });
    it("Close entry then pool", async () => {
        const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(provider.connection, provider.wallet.publicKey, stakePoolId, originalMintId);
        const transaction = new web3_js_1.Transaction();
        await (0, transaction_1.withCloseStakeEntry)(transaction, provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            stakeEntryId: stakeEntryId,
        });
        await (0, transaction_1.withCloseStakePool)(transaction, provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
        });
        await (0, utils_2.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeEntry = await (0, common_1.tryGetAccount)(() => (0, accounts_2.getStakeEntry)(provider.connection, stakeEntryId));
        expect(stakeEntry).toEqual(null);
        const stakePool = await (0, common_1.tryGetAccount)(() => (0, accounts_2.getStakePool)(provider.connection, stakePoolId));
        expect(stakePool).toEqual(null);
    });
});
//# sourceMappingURL=create-entry-close-pool.test.js.map