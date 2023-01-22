"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = require("bn.js");
const src_1 = require("../../src");
const utils_1 = require("../utils");
const workspace_1 = require("../workspace");
let provider;
let originalMintTokenAccountId;
let originalMintId;
let stakePoolId;
const endDate = Date.now() / 1000 + 2;
describe("Stake pool ended", () => {
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        [originalMintTokenAccountId, originalMintId] = await (0, utils_1.createMasterEdition)(provider.connection, provider.wallet);
    });
    it("Create Pool", async () => {
        let tx;
        [tx, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, { endDate: new bn_js_1.BN(endDate) });
        await (0, utils_1.executeTransaction)(provider.connection, tx, provider.wallet);
    });
    it("Stake", async () => {
        await new Promise((r) => setTimeout(r, 3000));
        const tx = await (0, src_1.stake)(provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            originalMintId: originalMintId,
            userOriginalMintTokenAccountId: originalMintTokenAccountId,
        });
        await expect((0, utils_1.executeTransaction)(provider.connection, tx, provider.wallet, {
            silent: true,
        })).rejects.toThrow();
    });
});
//# sourceMappingURL=stake-but-pool-has-ended.test.js.map