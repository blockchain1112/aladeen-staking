"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const web3_js_1 = require("@solana/web3.js");
const src_1 = require("../../src");
const accounts_1 = require("../../src/programs/stakePool/accounts");
const pda_1 = require("../../src/programs/stakePool/pda");
const transaction_1 = require("../../src/programs/stakePool/transaction");
const utils_1 = require("../utils");
const workspace_1 = require("../workspace");
describe("Requires authorization success", () => {
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
            requiresCreators: [],
            requiresAuthorization: true,
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakePoolData = await (0, accounts_1.getStakePool)(provider.connection, stakePoolId);
        expect(stakePoolData.parsed.overlayText).toEqual(overlayText);
        expect(stakePoolData.parsed.requiresAuthorization).toBeTruthy();
    });
    it("Authorize mint for stake", async () => {
        var _a;
        const transaction = await (0, src_1.authorizeStakeEntry)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeAuthorizationData = await (0, accounts_1.getStakeAuthorization)(provider.connection, (0, pda_1.findStakeAuthorizationId)(stakePoolId, originalMintId));
        expect(stakeAuthorizationData).not.toEqual(null);
        const stakeAuthorizationsForPool = await (0, accounts_1.getStakeAuthorizationsForPool)(provider.connection, stakePoolId);
        expect(stakeAuthorizationsForPool.length).toEqual(1);
        expect(stakeAuthorizationData.pubkey.toString()).toEqual((_a = stakeAuthorizationsForPool[0]) === null || _a === void 0 ? void 0 : _a.pubkey.toString());
    });
    it("Deathorize mint for stake", async () => {
        const transaction = await (0, transaction_1.withDeauthorizeStakeEntry)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeAuthorizationData = await (0, common_1.tryGetAccount)(async () => (0, accounts_1.getStakeAuthorization)(provider.connection, (0, pda_1.findStakeAuthorizationId)(stakePoolId, originalMintId)));
        expect(stakeAuthorizationData).toEqual(null);
        const stakeAuthorizationsForPool = await (0, accounts_1.getStakeAuthorizationsForPool)(provider.connection, stakePoolId);
        expect(stakeAuthorizationsForPool.length).toEqual(0);
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
//# sourceMappingURL=stake-deauthorization-record.test.js.map