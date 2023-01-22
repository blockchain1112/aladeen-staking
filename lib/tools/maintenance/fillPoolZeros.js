"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const src_1 = require("../../src");
const stakePool_1 = require("../../src/programs/stakePool");
const accounts_1 = require("../../src/programs/stakePool/accounts");
const connection_1 = require("../connection");
const utils_1 = require("../utils");
const wallet = web3_js_1.Keypair.fromSecretKey(anchor_1.utils.bytes.bs58.decode(""));
const CLUSTER = "devnet";
const BATCH_SIZE = 20;
const MAX_RETRIES = 3;
const MAX_SIZE = 400;
const DRY_RUN = false;
const ALLOWED_POOL_IDS = ["2s3qXuGyMNedXS61Vi9XsRx7HuryyyZUYGyMtCrKUXva"];
const fillPoolZeros = async (cluster) => {
    console.log(wallet.publicKey.toString());
    const connection = (0, connection_1.connectionFor)(cluster);
    const provider = new anchor_1.AnchorProvider(connection, new anchor_1.Wallet(wallet), {});
    const stakePoolProgram = new anchor_1.Program(stakePool_1.STAKE_POOL_IDL, stakePool_1.STAKE_POOL_ADDRESS, provider);
    const allStakePools = (await (0, accounts_1.getAllStakePools)(connection))
        .filter((p) => ALLOWED_POOL_IDS.includes(p.pubkey.toString()))
        .slice(0, MAX_SIZE);
    console.log(`--------- Fill zeros ${allStakePools.length} pools ---------`);
    const transactionsData = [];
    const chunkedPools = (0, utils_1.chunkArray)(allStakePools, BATCH_SIZE);
    for (let i = 0; i < chunkedPools.length; i++) {
        const stakePools = chunkedPools[i];
        console.log(`\n\n-------- Chunk ${i + 1} of ${chunkedPools.length} --------`);
        const transaction = new web3_js_1.Transaction();
        const accountsInTx = [];
        for (let j = 0; j < stakePools.length; j++) {
            const stakePoolData = stakePools[j];
            console.log(`>> Pool (${stakePoolData.pubkey.toString()})`);
            try {
                transaction.add(stakePoolProgram.instruction.stakePoolFillZeros({
                    accounts: {
                        stakePool: stakePoolData.pubkey,
                    },
                }));
                accountsInTx.push(stakePoolData);
            }
            catch (e) {
                console.log(`Failed to add IXs for pool (${stakePoolData.pubkey.toString()})`);
            }
        }
        transactionsData.push({
            transaction,
            accountsInTx,
        });
    }
    console.log(`\n\n--------- Results ---------`);
    await Promise.all(transactionsData.map(async ({ transaction, accountsInTx }) => {
        let attempts = 0;
        let txid;
        while (attempts <= MAX_RETRIES && !txid) {
            try {
                if (!DRY_RUN) {
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
};
fillPoolZeros(CLUSTER).catch((e) => console.log(e));
//# sourceMappingURL=fillPoolZeros.js.map