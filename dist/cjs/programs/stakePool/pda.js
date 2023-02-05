"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findGroupEntryId = exports.findStakeBoosterId = exports.findStakeAuthorizationId = exports.findIdentifierId = exports.findStakeEntryId = exports.findStakePoolId = void 0;
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const _1 = require(".");
const constants_1 = require("./constants");
/**
 * Finds the stake pool id.
 * @returns
 */
const findStakePoolId = (identifier) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        anchor_1.utils.bytes.utf8.encode(_1.STAKE_POOL_SEED),
        identifier.toArrayLike(Buffer, "le", 8),
    ], _1.STAKE_POOL_ADDRESS)[0];
};
exports.findStakePoolId = findStakePoolId;
/**
 * Convenience method to find the stake entry id.
 * @returns
 */
const findStakeEntryId = (_wallet, stakePoolId, originalMintId, _isFungible = false) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        anchor_1.utils.bytes.utf8.encode(_1.STAKE_ENTRY_SEED),
        stakePoolId.toBuffer(),
        originalMintId.toBuffer(),
    ], _1.STAKE_POOL_ADDRESS)[0];
};
exports.findStakeEntryId = findStakeEntryId;
/**
 * Finds the identifier id.
 * @returns
 */
const findIdentifierId = () => {
    return web3_js_1.PublicKey.findProgramAddressSync([anchor_1.utils.bytes.utf8.encode(constants_1.IDENTIFIER_SEED)], _1.STAKE_POOL_ADDRESS)[0];
};
exports.findIdentifierId = findIdentifierId;
/**
 * Find stake authorization id.
 * @returns
 */
const findStakeAuthorizationId = (stakePoolId, mintId) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        anchor_1.utils.bytes.utf8.encode(constants_1.STAKE_AUTHORIZATION_SEED),
        stakePoolId.toBuffer(),
        mintId.toBuffer(),
    ], _1.STAKE_POOL_ADDRESS)[0];
};
exports.findStakeAuthorizationId = findStakeAuthorizationId;
/**
 * Find stake booster id.
 * @returns
 */
const findStakeBoosterId = (stakePoolId, identifier) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        anchor_1.utils.bytes.utf8.encode(constants_1.STAKE_BOOSTER_SEED),
        stakePoolId.toBuffer(),
        (identifier !== null && identifier !== void 0 ? identifier : new anchor_1.BN(0)).toArrayLike(Buffer, "le", 8),
    ], _1.STAKE_POOL_ADDRESS)[0];
};
exports.findStakeBoosterId = findStakeBoosterId;
/**
 * Convenience method to find the stake entry id.
 * @returns
 */
const findGroupEntryId = (id) => {
    return web3_js_1.PublicKey.findProgramAddressSync([anchor_1.utils.bytes.utf8.encode(constants_1.GROUP_ENTRY_SEED), id.toBuffer()], _1.STAKE_POOL_ADDRESS)[0];
};
exports.findGroupEntryId = findGroupEntryId;
//# sourceMappingURL=pda.js.map