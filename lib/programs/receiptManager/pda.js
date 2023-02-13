"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRewardReceiptId = exports.findReceiptEntryId = exports.findReceiptManagerId = void 0;
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const _1 = require(".");
/**
 * Finds the reward receipt manager id.
 * @returns
 */
const findReceiptManagerId = (stakePoolId, name) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        anchor_1.utils.bytes.utf8.encode(_1.RECEIPT_MANAGER_SEED),
        stakePoolId.toBuffer(),
        anchor_1.utils.bytes.utf8.encode(name),
    ], _1.RECEIPT_MANAGER_ADDRESS)[0];
};
exports.findReceiptManagerId = findReceiptManagerId;
/**
 * Finds the reward receipt manager id.
 * @returns
 */
const findReceiptEntryId = (stakeEntry) => {
    return web3_js_1.PublicKey.findProgramAddressSync([anchor_1.utils.bytes.utf8.encode(_1.RECEIPT_ENTRY_SEED), stakeEntry.toBuffer()], _1.RECEIPT_MANAGER_ADDRESS)[0];
};
exports.findReceiptEntryId = findReceiptEntryId;
/**
 * Finds the reward receipt id.
 * @returns
 */
const findRewardReceiptId = (receiptManager, receiptEntry) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        anchor_1.utils.bytes.utf8.encode(_1.REWARD_RECEIPT_SEED),
        receiptManager.toBuffer(),
        receiptEntry.toBuffer(),
    ], _1.RECEIPT_MANAGER_ADDRESS)[0];
};
exports.findRewardReceiptId = findRewardReceiptId;
//# sourceMappingURL=pda.js.map