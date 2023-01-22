"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRewardDistributorId = exports.findRewardEntryId = void 0;
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const _1 = require(".");
/**
 * Finds the reward entry id.
 * @returns
 */
const findRewardEntryId = (rewardDistributorId, stakeEntryId) => {
  return web3_js_1.PublicKey.findProgramAddressSync(
    [
      anchor_1.utils.bytes.utf8.encode(_1.REWARD_ENTRY_SEED),
      rewardDistributorId.toBuffer(),
      stakeEntryId.toBuffer(),
    ],
    _1.REWARD_DISTRIBUTOR_ADDRESS
  )[0];
};
exports.findRewardEntryId = findRewardEntryId;
/**
 * Finds the reward distributor id.
 * @returns
 */
const findRewardDistributorId = (stakePoolId) => {
  return web3_js_1.PublicKey.findProgramAddressSync(
    [
      anchor_1.utils.bytes.utf8.encode(_1.REWARD_DISTRIBUTOR_SEED),
      stakePoolId.toBuffer(),
    ],
    _1.REWARD_DISTRIBUTOR_ADDRESS
  )[0];
};
exports.findRewardDistributorId = findRewardDistributorId;
//# sourceMappingURL=pda.js.map
