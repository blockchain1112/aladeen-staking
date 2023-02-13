"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRewardAuthority = exports.findRewardDistributorId = exports.findRewardEntryId = void 0;
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const _1 = require(".");
/**
 * Finds the reward entry id.
 * @returns
 */
const findRewardEntryId = (rewardDistributorId, stakeEntryId) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        anchor_1.utils.bytes.utf8.encode(_1.REWARD_ENTRY_SEED),
        rewardDistributorId.toBuffer(),
        stakeEntryId.toBuffer(),
    ], _1.REWARD_DISTRIBUTOR_ADDRESS)[0];
};
exports.findRewardEntryId = findRewardEntryId;
/**
 * Finds the reward distributor id.
 * @returns
 */
const findRewardDistributorId = (stakePoolId, id, duration) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(_1.REWARD_DISTRIBUTOR_SEED),
        stakePoolId.toBuffer(),
        id.toArrayLike(Buffer, "le", 1),
        new anchor_1.BN(duration).toArrayLike(Buffer, "le", 1),
    ], _1.REWARD_DISTRIBUTOR_ADDRESS)[0];
};
exports.findRewardDistributorId = findRewardDistributorId;
/**
 * Finds the reward distributor id.
 * @returns
 */
const findRewardAuthority = (authority) => {
    return web3_js_1.PublicKey.findProgramAddressSync([anchor_1.utils.bytes.utf8.encode(_1.REWARD_AUTHORITY_SEED), authority.toBuffer()], _1.REWARD_DISTRIBUTOR_ADDRESS)[0];
};
exports.findRewardAuthority = findRewardAuthority;
//# sourceMappingURL=pda.js.map