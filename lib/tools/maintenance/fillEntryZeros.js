"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStakeEntries = void 0;
const tslib_1 = require("tslib");
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const dotenv = tslib_1.__importStar(require("dotenv"));
const src_1 = require("../../src");
const stakePool_1 = require("../../src/programs/stakePool");
const connection_1 = require("../connection");
const utils_1 = require("../utils");
dotenv.config();
const wallet = web3_js_1.Keypair.fromSecretKey(anchor_1.utils.bytes.bs58.decode(process.env.WALLET || ""));
const CLUSTER = "devnet";
const BATCH_SIZE = 20;
const PARALLEL_TRANSACTIONS = 100;
const MAX_RETRIES = 3;
const DRY_RUN = false;
const ALLOWED_ENTRY_IDS = [];
const getAllStakeEntries = async (connection) => {
    const programAccounts = await connection.getProgramAccounts(stakePool_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("stakeEntry")),
                },
            },
        ],
    });
    return programAccounts;
};
exports.getAllStakeEntries = getAllStakeEntries;
const fillEntryZeros = async (cluster) => {
    var _a;
    console.log(`wallet=${wallet.publicKey.toString()}`);
    // setup
    const connection = (0, connection_1.connectionFor)(cluster);
    const provider = new anchor_1.AnchorProvider(connection, new anchor_1.Wallet(wallet), {});
    const stakePoolProgram = new anchor_1.Program(stakePool_1.STAKE_POOL_IDL, stakePool_1.STAKE_POOL_ADDRESS, provider);
    const allStakeEntries = await (0, exports.getAllStakeEntries)(connection);
    //// parsed
    const parsedStakeEntries = [];
    const poolCounts = {};
    for (let i = 0; i < allStakeEntries.length; i++) {
        const a = allStakeEntries[i];
        try {
            const stakeEntryData = stakePoolProgram.coder.accounts.decode("stakeEntry", a.account.data);
            const encoded = await stakePoolProgram.coder.accounts.encode("stakeEntry", stakeEntryData);
            if (a.account.data.slice(encoded.length).some((b) => b !== 0)) {
                const poolId = stakeEntryData.pool.toString();
                const c = (_a = poolCounts[poolId]) !== null && _a !== void 0 ? _a : 0;
                poolCounts[poolId] = c + 1;
                parsedStakeEntries.push({ pubkey: a.pubkey, parsed: stakeEntryData });
            }
        }
        catch (e) {
            // console.log(`[error] ${a.pubkey.toString()}`, e);
        }
    }
    console.log(poolCounts);
    const filteredEntries = parsedStakeEntries.filter((p) => ALLOWED_ENTRY_IDS.length > 0
        ? ALLOWED_ENTRY_IDS.includes(p.pubkey.toString())
        : true);
    const transactionsData = [];
    console.log(`\nTotal=${filteredEntries.length}`);
    const chunkedEntries = (0, utils_1.chunkArray)(filteredEntries, BATCH_SIZE);
    for (let i = 0; i < chunkedEntries.length; i++) {
        const stakeEntries = chunkedEntries[i];
        console.log(`\n>> (${i + 1}/${chunkedEntries.length})`);
        const transaction = new web3_js_1.Transaction();
        const accountsInTx = [];
        for (let j = 0; j < stakeEntries.length; j++) {
            const stakeEntryData = stakeEntries[j];
            console.log(`>>> Entry (${stakeEntryData.pubkey.toString()})`);
            console.log(stakeEntryData);
            try {
                transaction.add(stakePoolProgram.instruction.stakeEntryFillZeros({
                    accounts: {
                        stakeEntry: stakeEntryData.pubkey,
                    },
                }));
                accountsInTx.push(stakeEntryData);
            }
            catch (e) {
                console.log(`Failed to add IXs for pool (${stakeEntryData.pubkey.toString()})`);
            }
        }
        transactionsData.push({
            transaction,
            accountsInTx,
        });
    }
    console.log(`\n\nTransactions=${transactionsData.length}`);
    const chunkedTxDatas = (0, utils_1.chunkArray)(transactionsData, PARALLEL_TRANSACTIONS);
    for (let i = 0; i < chunkedTxDatas.length; i++) {
        const txDatas = chunkedTxDatas[i];
        console.log(`> (${i + 1}/${chunkedTxDatas.length})`);
        await Promise.all(txDatas.map(async ({ transaction, accountsInTx }) => {
            let attempts = 0;
            let txid;
            while (attempts <= MAX_RETRIES && !txid) {
                try {
                    if (!DRY_RUN && transaction.instructions.length > 0) {
                        txid = await (0, src_1.executeTransaction)(connection, new anchor_1.Wallet(wallet), transaction, {});
                    }
                }
                catch (e) {
                    console.log(e);
                }
                attempts += 1;
            }
            if (txid) {
                console.log(`Succesful [${accountsInTx
                    .map((e) => e.pubkey.toString())
                    .join()}] with transaction ${txid} (https://explorer.solana.com/tx/${txid}?cluster=${cluster})`);
            }
            else {
                console.log(`Failed [${accountsInTx.map((e) => e.pubkey.toString()).join()}]`);
            }
        }));
    }
};
fillEntryZeros(CLUSTER).catch((e) => console.log(e));
//# sourceMappingURL=fillEntryZeros.js.map