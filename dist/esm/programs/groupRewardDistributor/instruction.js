import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { GROUP_REWARD_MANAGER, GroupRewardDistributorKind, groupRewardDistributorProgram, } from "./constants";
import { findGroupRewardDistributorId } from "./pda";
import { withRemainingAccountsForRewardKind } from "./utils";
export const initGroupRewardDistributor = async (connection, wallet, params) => {
    const program = groupRewardDistributorProgram(connection, wallet);
    const signers = [];
    const id = Keypair.generate();
    signers.push(id);
    const groupRewardDistributorId = findGroupRewardDistributorId(id.publicKey);
    const transaction = new Transaction();
    const remainingAccountsForKind = await withRemainingAccountsForRewardKind(transaction, connection, wallet, groupRewardDistributorId, params.rewardKind || GroupRewardDistributorKind.Mint, params.rewardMintId);
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
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
    })
        .remainingAccounts(remainingAccountsForKind)
        .instruction();
    transaction.add(instruction);
    return [transaction, groupRewardDistributorId];
};
export const initGroupRewardCounter = async (connection, wallet, params) => {
    const program = groupRewardDistributorProgram(connection, wallet);
    return program.methods
        .initGroupRewardCounter()
        .accounts({
        groupRewardCounter: params.groupRewardCounterId,
        groupRewardDistributor: params.groupRewardDistributorId,
        authority: params.authority,
        systemProgram: SystemProgram.programId,
    })
        .transaction();
};
export const initGroupRewardEntry = (connection, wallet, params) => {
    var _a;
    const program = groupRewardDistributorProgram(connection, wallet);
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
        systemProgram: SystemProgram.programId,
    })
        .remainingAccounts(remainingAccounts)
        .transaction();
};
export const claimGroupRewards = (connection, wallet, params) => {
    var _a;
    const program = groupRewardDistributorProgram(connection, wallet);
    return program.methods
        .claimGroupRewards()
        .accounts({
        groupEntry: params.groupEntryId,
        groupRewardEntry: params.groupRewardEntryId,
        groupRewardDistributor: params.groupRewardDistributorId,
        groupRewardCounter: params.groupRewardCounterId,
        rewardMint: params.rewardMintId,
        userRewardMintTokenAccount: params.userRewardMintTokenAccount,
        rewardManager: GROUP_REWARD_MANAGER,
        authority: (_a = params.authority) !== null && _a !== void 0 ? _a : wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
    })
        .remainingAccounts(params.remainingAccountsForKind)
        .transaction();
};
export const closeGroupRewardDistributor = async (connection, wallet, params) => {
    const program = groupRewardDistributorProgram(connection, wallet);
    return program.methods
        .closeGroupRewardDistributor()
        .accounts({
        groupRewardDistributor: params.groupRewardDistributorId,
        rewardMint: params.rewardMintId,
        authority: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
    })
        .remainingAccounts(params.remainingAccountsForKind)
        .transaction();
};
export const updateGroupRewardEntry = async (connection, wallet, params) => {
    const program = groupRewardDistributorProgram(connection, wallet);
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
export const closeGroupRewardEntry = async (connection, wallet, params) => {
    const program = groupRewardDistributorProgram(connection, wallet);
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
export const closeGroupRewardCounter = async (connection, wallet, params) => {
    const program = groupRewardDistributorProgram(connection, wallet);
    return program.methods
        .closeGroupRewardCounter()
        .accounts({
        groupRewardCounter: params.groupRewardCounterId,
        groupRewardDistributor: params.groupRewardDistributorId,
        authority: params.authority,
    })
        .transaction();
};
export const updateGroupRewardDistributor = (connection, wallet, params) => {
    const program = groupRewardDistributorProgram(connection, wallet);
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
export const reclaimGroupFunds = (connection, wallet, params) => {
    const program = groupRewardDistributorProgram(connection, wallet);
    return program.methods
        .reclaimGroupFunds(params.amount)
        .accounts({
        groupRewardDistributor: params.groupRewardDistributorId,
        groupRewardDistributorTokenAccount: params.groupRewardDistributorTokenAccountId,
        authorityTokenAccount: params.authorityTokenAccountId,
        authority: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
    })
        .transaction();
};
//# sourceMappingURL=instruction.js.map