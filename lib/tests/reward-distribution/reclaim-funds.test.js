"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@cardinal/common");
const spl_token_1 = require("@solana/spl-token");
const web3 = tslib_1.__importStar(require("@solana/web3.js"));
const bn_js_1 = require("bn.js");
const src_1 = require("../../src");
const rewardDistributor_1 = require("../../src/programs/rewardDistributor");
const accounts_1 = require("../../src/programs/rewardDistributor/accounts");
const pda_1 = require("../../src/programs/rewardDistributor/pda");
const transaction_1 = require("../../src/programs/rewardDistributor/transaction");
const utils_1 = require("../utils");
const workspace_1 = require("../workspace");
describe("Reclaim funds", () => {
    const maxSupply = 100;
    let provider;
    let stakePoolId;
    let rewardMintId;
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
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
        const [transaction] = await (0, src_1.createRewardDistributor)(provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            rewardMintId: rewardMintId,
            kind: rewardDistributor_1.RewardDistributorKind.Treasury,
            maxSupply: new bn_js_1.BN(maxSupply),
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, new bn_js_1.BN(0));
        const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(provider.connection, rewardDistributorId);
        expect(rewardDistributorData.parsed.defaultMultiplier.toString()).toEqual("1");
        expect(rewardDistributorData.parsed.multiplierDecimals.toString()).toEqual("0");
    });
    it("Reclaim funds", async () => {
        const transaction = new web3.Transaction();
        await (0, transaction_1.withReclaimFunds)(transaction, provider.connection, provider.wallet, {
            distributorId: new bn_js_1.BN(0),
            stakePoolId: stakePoolId,
            amount: new bn_js_1.BN(50),
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, new bn_js_1.BN(0));
        const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(provider.connection, rewardDistributorId);
        const rewardDistributorTokenAccountId = await (0, common_1.findAta)(rewardDistributorData.parsed.rewardMint, rewardDistributorId, true);
        const rewardDistributorTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, rewardDistributorTokenAccountId);
        expect(Number(rewardDistributorTokenAccount.amount)).toEqual(50);
    });
});
//# sourceMappingURL=reclaim-funds.test.js.map