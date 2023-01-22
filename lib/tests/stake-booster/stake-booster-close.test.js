"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const src_1 = require("../../src");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_1 = require("../../src/programs/stakePool/accounts");
const pda_1 = require("../../src/programs/stakePool/pda");
const transaction_1 = require("../../src/programs/stakePool/transaction");
const utils_1 = require("../utils");
const workspace_1 = require("../workspace");
describe("Create stake pool", () => {
    let provider;
    let stakePoolId;
    let paymentMintId;
    const STAKE_BOOSTER_PAYMENT_AMOUNT = new bn_js_1.BN(2);
    const BOOST_SECONDS = new bn_js_1.BN(10);
    const UPDATE_BOOST_SECONDS = new bn_js_1.BN(20);
    beforeAll(async () => {
        provider = await (0, workspace_1.getProvider)();
        // payment mint
        [, paymentMintId] = await (0, utils_1.createMint)(provider.connection, provider.wallet, {
            amount: 100,
        });
    });
    it("Create Pool", async () => {
        let transaction;
        [transaction, stakePoolId] = await (0, src_1.createStakePool)(provider.connection, provider.wallet, {});
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
    });
    it("Create booster", async () => {
        const transaction = await (0, transaction_1.withInitStakeBooster)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            paymentAmount: STAKE_BOOSTER_PAYMENT_AMOUNT,
            paymentMint: paymentMintId,
            boostSeconds: BOOST_SECONDS,
            startTimeSeconds: Date.now() / 1000,
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeBoosterId = (0, pda_1.findStakeBoosterId)(stakePoolId);
        const stakeBooster = await (0, accounts_1.getStakeBooster)(provider.connection, stakeBoosterId);
        expect(stakeBooster.parsed.stakePool.toString()).toEqual(stakePoolId.toString());
        expect(stakeBooster.parsed.identifier.toString()).toEqual(new bn_js_1.BN(0).toString());
        expect(stakeBooster.parsed.boostSeconds.toString()).toEqual(BOOST_SECONDS.toString());
        expect(stakeBooster.parsed.paymentAmount.toString()).toEqual(STAKE_BOOSTER_PAYMENT_AMOUNT.toString());
        expect(stakeBooster.parsed.paymentMint.toString()).toEqual(paymentMintId.toString());
    });
    it("Update booster", async () => {
        const transaction = await (0, transaction_1.withUpdateStakeBooster)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
            paymentAmount: STAKE_BOOSTER_PAYMENT_AMOUNT,
            paymentMint: paymentMintId,
            boostSeconds: UPDATE_BOOST_SECONDS,
            startTimeSeconds: Date.now() / 1000,
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeBoosterId = (0, pda_1.findStakeBoosterId)(stakePoolId);
        const stakeBooster = await (0, accounts_1.getStakeBooster)(provider.connection, stakeBoosterId);
        expect(stakeBooster.parsed.stakePool.toString()).toEqual(stakePoolId.toString());
        expect(stakeBooster.parsed.identifier.toString()).toEqual(new bn_js_1.BN(0).toString());
        expect(stakeBooster.parsed.boostSeconds.toString()).toEqual(UPDATE_BOOST_SECONDS.toString());
        expect(stakeBooster.parsed.paymentAmount.toString()).toEqual(STAKE_BOOSTER_PAYMENT_AMOUNT.toString());
        expect(stakeBooster.parsed.paymentMint.toString()).toEqual(paymentMintId.toString());
    });
    it("Update booster invalid payment manager", async () => {
        const stakePoolProgram = new anchor_1.Program(stakePool_1.STAKE_POOL_IDL, stakePool_1.STAKE_POOL_ADDRESS, provider);
        const stakeBoosterId = (0, pda_1.findStakeBoosterId)(stakePoolId);
        const transaction = new web3_js_1.Transaction().add(stakePoolProgram.instruction.updateStakeBooster({
            paymentAmount: STAKE_BOOSTER_PAYMENT_AMOUNT,
            paymentMint: paymentMintId,
            boostSeconds: UPDATE_BOOST_SECONDS,
            paymentManager: web3_js_1.Keypair.generate().publicKey,
            startTimeSeconds: new bn_js_1.BN(Date.now() / 1000),
        }, {
            accounts: {
                stakePool: stakePoolId,
                stakeBooster: stakeBoosterId,
                authority: provider.wallet.publicKey,
            },
        }));
        await expect((0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet, {
            silent: true,
        })).rejects.toThrow();
    });
    it("Close booster", async () => {
        const stakeBoosterId = (0, pda_1.findStakeBoosterId)(stakePoolId);
        const transaction = await (0, transaction_1.withCloseStakeBooster)(new web3_js_1.Transaction(), provider.connection, provider.wallet, {
            stakePoolId: stakePoolId,
        });
        await (0, utils_1.executeTransaction)(provider.connection, transaction, provider.wallet);
        const stakeBooster = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getStakeBooster)(provider.connection, stakeBoosterId));
        expect(stakeBooster).toEqual(null);
    });
});
//# sourceMappingURL=stake-booster-close.test.js.map