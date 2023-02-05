"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClaimedRewards = exports.getUnclaimedRewards = exports.getActiveStakeSeconds = exports.getTotalStakeSeconds = exports.findStakeEntryIdFromMint = exports.withRemainingAccountsForUnstake = exports.remainingAccountsForInitStakeEntry = void 0;
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const rewardDistributor_1 = require("../rewardDistributor");
const pda_1 = require("../rewardDistributor/pda");
const _1 = require(".");
const pda_2 = require("./pda");
const remainingAccountsForInitStakeEntry = (stakePoolId, originalMintId) => {
    const stakeAuthorizationRecordId = (0, pda_2.findStakeAuthorizationId)(stakePoolId, originalMintId);
    return [
        {
            pubkey: stakeAuthorizationRecordId,
            isSigner: false,
            isWritable: false,
        },
    ];
};
exports.remainingAccountsForInitStakeEntry = remainingAccountsForInitStakeEntry;
const withRemainingAccountsForUnstake = async (transaction, connection, wallet, stakeEntryId, receiptMint) => {
    if (receiptMint) {
        const stakeEntryReceiptMintTokenAccount = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, receiptMint, stakeEntryId, wallet.publicKey, true);
        return [
            {
                pubkey: stakeEntryReceiptMintTokenAccount,
                isSigner: false,
                isWritable: false,
            },
        ];
    }
    else {
        return [];
    }
};
exports.withRemainingAccountsForUnstake = withRemainingAccountsForUnstake;
/**
 * Convenience method to find the stake entry id from a mint
 * NOTE: This will lookup the mint on-chain to get the supply
 * @returns
 */
const findStakeEntryIdFromMint = async (stakePoolId, originalMintId) => {
    return (0, pda_2.findStakeEntryId)(stakePoolId, originalMintId);
};
exports.findStakeEntryIdFromMint = findStakeEntryIdFromMint;
const getTotalStakeSeconds = async (connection, stakeEntryId) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const provider = new anchor_1.AnchorProvider(connection, null, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    const parsed = await stakePoolProgram.account.stakeEntry.fetch(stakeEntryId);
    return parsed.totalStakeSeconds;
};
exports.getTotalStakeSeconds = getTotalStakeSeconds;
const getActiveStakeSeconds = async (connection, stakeEntryId) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const provider = new anchor_1.AnchorProvider(connection, null, {});
    const stakePoolProgram = new anchor_1.Program(_1.STAKE_POOL_IDL, _1.STAKE_POOL_ADDRESS, provider);
    const parsed = await stakePoolProgram.account.stakeEntry.fetch(stakeEntryId);
    const UTCNow = Math.floor(Date.now() / 1000);
    const lastStakedAt = parsed.lastStakedAt.toNumber() || UTCNow;
    return parsed.lastStaker ? new anchor_1.BN(UTCNow - lastStakedAt) : new anchor_1.BN(0);
};
exports.getActiveStakeSeconds = getActiveStakeSeconds;
const getUnclaimedRewards = async (connection, stakePoolId, distributorId) => {
    var _a;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const provider = new anchor_1.AnchorProvider(connection, null, {});
    const rewardDistributor = new anchor_1.Program(rewardDistributor_1.REWARD_DISTRIBUTOR_IDL, rewardDistributor_1.REWARD_DISTRIBUTOR_ADDRESS, provider);
    const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, distributorId);
    const parsed = await rewardDistributor.account.rewardDistributor.fetch(rewardDistributorId);
    return parsed.maxSupply
        ? new anchor_1.BN(((_a = parsed.maxSupply) === null || _a === void 0 ? void 0 : _a.toNumber()) - parsed.rewardsIssued.toNumber())
        : new anchor_1.BN(0);
};
exports.getUnclaimedRewards = getUnclaimedRewards;
const getClaimedRewards = async (connection, stakePoolId, distributorId) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const provider = new anchor_1.AnchorProvider(connection, null, {});
    const rewardDistributor = new anchor_1.Program(rewardDistributor_1.REWARD_DISTRIBUTOR_IDL, rewardDistributor_1.REWARD_DISTRIBUTOR_ADDRESS, provider);
    const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, distributorId);
    const parsed = await rewardDistributor.account.rewardDistributor.fetch(rewardDistributorId);
    return parsed.rewardsIssued;
};
exports.getClaimedRewards = getClaimedRewards;
//# sourceMappingURL=utils.js.map