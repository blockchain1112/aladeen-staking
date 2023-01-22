"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCloseGroupRewardCounter = exports.withReclaimGroupFunds = exports.withUpdateGroupRewardDistributor = exports.withCloseGroupRewardEntry = exports.withUpdateGroupRewardEntry = exports.withCloseGroupRewardDistributor = exports.withClaimGroupRewards = exports.withInitGroupRewardEntry = exports.withInitGroupRewardDistributor = void 0;
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const pda_1 = require("../rewardDistributor/pda");
const accounts_1 = require("./accounts");
const constants_1 = require("./constants");
const instruction_1 = require("./instruction");
const pda_2 = require("./pda");
const utils_1 = require("./utils");
const withInitGroupRewardDistributor = async (transaction, connection, wallet, params) => {
    const [tx, groupRewardDistributorId] = await (0, instruction_1.initGroupRewardDistributor)(connection, wallet, {
        rewardAmount: params.rewardAmount || new anchor_1.BN(1),
        rewardDurationSeconds: params.rewardDurationSeconds || new anchor_1.BN(1),
        rewardKind: params.rewardKind || constants_1.GroupRewardDistributorKind.Mint,
        metadataKind: params.metadataKind || constants_1.GroupRewardDistributorMetadataKind.NoRestriction,
        poolKind: params.poolKind || constants_1.GroupRewardDistributorPoolKind.NoRestriction,
        authorizedPools: params.authorizedPools,
        supply: params.supply,
        baseAdder: params.baseAdder,
        baseAdderDecimals: params.baseAdderDecimals,
        baseMultiplier: params.baseMultiplier,
        baseMultiplierDecimals: params.baseMultiplierDecimals,
        multiplierDecimals: params.multiplierDecimals,
        maxSupply: params.maxSupply,
        minCooldownSeconds: params.minCooldownSeconds,
        minStakeSeconds: params.minStakeSeconds,
        groupCountMultiplier: params.groupCountMultiplier,
        groupCountMultiplierDecimals: params.groupCountMultiplierDecimals,
        minGroupSize: params.minGroupSize,
        maxRewardSecondsReceived: params.maxRewardSecondsReceived,
        rewardMintId: params.rewardMintId,
    });
    transaction.add(tx);
    return [transaction, groupRewardDistributorId];
};
exports.withInitGroupRewardDistributor = withInitGroupRewardDistributor;
const withInitGroupRewardEntry = async (transaction, connection, wallet, params) => {
    const groupRewardEntryId = (0, pda_2.findGroupRewardEntryId)(params.groupRewardDistributorId, params.groupEntryId);
    const groupRewardCounterId = (0, pda_2.findGroupRewardCounterId)(params.groupRewardDistributorId, wallet.publicKey);
    const groupRewardCounter = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getGroupRewardCounter)(connection, groupRewardCounterId));
    if (!groupRewardCounter) {
        transaction.add(await (0, instruction_1.initGroupRewardCounter)(connection, wallet, {
            groupRewardCounterId,
            groupRewardDistributorId: params.groupRewardDistributorId,
            authority: wallet.publicKey,
        }));
    }
    const stakeEntries = params.stakeEntries.map(({ stakeEntryId, originalMint, rewardDistributorId }) => {
        const rewardEntryId = (0, pda_1.findRewardEntryId)(rewardDistributorId, stakeEntryId);
        const originalMintMetadata = (0, common_1.findMintMetadataId)(originalMint);
        return {
            stakeEntryId,
            originalMint,
            originalMintMetadata,
            rewardEntryId,
        };
    });
    transaction.add(await (0, instruction_1.initGroupRewardEntry)(connection, wallet, {
        groupRewardDistributorId: params.groupRewardDistributorId,
        groupEntryId: params.groupEntryId,
        groupRewardCounterId,
        groupRewardEntryId,
        stakeEntries,
    }));
    return [transaction, groupRewardEntryId];
};
exports.withInitGroupRewardEntry = withInitGroupRewardEntry;
const withClaimGroupRewards = async (transaction, connection, wallet, params) => {
    const groupRewardDistributorData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getGroupRewardDistributor)(connection, params.groupRewardDistributorId));
    if (groupRewardDistributorData) {
        const userRewardMintTokenAccount = params.skipGroupRewardMintTokenAccount
            ? await (0, common_1.findAta)(groupRewardDistributorData.parsed.rewardMint, wallet.publicKey, true)
            : await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, groupRewardDistributorData.parsed.rewardMint, wallet.publicKey, wallet.publicKey);
        const remainingAccountsForKind = await (0, utils_1.withRemainingAccountsForRewardKind)(transaction, connection, wallet, groupRewardDistributorData.pubkey, (0, constants_1.toGroupRewardDistributorKind)(groupRewardDistributorData.parsed.rewardKind), groupRewardDistributorData.parsed.rewardMint, true);
        const groupRewardEntryId = (0, pda_2.findGroupRewardEntryId)(groupRewardDistributorData.pubkey, params.groupEntryId);
        const groupRewardCounterId = (0, pda_2.findGroupRewardCounterId)(groupRewardDistributorData.pubkey, wallet.publicKey);
        transaction.add(await (0, instruction_1.claimGroupRewards)(connection, wallet, {
            groupEntryId: params.groupEntryId,
            groupRewardDistributorId: params.groupRewardDistributorId,
            groupRewardEntryId,
            groupRewardCounterId,
            userRewardMintTokenAccount,
            authority: wallet.publicKey,
            rewardMintId: groupRewardDistributorData.parsed.rewardMint,
            remainingAccountsForKind,
        }));
    }
    return transaction;
};
exports.withClaimGroupRewards = withClaimGroupRewards;
const withCloseGroupRewardDistributor = async (transaction, connection, wallet, params) => {
    const groupRewardDistributorData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getGroupRewardDistributor)(connection, params.groupRewardDistributorId));
    if (groupRewardDistributorData) {
        const remainingAccountsForKind = await (0, utils_1.withRemainingAccountsForRewardKind)(transaction, connection, wallet, groupRewardDistributorData.pubkey, (0, constants_1.toGroupRewardDistributorKind)(groupRewardDistributorData.parsed.rewardKind), groupRewardDistributorData.parsed.rewardMint);
        transaction.add(await (0, instruction_1.closeGroupRewardDistributor)(connection, wallet, {
            groupRewardDistributorId: params.groupRewardDistributorId,
            rewardMintId: groupRewardDistributorData.parsed.rewardMint,
            remainingAccountsForKind,
        }));
    }
    return transaction;
};
exports.withCloseGroupRewardDistributor = withCloseGroupRewardDistributor;
const withUpdateGroupRewardEntry = async (transaction, connection, wallet, params) => {
    return transaction.add(await (0, instruction_1.updateGroupRewardEntry)(connection, wallet, {
        groupRewardDistributorId: params.groupRewardDistributorId,
        groupRewardEntryId: params.groupRewardEntryId,
        multiplier: params.multiplier,
    }));
};
exports.withUpdateGroupRewardEntry = withUpdateGroupRewardEntry;
const withCloseGroupRewardEntry = async (transaction, connection, wallet, params) => {
    const groupRewardEntryId = (0, pda_2.findGroupRewardEntryId)(params.groupRewardDistributorId, params.groupEntryId);
    const groupRewardCounterId = (0, pda_2.findGroupRewardCounterId)(params.groupRewardDistributorId, wallet.publicKey);
    return transaction.add(await (0, instruction_1.closeGroupRewardEntry)(connection, wallet, {
        groupEntryId: params.groupEntryId,
        groupRewardDistributorId: params.groupRewardDistributorId,
        groupRewardEntryId,
        groupRewardCounterId,
    }));
};
exports.withCloseGroupRewardEntry = withCloseGroupRewardEntry;
const withUpdateGroupRewardDistributor = async (transaction, connection, wallet, params) => {
    return transaction.add(await (0, instruction_1.updateGroupRewardDistributor)(connection, wallet, {
        groupRewardDistributorId: params.groupRewardDistributorId,
        rewardAmount: params.rewardAmount || new anchor_1.BN(1),
        rewardDurationSeconds: params.rewardDurationSeconds || new anchor_1.BN(1),
        metadataKind: params.metadataKind || constants_1.GroupRewardDistributorMetadataKind.NoRestriction,
        poolKind: params.poolKind || constants_1.GroupRewardDistributorPoolKind.NoRestriction,
        authorizedPools: params.authorizedPools,
        baseAdder: params.baseAdder,
        baseAdderDecimals: params.baseAdderDecimals,
        baseMultiplier: params.baseMultiplier,
        baseMultiplierDecimals: params.baseMultiplierDecimals,
        multiplierDecimals: params.multiplierDecimals,
        maxSupply: params.maxSupply,
        minCooldownSeconds: params.minCooldownSeconds,
        minStakeSeconds: params.minStakeSeconds,
        groupCountMultiplier: params.groupCountMultiplier,
        groupCountMultiplierDecimals: params.groupCountMultiplierDecimals,
        minGroupSize: params.minGroupSize,
        maxRewardSecondsReceived: params.maxRewardSecondsReceived,
    }));
};
exports.withUpdateGroupRewardDistributor = withUpdateGroupRewardDistributor;
const withReclaimGroupFunds = async (transaction, connection, wallet, params) => {
    const groupRewardDistributorData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getGroupRewardDistributor)(connection, params.groupRewardDistributorId));
    if (!groupRewardDistributorData) {
        throw new Error("No reward distrbutor found");
    }
    const groupRewardDistributorTokenAccountId = await (0, common_1.findAta)(groupRewardDistributorData.parsed.rewardMint, groupRewardDistributorData.pubkey, true);
    const authorityTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, groupRewardDistributorData.parsed.rewardMint, wallet.publicKey, wallet.publicKey, true);
    return transaction.add(await (0, instruction_1.reclaimGroupFunds)(connection, wallet, {
        groupRewardDistributorId: params.groupRewardDistributorId,
        groupRewardDistributorTokenAccountId,
        authorityTokenAccountId,
        authority: wallet.publicKey,
        amount: params.amount,
    }));
};
exports.withReclaimGroupFunds = withReclaimGroupFunds;
const withCloseGroupRewardCounter = async (transaction, connection, wallet, params) => {
    const groupRewardCounterId = (0, pda_2.findGroupRewardCounterId)(params.groupRewardDistributorId, wallet.publicKey);
    transaction.add(await (0, instruction_1.closeGroupRewardCounter)(connection, wallet, {
        groupRewardDistributorId: params.groupRewardDistributorId,
        groupRewardCounterId,
        authority: wallet.publicKey,
    }));
    return [transaction];
};
exports.withCloseGroupRewardCounter = withCloseGroupRewardCounter;
//# sourceMappingURL=transaction.js.map