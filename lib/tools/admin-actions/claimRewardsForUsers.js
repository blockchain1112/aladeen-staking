"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.getArgs = exports.description = exports.commandName = void 0;
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const src_1 = require("../../src");
const accounts_1 = require("../../src/programs/rewardDistributor/accounts");
const pda_1 = require("../../src/programs/rewardDistributor/pda");
const transaction_1 = require("../../src/programs/rewardDistributor/transaction");
const accounts_2 = require("../../src/programs/stakePool/accounts");
const transaction_2 = require("../../src/programs/stakePool/transaction");
const utils_1 = require("../utils");
exports.commandName = "claimRewardsForUsers";
exports.description = "Claim all rewards for users in the given pool (must be pool authority) - Cost 0.002 per token";
const getArgs = (_connection, _wallet) => ({
    // rewards distributor index
    distributorId: new anchor_1.BN(0),
    // stake pool id
    stakePoolId: new web3_js_1.PublicKey("3BZCupFU6X3wYJwgTsKS2vTs4VeMrhSZgx4P2TfzExtP"),
    // number of entries per transaction
    batchSize: 4,
    // number of transactions in parallel
    parallelTransactions: 5,
});
exports.getArgs = getArgs;
const handler = async (connection, wallet, args) => {
    const { stakePoolId, distributorId } = args;
    const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, distributorId);
    const checkRewardDistributorData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId));
    if (!checkRewardDistributorData) {
        throw "No reward distributor found";
    }
    const activeStakeEntries = await (0, accounts_2.getActiveStakeEntriesForPool)(connection, stakePoolId);
    console.log(`Estimated SOL needed to claim rewards for ${activeStakeEntries.length} staked tokens:`, 0.002 * activeStakeEntries.length, "SOL");
    const chunkedEntries = (0, utils_1.chunkArray)(activeStakeEntries, args.batchSize);
    const batchedChunks = (0, utils_1.chunkArray)(chunkedEntries, args.parallelTransactions);
    for (let i = 0; i < batchedChunks.length; i++) {
        const chunk = batchedChunks[i];
        console.log(`> ${i + 1}/ ${batchedChunks.length}`);
        await Promise.all(chunk.map(async (entries, index) => {
            const transaction = new web3_js_1.Transaction();
            for (let j = 0; j < entries.length; j++) {
                console.log(`>> ${j + 1}/ ${entries.length}`);
                const stakeEntryData = entries[j];
                (0, transaction_2.withUpdateTotalStakeSeconds)(transaction, connection, wallet, {
                    stakeEntryId: stakeEntryData.pubkey,
                    lastStaker: wallet.publicKey,
                });
                await (0, transaction_1.withClaimRewards)(transaction, connection, wallet, {
                    distributorId,
                    stakePoolId: stakePoolId,
                    stakeEntryId: stakeEntryData.pubkey,
                    lastStaker: stakeEntryData.parsed.lastStaker,
                    payer: wallet.publicKey,
                });
            }
            try {
                if (transaction.instructions.length > 0) {
                    const txid = await (0, src_1.executeTransaction)(connection, wallet, transaction, {});
                    console.log(`[${index + 1}/${chunk.length}] [success] Claimed rewards (https://explorer.solana.com/tx/${txid})`);
                }
            }
            catch (e) {
                console.log(e);
            }
        }));
    }
    console.log(`[success] Claimed rewards for ${activeStakeEntries.length} staked tokens`);
};
exports.handler = handler;
//# sourceMappingURL=claimRewardsForUsers.js.map