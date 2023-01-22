"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStakeEntries = void 0;
const tslib_1 = require("tslib");
const anchor_1 = require("@project-serum/anchor");
const dotenv = tslib_1.__importStar(require("dotenv"));
const stakePool_1 = require("../../src/programs/stakePool");
const connection_1 = require("../connection");
dotenv.config();
const CLUSTER = "devnet";
// const MAX_SIZE = 400;
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
const checkZeros = async (cluster) => {
    var _a;
    const connection = (0, connection_1.connectionFor)(cluster);
    const coder = new anchor_1.BorshAccountsCoder(stakePool_1.STAKE_POOL_IDL);
    const allStakeEntries = await (0, exports.getAllStakeEntries)(connection);
    console.log(`--------- Check zeros ${allStakeEntries.length} stake entries ---------`);
    const poolCounts = {};
    let minPadding = 9999999;
    for (let i = 0; i < allStakeEntries.length; i++) {
        const a = allStakeEntries[i];
        try {
            const stakeEntryData = coder.decode("stakeEntry", a.account.data);
            const encoded = await coder.encode("stakeEntry", stakeEntryData);
            if (stakeEntryData.cooldownStartSeconds !== null &&
                stakeEntryData.stakeMint !== null) {
                console.log("--------", a.pubkey.toString());
            }
            if (a.account.data.slice(encoded.length).length <= minPadding) {
                console.log(a.account.data.slice(encoded.length).length, a.pubkey.toString());
                minPadding = a.account.data.slice(encoded.length).length;
            }
            if (a.account.data.slice(encoded.length).some((b) => b !== 0)) {
                const poolId = stakeEntryData.pool.toString();
                const c = (_a = poolCounts[poolId]) !== null && _a !== void 0 ? _a : 0;
                poolCounts[poolId] = c + 1;
                console.log(stakeEntryData.pool.toString(), a.pubkey.toString(), stakeEntryData);
            }
        }
        catch (e) {
            console.log(`[error] ${a.pubkey.toString()}`, e);
        }
    }
    console.log(minPadding);
    console.log(poolCounts);
};
checkZeros(CLUSTER).catch((e) => console.log(e));
//# sourceMappingURL=checkZerosStakeEntries.js.map