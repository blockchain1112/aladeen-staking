"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const dotenv = tslib_1.__importStar(require("dotenv"));
const src_1 = require("../../src");
const accounts_1 = require("../../src/programs/rewardDistributor/accounts");
const transaction_1 = require("../../src/programs/rewardDistributor/transaction");
const connection_1 = require("../connection");
const utils_1 = require("../utils");
dotenv.config();
const MULTIPLIER = 100;
const BATCH_SIZE = 1;
const wallet = web3_js_1.Keypair.fromSecretKey(anchor_1.utils.bytes.bs58.decode((_a = process.env.TOOLS_WALLET) !== null && _a !== void 0 ? _a : ""));
const checkMultipliers = async (rewardDistributorId, cluster) => {
    const connection = (0, connection_1.connectionFor)(cluster);
    const rewardEntries = await (0, accounts_1.getRewardEntriesForRewardDistributor)(connection, rewardDistributorId);
    const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId);
    console.log(`--------- Found ${rewardEntries.length} entries ---------`);
    const missingMultipliers = [];
    rewardEntries.forEach((entry) => {
        if (!entry.parsed.multiplier.eq(new bn_js_1.BN(100))) {
            missingMultipliers.push(entry);
        }
    });
    console.log(`Found ${missingMultipliers.length} entries with multipler=1`);
    console.log(missingMultipliers);
    const chunks = (0, utils_1.chunkArray)(missingMultipliers, BATCH_SIZE);
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const transaction = new web3_js_1.Transaction();
        const entriesInTx = [];
        for (let j = 0; j < chunk.length; j++) {
            const m = chunk[j];
            console.log(m);
            console.log(`\n\n${i}. Reward entry: ${m.pubkey.toString()}`);
            (0, transaction_1.withUpdateRewardEntry)(transaction, connection, new anchor_1.Wallet(wallet), {
                stakePoolId: rewardDistributorData.parsed.stakePool,
                rewardDistributorId: rewardDistributorId,
                stakeEntryId: m.parsed.stakeEntry,
                multiplier: new bn_js_1.BN(MULTIPLIER),
            });
            entriesInTx.push(m);
        }
        try {
            const txid = await (0, src_1.executeTransaction)(connection, new anchor_1.Wallet(wallet), transaction, {});
            console.log(`Succesfully migrated entries [${entriesInTx
                .map((e) => e.pubkey.toString())
                .join()}] with transaction ${txid} (https://explorer.solana.com/tx/${txid}?cluster=${cluster})`);
        }
        catch (e) {
            console.log(e);
        }
        console.log(entriesInTx);
    }
};
checkMultipliers(new web3_js_1.PublicKey("7CgYMgEhXFLeNfS66VLo93PCTNDjtK6BEq9Wmp6yGJ5T"), "mainnet").catch((e) => console.log(e));
//# sourceMappingURL=checkMultiplier.js.map