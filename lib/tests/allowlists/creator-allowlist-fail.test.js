"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const src_1 = require("../../src");
const accounts_1 = require("../../src/programs/stakePool/accounts");
const utils_1 = require("../utils");
const workspace_1 = require("../workspace");
describe("Create stake pool", () => {
    let provider;
    const overlayText = "staking";
    let originalMintId;
    let stakePoolId;
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        // original mint
        [, originalMintId] = await (0, utils_1.createMasterEdition)(provider.connection, provider.wallet);
    });
    it("Create Pool", async () => {
        var _a;
        const creator = web3_js_1.Keypair.generate();
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {
            overlayText: overlayText,
            requiresCreators: [creator.publicKey],
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakePoolData = await (0, accounts_1.getStakePool)(provider.connection, stakePoolId);
        expect((_a = stakePoolData.parsed.requiresCreators[0]) === null || _a === void 0 ? void 0 : _a.toString()).toEqual(creator.publicKey.toString());
    });
    it("Init stake entry for pool", async () => {
        const [transaction] = await (0, src_1.createStakeEntry)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await expect((0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet, {
            silent: true,
        })).rejects.toThrow();
    });
});
//# sourceMappingURL=creator-allowlist-fail.test.js.map