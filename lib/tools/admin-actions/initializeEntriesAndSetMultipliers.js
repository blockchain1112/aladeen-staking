"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.getArgs = exports.description = exports.commandName = void 0;
const common_1 = require("@cardinal/common");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const src_1 = require("../../src");
const accounts_1 = require("../../src/programs/rewardDistributor/accounts");
const pda_1 = require("../../src/programs/rewardDistributor/pda");
const transaction_1 = require("../../src/programs/rewardDistributor/transaction");
const accounts_2 = require("../../src/programs/stakePool/accounts");
const pda_2 = require("../../src/programs/stakePool/pda");
const transaction_2 = require("../../src/programs/stakePool/transaction");
const metadata_1 = require("../metadata");
const utils_1 = require("../utils");
exports.commandName = "initializeEntriesAndSetMultipliers";
exports.description = "Initialize all entries and optionally set multipliers for reward entries. Optionalls use metadataRules for complex multiplier rules";
const getArgs = (_connection, _wallet) => ({
    // rewards distributor index
    distributorId: new bn_js_1.BN(0),
    // stake pool id
    stakePoolId: new web3_js_1.PublicKey("3BZCupFU6X3wYJwgTsKS2vTs4VeMrhSZgx4P2TfzExtP"),
    // whether this pool deals with fungible tokens
    fungible: false,
    // array of mints and optionally multiplier to initialize
    // REMINDER: Take into account rewardDistributor.multiplierDecimals!
    initEntries: [],
    // optional update rules
    metadataRules: undefined,
    // number of entries per transaction
    batchSize: 3,
    // number of transactions in parallel
    parallelBatchSize: 20,
});
exports.getArgs = getArgs;
const handler = async (connection, wallet, args) => {
    const { stakePoolId, initEntries, metadataRules, distributorId } = args;
    const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, distributorId);
    const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId);
    console.log(`--------- Initialize ${initEntries.length} entries for pool (${stakePoolId.toString()}) and reward distributor (${rewardDistributorId.toString()}) ---------`);
    const stakeEntryIds = await Promise.all(initEntries.map((e) => (0, pda_2.findStakeEntryId)(stakePoolId, e.mintId)));
    const stakeEntries = await (0, accounts_2.getStakeEntries)(connection, stakeEntryIds);
    const stakeEntriesById = stakeEntries.reduce((acc, stakeEntry) => stakeEntry.parsed
        ? { ...acc, [stakeEntry.pubkey.toString()]: stakeEntry }
        : { ...acc }, {});
    const rewardEntryIds = stakeEntryIds.map((stakeEntryId) => (0, pda_1.findRewardEntryId)(rewardDistributorId, stakeEntryId));
    const rewardEntries = await (0, accounts_1.getRewardEntries)(connection, rewardEntryIds);
    const rewardEntriesById = rewardEntries.reduce((acc, rewardEntry) => rewardEntry.parsed
        ? { ...acc, [rewardEntry.pubkey.toString()]: rewardEntry }
        : { ...acc }, {});
    const chunkedEntries = (0, utils_1.chunkArray)(initEntries, args.batchSize);
    const batchedChunks = (0, utils_1.chunkArray)(chunkedEntries, args.parallelBatchSize);
    for (let i = 0; i < batchedChunks.length; i++) {
        const chunk = batchedChunks[i];
        console.log(`\n\n\n ${i + 1}/${batchedChunks.length}`);
        await Promise.all(chunk.map(async (entries, c) => {
            const transaction = new web3_js_1.Transaction();
            const entriesInTx = [];
            let metadata = [];
            if (metadataRules) {
                [metadata] = await (0, metadata_1.fetchMetadata)(connection, entries.map((e) => e.mintId));
            }
            for (let j = 0; j < entries.length; j++) {
                const { mintId, multiplier } = entries[j];
                console.log(`>>[${c + 1}/${chunk.length}][${j + 1}/${entries.length}] (${mintId.toString()})`);
                try {
                    const stakeEntryId = (0, pda_2.findStakeEntryId)(stakePoolId, mintId);
                    await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, mintId, stakeEntryId, wallet.publicKey, true);
                    if (!stakeEntriesById[stakeEntryId.toString()]) {
                        await (0, transaction_2.withInitStakeEntry)(transaction, connection, wallet, {
                            stakePoolId,
                            originalMintId: mintId,
                        });
                        console.log(`>>[${c + 1}/${chunk.length}][${j + 1}/${entries.length}] 1. Adding stake entry instruction`);
                    }
                    const rewardEntryId = (0, pda_1.findRewardEntryId)(rewardDistributorId, stakeEntryId);
                    const rewardEntry = rewardEntriesById[rewardEntryId.toString()];
                    if (rewardDistributorData && !rewardEntry) {
                        console.log(`>>[${c + 1}/${chunk.length}][${j + 1}/${entries.length}] 2. Reward entry not found for reward distributor - adding reward entry instruction`);
                        (0, transaction_1.withInitRewardEntry)(transaction, connection, wallet, {
                            stakeEntryId,
                            rewardDistributorId,
                        });
                    }
                    let multiplierToSet = multiplier;
                    if (metadataRules) {
                        `>>[${c + 1}/${chunk.length}][${j + 1}/${entries.length}] 2.5 Metadata rules are set to override mint multiplier`;
                        const md = metadata[j];
                        for (const rule of metadataRules) {
                            if (md.attributes.find((attr) => attr.trait_type === rule.traitType &&
                                attr.value === rule.value)) {
                                multiplierToSet = rule.multiplier;
                                console.log(`>>> [${c + 1}/${chunk.length}][${j + 1}/${entries.length}] Using metadataRule (${rule.traitType}:${rule.value}=${rule.multiplier})`);
                            }
                        }
                    }
                    if (multiplierToSet &&
                        (rewardEntry === null || rewardEntry === void 0 ? void 0 : rewardEntry.parsed.multiplier.toNumber()) !== multiplierToSet) {
                        console.log(`>>[${c + 1}/${chunk.length}][${j + 1}/${entries.length}] 3. Updating reward entry multipler from  ${(rewardEntry === null || rewardEntry === void 0 ? void 0 : rewardEntry.parsed.multiplier.toNumber()) || 0} => ${multiplierToSet}`);
                        (0, transaction_1.withUpdateRewardEntry)(transaction, connection, wallet, {
                            stakePoolId,
                            stakeEntryId,
                            rewardDistributorId,
                            multiplier: new bn_js_1.BN(multiplierToSet),
                        });
                    }
                    entriesInTx.push({ mintId });
                }
                catch (e) {
                    console.log(`[fail] (${mintId.toString()})`);
                }
            }
            try {
                if (transaction.instructions.length > 0) {
                    const txid = await (0, src_1.executeTransaction)(connection, wallet, transaction, {});
                    console.log(`[success] ${entriesInTx
                        .map((e) => e.mintId.toString())
                        .join()} (https://explorer.solana.com/tx/${txid})`);
                }
            }
            catch (e) {
                console.log(e);
            }
        }));
    }
};
exports.handler = handler;
//# sourceMappingURL=initializeEntriesAndSetMultipliers.js.map