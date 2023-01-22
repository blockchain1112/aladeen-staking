"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRewardDistributors = void 0;
const anchor_1 = require("@project-serum/anchor");
const rewardDistributor_1 = require("../../src/programs/rewardDistributor");
const connection_1 = require("../connection");
const CLUSTER = "mainnet";
// const MAX_SIZE = 400;
const getAllRewardDistributors = async (connection) => {
    const programAccounts = await connection.getProgramAccounts(rewardDistributor_1.REWARD_DISTRIBUTOR_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("rewardDistributor")),
                },
            },
        ],
    });
    return programAccounts;
};
exports.getAllRewardDistributors = getAllRewardDistributors;
const checkZeros = async (cluster) => {
    const connection = (0, connection_1.connectionFor)(cluster);
    const coder = new anchor_1.BorshAccountsCoder(rewardDistributor_1.REWARD_DISTRIBUTOR_IDL);
    const allRewardDistributors = await (0, exports.getAllRewardDistributors)(connection);
    console.log(`--------- Check zeros ${allRewardDistributors.length} reward distributors ---------`);
    for (let i = 0; i < allRewardDistributors.length; i++) {
        const r = allRewardDistributors[i];
        const rewardDistributorData = coder.decode("rewardDistributor", r.account.data);
        const encoded = await coder.encode("rewardDistributor", rewardDistributorData);
        if (r.account.data.slice(encoded.length).some((b) => b !== 0)) {
            console.log(r.pubkey.toString(), rewardDistributorData);
        }
    }
};
checkZeros(CLUSTER).catch((e) => console.log(e));
//# sourceMappingURL=checkZerosStakePool.js.map