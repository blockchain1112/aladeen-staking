"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.getArgs = exports.description = exports.commandName = void 0;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const src_1 = require("../../src");
const transaction_1 = require("../../src/programs/rewardDistributor/transaction");
exports.commandName = "reclaimFunds";
exports.description = "Reclaim funds from a stake pool as the pool authority";
const getArgs = (_connection, _wallet) => ({
    // rewards distributor index
    distributorId: new bn_js_1.BN(0),
    // stake pool id to reclaim funds from
    stakePoolId: new web3_js_1.PublicKey("3BZCupFU6X3wYJwgTsKS2vTs4VeMrhSZgx4P2TfzExtP"),
    // amount of tokens to reclaim
    // WARNING: natural amount must account for mint decimals
    amount: new bn_js_1.BN(0),
});
exports.getArgs = getArgs;
const handler = async (connection, wallet, args) => {
    const transaction = await (0, transaction_1.withReclaimFunds)(new web3_js_1.Transaction(), connection, wallet, {
        distributorId: args.distributorId,
        stakePoolId: args.stakePoolId,
        amount: args.amount,
    });
    const txid = await (0, src_1.executeTransaction)(connection, wallet, transaction, {});
    console.log(`[success] https://explorer.solana.com/tx/${txid}`);
};
exports.handler = handler;
//# sourceMappingURL=reclaimFunds.js.map