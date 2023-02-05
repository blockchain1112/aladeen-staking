"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.getArgs = exports.description = exports.commandName = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@cardinal/common");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = tslib_1.__importDefault(require("bn.js"));
const src_1 = require("../../src");
const accounts_1 = require("../../src/programs/rewardDistributor/accounts");
const pda_1 = require("../../src/programs/rewardDistributor/pda");
const transaction_1 = require("../../src/programs/rewardDistributor/transaction");
const accounts_2 = require("../../src/programs/stakePool/accounts");
const pda_2 = require("../../src/programs/stakePool/pda");
const metadata_1 = require("../metadata");
exports.commandName = "updateMultipliersOnRules";
exports.description = `Update reward multipliers for mints based on traits or other rules. (must be pool authority)
Rules options:
  volume - (if user stakes 2+ token, set token multpliers to 'X', if user staked 5+ token, set token multiplier to 'Y')
  metadata - (if token has metadata attribute equal to specify value, set 'X' multiplier)
  combination - (if user has to stake A,B,C mints together, token get 'X' multiplier, else set to zero)`;
const getArgs = (_connection, _wallet) => ({
    distributorId: new bn_js_1.default(0),
    stakePoolId: new web3_js_1.PublicKey("3BZCupFU6X3wYJwgTsKS2vTs4VeMrhSZgx4P2TfzExtP"),
    updateRules: [
    // {
    //   volume: [
    //     { volumeUpperBound: 1, multiplier: 1 },
    //     { volumeUpperBound: 4, multiplier: 3 },
    //     { volumeUpperBound: 7, multiplier: 6 },
    //     { volumeUpperBound: 9, multiplier: 7 },
    //     { volumeUpperBound: 15, multiplier: 10 },
    //     { volumeUpperBound: 29, multiplier: 20 },
    //     { volumeUpperBound: 39, multiplier: 25 },
    //     { volumeUpperBound: 40, multiplier: 30 },
    //   ],
    // },
    // {
    // metadata: [{ traitType: "some_trait", value: "value", multiplier: 2 }],
    // },
    ],
    batchSize: 5,
});
exports.getArgs = getArgs;
const handler = async (connection, wallet, args) => {
    const { stakePoolId, updateRules, batchSize, distributorId } = args;
    const activeStakeEntries = await (0, accounts_2.getActiveStakeEntriesForPool)(connection, stakePoolId);
    for (const rule of updateRules) {
        let dataToSubmit = [];
        //////////////////////// metadata ////////////////////////
        if (rule.metadata) {
            console.log("Fetching metadata...");
            const [metadata] = await (0, metadata_1.fetchMetadata)(connection, activeStakeEntries.map((entry) => entry.parsed.originalMint));
            console.log("Constructing multipliers...");
            const metadataLogs = {};
            for (let index = 0; index < metadata.length; index++) {
                const md = metadata[index];
                for (const mdRule of rule.metadata) {
                    if (md.attributes.find((attr) => attr.trait_type === mdRule.traitType &&
                        attr.value === mdRule.value)) {
                        if (metadataLogs[mdRule.multiplier]) {
                            metadataLogs[mdRule.multiplier].push(activeStakeEntries[index].pubkey);
                        }
                        else {
                            metadataLogs[mdRule.multiplier] = [
                                activeStakeEntries[index].pubkey,
                            ];
                        }
                    }
                }
            }
            // Update multiplier of mints
            for (const [multiplierToSet, entries] of Object.entries(metadataLogs)) {
                if (entries.length > 0) {
                    for (let index = 0; index < entries.length; index++) {
                        const entry = entries[index];
                        dataToSubmit.push({
                            mint: entry,
                            multiplier: Number(multiplierToSet),
                        });
                        if (dataToSubmit.length > batchSize ||
                            index === entries.length - 1) {
                            await updateMultipliers(connection, wallet, distributorId, stakePoolId, dataToSubmit.map((entry) => entry.mint), dataToSubmit.map((entry) => entry.multiplier));
                            dataToSubmit = [];
                        }
                    }
                }
            }
        }
        else if (rule.volume) {
            //////////////////////// volume ////////////////////////
            const volumeLogs = {};
            for (const entry of activeStakeEntries) {
                const user = entry.parsed.lastStaker.toString();
                if (volumeLogs[user]) {
                    volumeLogs[user].push(entry.pubkey);
                }
                else {
                    volumeLogs[user] = [entry.pubkey];
                }
            }
            for (const [_, entries] of Object.entries(volumeLogs)) {
                if (entries.length > 0) {
                    // find multiplier for volume
                    const volume = entries.length;
                    let multiplierToSet = 1;
                    for (const volumeRule of rule.volume) {
                        multiplierToSet = volumeRule.multiplier;
                        if (volume <= volumeRule.volumeUpperBound) {
                            break;
                        }
                    }
                    // Update multiplier of mints
                    for (const entry of entries) {
                        dataToSubmit.push({
                            mint: entry,
                            multiplier: multiplierToSet,
                        });
                        if (dataToSubmit.length > batchSize) {
                            await updateMultipliers(connection, wallet, distributorId, stakePoolId, dataToSubmit.map((entry) => entry.mint), dataToSubmit.map((entry) => entry.multiplier));
                            dataToSubmit = [];
                        }
                    }
                }
            }
        }
        else if (rule.combination) {
            //////////////////////// combinations ////////////////////////
            const primaryMints = rule.combination.primaryMint;
            const secondaryMints = rule.combination.secondaryMints;
            const combinationLogs = {};
            for (const entry of activeStakeEntries) {
                const user = entry.parsed.lastStaker.toString();
                if (combinationLogs[user]) {
                    combinationLogs[user].push(entry.pubkey.toString());
                }
                else {
                    combinationLogs[user] = [entry.pubkey.toString()];
                }
            }
            for (const [_, entries] of Object.entries(combinationLogs)) {
                let multiplierToSet = 0;
                let validCombination = true;
                // Calculate if multiplier for primary mints
                for (const mint of primaryMints) {
                    if (!entries.includes(mint.toString())) {
                        validCombination = false;
                        break;
                    }
                }
                for (const mint of secondaryMints) {
                    if (!entries.includes(mint.toString()) || !validCombination) {
                        validCombination = false;
                        break;
                    }
                }
                if (validCombination) {
                    multiplierToSet = rule.combination.multiplier;
                }
                // Update multiplier of primary mints
                for (const primaryMint of primaryMints) {
                    const stakeEntryId = (0, pda_2.findStakeEntryId)(stakePoolId, primaryMint);
                    dataToSubmit.push({
                        mint: stakeEntryId,
                        multiplier: multiplierToSet,
                    });
                    if (dataToSubmit.length > batchSize) {
                        await updateMultipliers(connection, wallet, distributorId, stakePoolId, dataToSubmit.map((entry) => entry.mint), dataToSubmit.map((entry) => entry.multiplier));
                        dataToSubmit = [];
                    }
                }
            }
        }
    }
};
exports.handler = handler;
const updateMultipliers = async (connection, wallet, distributorId, stakePoolId, stakeEntryIds, multipliers) => {
    const transaction = new web3_js_1.Transaction();
    // update multipliers
    const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, distributorId);
    const rewardDistributorData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId));
    if (!rewardDistributorData) {
        console.log("No reward distributor found");
        return;
    }
    const multipliersToSet = multipliers.map((ml) => ml * 10 ** rewardDistributorData.parsed.multiplierDecimals);
    const rewardEntryIds = stakeEntryIds.map((stakeEntryId) => (0, pda_1.findRewardEntryId)(rewardDistributorId, stakeEntryId));
    const stakeEntryDatas = await (0, accounts_2.getStakeEntries)(connection, stakeEntryIds);
    const rewardEntryDatas = await (0, accounts_1.getRewardEntries)(connection, rewardEntryIds);
    // Add init reward entry instructions
    await Promise.all(rewardEntryDatas.map((rewardEntryData, index) => {
        if (!rewardEntryData.parsed) {
            const stakeEntryId = stakeEntryIds[index];
            return (0, transaction_1.withInitRewardEntry)(transaction, connection, wallet, {
                stakeEntryId: stakeEntryId,
                rewardDistributorId: rewardDistributorId,
            });
        }
    }));
    // Add update instruction if needed
    await Promise.all(rewardEntryDatas.map((rewardEntryData, index) => {
        const multiplierToSet = multipliersToSet[index];
        const stakeEntryId = stakeEntryIds[index];
        if (!rewardEntryData.parsed ||
            (rewardEntryData.parsed &&
                rewardEntryData.parsed.multiplier.toNumber() !== multiplierToSet)) {
            console.log(`Updating multiplier for mint ${stakeEntryDatas[index].parsed.originalMint.toString()} from ${rewardEntryData.parsed
                ? rewardEntryData.parsed.multiplier.toString()
                : "100"} to ${multiplierToSet}`);
            return (0, transaction_1.withUpdateRewardEntry)(transaction, connection, wallet, {
                stakePoolId: stakePoolId,
                rewardDistributorId: rewardDistributorId,
                stakeEntryId: stakeEntryId,
                multiplier: new bn_js_1.default(multiplierToSet),
            });
        }
    }));
    // Execute transaction
    if (transaction.instructions.length > 0) {
        const txId = await (0, src_1.executeTransaction)(connection, wallet, transaction, {});
        console.log(`Successfully executed transaction ${txId}\n`);
    }
    else {
        console.log("No instructions provided\n");
    }
};
//# sourceMappingURL=updateMultipliersOnRules.js.map