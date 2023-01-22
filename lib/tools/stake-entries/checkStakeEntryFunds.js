"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.getArgs = exports.description = exports.commandName = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@cardinal/common");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = tslib_1.__importDefault(require("bn.js"));
const accounts_1 = require("../../src/programs/stakePool/accounts");
const utils_1 = require("../utils");
exports.commandName = "checkStakeEntryFunds";
exports.description = "Get all funds of a given mint in a given pool";
const getArgs = (_connection, _wallet) => ({
    poolIds: "BeT8h9E5BcgcMBxF7Si5GSRuB6zHcSpFuMpp6uTcVRFN",
    mintId: new web3_js_1.PublicKey("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"),
});
exports.getArgs = getArgs;
const handler = async (connection, _wallet, args) => {
    const mint = await (0, spl_token_1.getMint)(connection, args.mintId);
    const poolIds = args.poolIds.split(",").map((pk) => (0, common_1.tryPublicKey)(pk));
    for (let pi = 0; pi < poolIds.length; pi++) {
        const poolId = poolIds[pi];
        const stakeEntries = await (0, accounts_1.getAllStakeEntriesForPool)(connection, poolId);
        console.log(`[stake-entries] (${stakeEntries.length})`);
        const stakeEntryTokenAccountIds = stakeEntries.map((entry) => (0, spl_token_1.getAssociatedTokenAddressSync)(args.mintId, entry.pubkey, true));
        const chunkedIds = (0, utils_1.chunkArray)(stakeEntryTokenAccountIds, 1000);
        const stakeEntryTokenAccountInfos = [];
        for (let i = 0; i < chunkedIds.length; i++) {
            const chunkIds = chunkedIds[i];
            console.log(`[loading] ${stakeEntryTokenAccountInfos.length}/${stakeEntryTokenAccountIds.length} [${chunkIds.length}]`);
            const chunkStakeEntryTokenAccountInfos = await (0, common_1.getBatchedMultipleAccounts)(connection, chunkIds);
            stakeEntryTokenAccountInfos.push(...chunkStakeEntryTokenAccountInfos);
            await new Promise((r) => setTimeout(r, 1000));
        }
        const stakeEntryTokenAccounts = stakeEntryTokenAccountInfos.map((tokenAccount, i) => {
            const tokenAccountId = stakeEntryTokenAccountIds[i];
            if (tokenAccount && tokenAccountId) {
                return (0, spl_token_1.unpackAccount)(tokenAccountId, tokenAccount);
            }
            return null;
        });
        const totalTokens = stakeEntryTokenAccounts.reduce((acc, tokenAccount) => tokenAccount ? new bn_js_1.default(tokenAccount === null || tokenAccount === void 0 ? void 0 : tokenAccount.amount.toString()).add(acc) : acc, new bn_js_1.default(0));
        const pools = {};
        for (let i = 0; i < stakeEntries.length; i++) {
            const stakeEntry = stakeEntries[i];
            const stakeEntryTokenAccount = stakeEntryTokenAccounts[i];
            if (stakeEntry && stakeEntryTokenAccount) {
                const current = pools[stakeEntry.parsed.pool.toString()];
                pools[stakeEntry.parsed.pool.toString()] = (current !== null && current !== void 0 ? current : new bn_js_1.default(0)).add(new bn_js_1.default(stakeEntryTokenAccount.amount.toString()));
            }
        }
        console.log(`[total] ${(0, common_1.decimalAmount)(totalTokens, mint.decimals)}`);
        console.log(`[breakdown] ${JSON.stringify(pools, null, 2)}`);
    }
};
exports.handler = handler;
//# sourceMappingURL=checkStakeEntryFunds.js.map