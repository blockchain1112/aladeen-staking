"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reclaimGroupFunds = exports.updateGroupRewardDistributor = exports.closeGroupRewardCounter = exports.closeGroupRewardEntry = exports.updateGroupRewardEntry = exports.closeGroupRewardDistributor = exports.claimGroupRewards = exports.initGroupRewardEntry = exports.initGroupRewardCounter = exports.initGroupRewardDistributor = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("./constants");
const pda_1 = require("./pda");
const utils_1 = require("./utils");
const initGroupRewardDistributor = async (connection, wallet, params) => {
    const program = (0, constants_1.groupRewardDistributorProgram)(connection, wallet);
    const signers = [];
    const id = web3_js_1.Keypair.generate();
    signers.push(id);
    const groupRewardDistributorId = (0, pda_1.findGroupRewardDistributorId)(id.publicKey);
    const transaction = new web3_js_1.Transaction();
    const remainingAccountsForKind = await (0, utils_1.withRemainingAccountsForRewardKind)(transaction, connection, wallet, groupRewardDistributorId, params.rewardKind || constants_1.GroupRewardDistributorKind.Mint, params.rewardMintId);
    const instruction = await program.methods
        .initGroupRewardDistributor({
        id: id.publicKey,
        rewardAmount: params.rewardAmount,
        rewardDurationSeconds: params.rewardDurationSeconds,
        rewardKind: params.rewardKind,
        metadataKind: params.metadataKind,
        poolKind: params.poolKind,
        authorizedPools: params.authorizedPools,
        supply: params.supply || null,
        baseAdder: params.baseAdder || null,
        baseAdderDecimals: params.baseAdderDecimals || null,
        baseMultiplier: params.baseMultiplier || null,
        baseMultiplierDecimals: params.baseMultiplierDecimals || null,
        multiplierDecimals: params.multiplierDecimals || null,
        maxSupply: params.maxSupply || null,
        minCooldownSeconds: params.minCooldownSeconds || null,
        minStakeSeconds: params.minStakeSeconds || null,
        groupCountMultiplier: params.groupCountMultiplier || null,
        groupCountMultiplierDecimals: params.groupCountMultiplierDecimals || null,
        minGroupSize: params.minGroupSize || null,
        maxRewardSecondsReceived: params.maxRewardSecondsReceived || null,
    })
        .accounts({
        groupRewardDistributor: groupRewardDistributorId,
        rewardMint: params.rewardMintId,
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .remainingAccounts(remainingAccountsForKind)
        .instruction();
    transaction.add(instruction);
    return [transaction, groupRewardDistributorId];
};
exports.initGroupRewardDistributor = initGroupRewardDistributor;
const initGroupRewardCounter = async (connection, wallet, params) => {
    const program = (0, constants_1.groupRewardDistributorProgram)(connection, wallet);
    return program.methods
        .initGroupRewardCounter()
        .accounts({
        groupRewardCounter: params.groupRewardCounterId,
        groupRewardDistributor: params.groupRewardDistributorId,
        authority: params.authority,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .transaction();
};
exports.initGroupRewardCounter = initGroupRewardCounter;
const initGroupRewardEntry = (connection, wallet, params) => {
    var _a;
    const program = (0, constants_1.groupRewardDistributorProgram)(connection, wallet);
    const remainingAccounts = [];
    params.stakeEntries.forEach(({ stakeEntryId, originalMint, originalMintMetadata, rewardEntryId }) => {
        remainingAccounts.push({
            pubkey: stakeEntryId,
            isSigner: false,
            isWritable: false,
        }, {
            pubkey: originalMint,
            isSigner: false,
            isWritable: false,
        }, {
            pubkey: originalMintMetadata,
            isSigner: false,
            isWritable: false,
        }, {
            pubkey: rewardEntryId,
            isSigner: false,
            isWritable: false,
        });
    });
    return program.methods
        .initGroupRewardEntry()
        .accounts({
        groupEntry: params.groupEntryId,
        groupRewardDistributor: params.groupRewardDistributorId,
        groupRewardEntry: params.groupRewardEntryId,
        groupRewardCounter: params.groupRewardCounterId,
        authority: (_a = params.authority) !== null && _a !== void 0 ? _a : wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .remainingAccounts(remainingAccounts)
        .transaction();
};
exports.initGroupRewardEntry = initGroupRewardEntry;
const claimGroupRewards = (connection, wallet, params) => {
    var _a;
    const program = (0, constants_1.groupRewardDistributorProgram)(connection, wallet);
    return program.methods
        .claimGroupRewards()
        .accounts({
        groupEntry: params.groupEntryId,
        groupRewardEntry: params.groupRewardEntryId,
        groupRewardDistributor: params.groupRewardDistributorId,
        groupRewardCounter: params.groupRewardCounterId,
        rewardMint: params.rewardMintId,
        userRewardMintTokenAccount: params.userRewardMintTokenAccount,
        rewardManager: constants_1.GROUP_REWARD_MANAGER,
        authority: (_a = params.authority) !== null && _a !== void 0 ? _a : wallet.publicKey,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .remainingAccounts(params.remainingAccountsForKind)
        .transaction();
};
exports.claimGroupRewards = claimGroupRewards;
const closeGroupRewardDistributor = async (connection, wallet, params) => {
    const program = (0, constants_1.groupRewardDistributorProgram)(connection, wallet);
    return program.methods
        .closeGroupRewardDistributor()
        .accounts({
        groupRewardDistributor: params.groupRewardDistributorId,
        rewardMint: params.rewardMintId,
        authority: wallet.publicKey,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
    })
        .remainingAccounts(params.remainingAccountsForKind)
        .transaction();
};
exports.closeGroupRewardDistributor = closeGroupRewardDistributor;
const updateGroupRewardEntry = async (connection, wallet, params) => {
    const program = (0, constants_1.groupRewardDistributorProgram)(connection, wallet);
    return program.methods
        .updateGroupRewardEntry({
        multiplier: params.multiplier,
    })
        .accounts({
        groupRewardDistributor: params.groupRewardDistributorId,
        groupRewardEntry: params.groupRewardEntryId,
        authority: wallet.publicKey,
    })
        .transaction();
};
exports.updateGroupRewardEntry = updateGroupRewardEntry;
const closeGroupRewardEntry = async (connection, wallet, params) => {
    const program = (0, constants_1.groupRewardDistributorProgram)(connection, wallet);
    return program.methods
        .closeGroupRewardEntry()
        .accounts({
        groupEntry: params.groupEntryId,
        groupRewardEntry: params.groupRewardEntryId,
        authority: wallet.publicKey,
        groupRewardDistributor: params.groupRewardDistributorId,
        groupRewardCounter: params.groupRewardCounterId,
    })
        .transaction();
};
exports.closeGroupRewardEntry = closeGroupRewardEntry;
const closeGroupRewardCounter = async (connection, wallet, params) => {
    const program = (0, constants_1.groupRewardDistributorProgram)(connection, wallet);
    return program.methods
        .closeGroupRewardCounter()
        .accounts({
        groupRewardCounter: params.groupRewardCounterId,
        groupRewardDistributor: params.groupRewardDistributorId,
        authority: params.authority,
    })
        .transaction();
};
exports.closeGroupRewardCounter = closeGroupRewardCounter;
const updateGroupRewardDistributor = (connection, wallet, params) => {
    const program = (0, constants_1.groupRewardDistributorProgram)(connection, wallet);
    return program.methods
        .updateGroupRewardDistributor({
        rewardAmount: params.rewardAmount,
        rewardDurationSeconds: params.rewardDurationSeconds,
        metadataKind: params.metadataKind,
        poolKind: params.poolKind,
        authorizedPools: params.authorizedPools,
        baseAdder: params.baseAdder || null,
        baseAdderDecimals: params.baseAdderDecimals || null,
        baseMultiplier: params.baseMultiplier || null,
        baseMultiplierDecimals: params.baseMultiplierDecimals || null,
        multiplierDecimals: params.multiplierDecimals || null,
        maxSupply: params.maxSupply || null,
        minCooldownSeconds: params.minCooldownSeconds || null,
        minStakeSeconds: params.minStakeSeconds || null,
        groupCountMultiplier: params.groupCountMultiplier || null,
        groupCountMultiplierDecimals: params.groupCountMultiplierDecimals || null,
        minGroupSize: params.minGroupSize || null,
        maxRewardSecondsReceived: params.maxRewardSecondsReceived || null,
    })
        .accounts({
        groupRewardDistributor: params.groupRewardDistributorId,
        authority: wallet.publicKey,
    })
        .transaction();
};
exports.updateGroupRewardDistributor = updateGroupRewardDistributor;
const reclaimGroupFunds = (connection, wallet, params) => {
    const program = (0, constants_1.groupRewardDistributorProgram)(connection, wallet);
    return program.methods
        .reclaimGroupFunds(params.amount)
        .accounts({
        groupRewardDistributor: params.groupRewardDistributorId,
        groupRewardDistributorTokenAccount: params.groupRewardDistributorTokenAccountId,
        authorityTokenAccount: params.authorityTokenAccountId,
        authority: wallet.publicKey,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
    })
        .transaction();
};
exports.reclaimGroupFunds = reclaimGroupFunds;
//# sourceMappingURL=instruction.js.map