"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const accounts_1 = require("../../src/programs/stakePool/accounts");
const utils_1 = require("../utils");
const workspace_1 = require("../workspace");
describe("Requires authorization fail", () => {
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
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {
            overlayText: overlayText,
            requiresAuthorization: true,
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakePoolData = await (0, accounts_1.getStakePool)(provider.connection, stakePoolId);
        expect(stakePoolData.parsed.requiresAuthorization).toBeTruthy();
        expect(stakePoolData.parsed.overlayText).toEqual(overlayText);
    });
    it("Init stake entry for pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakeEntry)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await expect((0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet, {
            silent: true,
        })).rejects.toThrow();
    });
});
//# sourceMappingURL=stake-authorization-record-fail.test.js.map