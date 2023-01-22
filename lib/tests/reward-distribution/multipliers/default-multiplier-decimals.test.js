"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const src_1 = require("../../../src");
const rewardDistributor_1 = require("../../../src/programs/rewardDistributor");
const accounts_1 = require("../../../src/programs/rewardDistributor/accounts");
const pda_1 = require("../../../src/programs/rewardDistributor/pda");
const utils_1 = require("../../utils");
const workspace_1 = require("../../workspace");
describe("Stake and claim rewards", () => {
    let provider;
    let rewardMintId;
    let stakePoolId;
    const maxSupply = 100;
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        // reward mint
        [, rewardMintId] = await (0, utils_1.createMint)(provider.connection, provider.wallet, {
            amount: maxSupply,
        });
    });
    it("Create Pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {});
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    it("Create Reward Distributor", async () => {
        const transaction = new web3_js_1.Transaction();
        await src_1.rewardDistributor.transaction.withInitRewardDistributor(transaction, provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            rewardMintId: rewardMintId,
            kind: rewardDistributor_1.RewardDistributorKind.Treasury,
            maxSupply: new bn_js_1.BN(maxSupply),
            defaultMultiplier: new bn_js_1.BN(10),
            multiplierDecimals: 1,
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, new bn_js_1.BN(0));
        const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(provider.connection, rewardDistributorId);
        expect(rewardDistributorData.parsed.rewardMint.toString()).toEqual(rewardMintId.toString());
        expect(rewardDistributorData.parsed.defaultMultiplier.toNumber()).toEqual(10);
        expect(rewardDistributorData.parsed.multiplierDecimals).toEqual(1);
    });
});
//# sourceMappingURL=default-multiplier-decimals.test.js.map