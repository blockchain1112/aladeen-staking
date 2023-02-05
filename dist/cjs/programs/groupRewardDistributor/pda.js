"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findGroupRewardDistributorId = exports.findGroupRewardCounterId = exports.findGroupRewardEntryId = void 0;
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("./constants");
/**
 * Finds the group reward entry id.
 * @returns
 */
const findGroupRewardEntryId = (groupRewardDistributorId, groupEntryId) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        anchor_1.utils.bytes.utf8.encode(constants_1.GROUP_REWARD_ENTRY_SEED),
        groupRewardDistributorId.toBuffer(),
        groupEntryId.toBuffer(),
    ], constants_1.GROUP_REWARD_DISTRIBUTOR_ADDRESS)[0];
};
exports.findGroupRewardEntryId = findGroupRewardEntryId;
/**
 * Finds the group reward entry id.
 * @returns
 */
const findGroupRewardCounterId = (groupRewardDistributorId, authority) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        anchor_1.utils.bytes.utf8.encode(constants_1.GROUP_REWARD_COUNTER_SEED),
        groupRewardDistributorId.toBuffer(),
        authority.toBuffer(),
    ], constants_1.GROUP_REWARD_DISTRIBUTOR_ADDRESS)[0];
};
exports.findGroupRewardCounterId = findGroupRewardCounterId;
/**
 * Finds the group reward distributor id.
 * @returns
 */
const findGroupRewardDistributorId = (id) => {
    return web3_js_1.PublicKey.findProgramAddressSync([anchor_1.utils.bytes.utf8.encode(constants_1.GROUP_REWARD_DISTRIBUTOR_SEED), id.toBuffer()], constants_1.GROUP_REWARD_DISTRIBUTOR_ADDRESS)[0];
};
exports.findGroupRewardDistributorId = findGroupRewardDistributorId;
//# sourceMappingURL=pda.js.map