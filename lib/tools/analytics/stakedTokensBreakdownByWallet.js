"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.getArgs = exports.description = exports.commandName = void 0;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const accounts_1 = require("../../src/programs/stakePool/accounts");
exports.commandName = "stakedTokensBreakdownByWallet";
exports.description = "Get a breakdown of all staked tokens in a pool by wallet";
const getArgs = (_connection, _wallet) => ({
    poolId: new web3_js_1.PublicKey("3BZCupFU6X3wYJwgTsKS2vTs4VeMrhSZgx4P2TfzExtP"),
});
exports.getArgs = getArgs;
const handler = async (connection, _wallet, args) => {
    const UTCNow = Date.now() / 1000;
    const stakeEntries = await (0, accounts_1.getActiveStakeEntriesForPool)(connection, args.poolId);
    const results = stakeEntries.reduce((acc, stakeEntry) => {
        var _a;
        const wallet = stakeEntry.parsed.lastStaker.toString();
        const currentEntry = {
            wallet,
            totalStakeAmount: stakeEntry.parsed.amount.toNumber(),
            totalStakeSeconds: stakeEntry.parsed.totalStakeSeconds
                .add(new bn_js_1.BN(UTCNow).sub((_a = stakeEntry.parsed.lastUpdatedAt) !== null && _a !== void 0 ? _a : stakeEntry.parsed.lastStakedAt))
                .toNumber(),
        };
        const existingEntry = acc[wallet];
        if (existingEntry) {
            acc[wallet] = {
                wallet,
                totalStakeAmount: existingEntry.totalStakeAmount + currentEntry.totalStakeAmount,
                totalStakeSeconds: existingEntry.totalStakeSeconds + currentEntry.totalStakeSeconds,
            };
        }
        else {
            acc[wallet] = currentEntry;
        }
        return acc;
    }, {});
    const sortedResults = Object.values(results).sort((a, b) => b.totalStakeSeconds - a.totalStakeSeconds);
    console.log(sortedResults);
};
exports.handler = handler;
//# sourceMappingURL=stakedTokensBreakdownByWallet.js.map